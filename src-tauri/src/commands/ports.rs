use crate::models::{HttpHealth, PortInfo};
use netstat2::*;
use std::collections::{HashMap, HashSet};
use std::time::Instant;
use sysinfo::{Pid, System};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use tokio::time::{timeout, Duration};

fn categorize_port(port: u16, process_name: &str) -> String {
    let name_lower = process_name.to_lowercase();
    if name_lower.contains("node")
        || name_lower.contains("vite")
        || name_lower.contains("next")
        || name_lower.contains("python")
        || name_lower.contains("ruby")
        || name_lower.contains("java")
        || [3000, 5173, 8000, 8080, 8888, 4200, 5000, 80, 443].contains(&port)
    {
        "web".to_string()
    } else if name_lower.contains("postgres")
        || name_lower.contains("mysql")
        || name_lower.contains("mongo")
        || [5432, 3306, 27017, 1433, 9042].contains(&port)
    {
        "database".to_string()
    } else if name_lower.contains("redis")
        || name_lower.contains("memcached")
        || [6379, 11211].contains(&port)
    {
        "cache".to_string()
    } else {
        "other".to_string()
    }
}

#[tauri::command]
pub async fn check_port_health(port: u16) -> Result<Option<HttpHealth>, String> {
    let start = Instant::now();
    let addr = format!("127.0.0.1:{}", port);

    let stream_result = timeout(Duration::from_millis(600), TcpStream::connect(&addr)).await;
    let mut stream = match stream_result {
        Ok(Ok(s)) => s,
        _ => return Ok(None),
    };

    let request = format!(
        "HEAD / HTTP/1.1\r\nHost: localhost:{}\r\nUser-Agent: DockTray-Probe\r\nConnection: close\r\n\r\n",
        port
    );

    if (stream.write_all(request.as_bytes()).await).is_err() {
        return Ok(None);
    }

    let mut buf = [0u8; 512];
    let read_result = timeout(Duration::from_millis(600), stream.read(&mut buf)).await;
    let bytes_read = match read_result {
        Ok(Ok(n)) if n > 0 => n,
        _ => return Ok(None),
    };

    let response = String::from_utf8_lossy(&buf[..bytes_read]);
    let first_line = response.lines().next().unwrap_or_default();

    // Parse HTTP/1.1 200 OK
    let parts: Vec<&str> = first_line.split_whitespace().collect();
    if parts.len() >= 2 {
        if let Ok(code) = parts[1].parse::<u16>() {
            let status_text = parts.get(2).copied().unwrap_or("OK").to_string();
            let latency_ms = start.elapsed().as_millis() as u64;

            return Ok(Some(HttpHealth {
                status: code,
                status_text,
                latency_ms,
                checked_at: "Just now".to_string(),
            }));
        }
    }

    Ok(None)
}

#[tauri::command]
pub async fn get_listening_ports() -> Result<Vec<PortInfo>, String> {
    tokio::task::spawn_blocking(|| {
        let mut sys = System::new_all();
        sys.refresh_all();

        // Build parent-child relationships
        let mut parent_to_children: HashMap<u32, Vec<u32>> = HashMap::new();
        for (pid, proc) in sys.processes() {
            if let Some(parent_pid) = proc.parent() {
                parent_to_children
                    .entry(parent_pid.as_u32())
                    .or_default()
                    .push(pid.as_u32());
            }
        }

        let af_flags = AddressFamilyFlags::IPV4 | AddressFamilyFlags::IPV6;
        let proto_flags = ProtocolFlags::TCP | ProtocolFlags::UDP;

        let sockets = get_sockets_info(af_flags, proto_flags)
            .map_err(|e| format!("Failed to read network sockets: {}", e))?;

        let mut results = Vec::new();
        let mut seen = HashSet::new();

        for s in sockets {
            let is_listening = match &s.protocol_socket_info {
                ProtocolSocketInfo::Tcp(tcp) => tcp.state == TcpState::Listen,
                ProtocolSocketInfo::Udp(_) => true,
            };

            if !is_listening {
                continue;
            }

            let (ip, port, proto) = match &s.protocol_socket_info {
                ProtocolSocketInfo::Tcp(tcp) => (
                    tcp.local_addr.to_string(),
                    tcp.local_port,
                    "TCP".to_string(),
                ),
                ProtocolSocketInfo::Udp(udp) => (
                    udp.local_addr.to_string(),
                    udp.local_port,
                    "UDP".to_string(),
                ),
            };

            let key = (proto.clone(), port);
            if seen.contains(&key) {
                continue;
            }
            seen.insert(key);

            for pid in s.associated_pids {
                let sys_pid = Pid::from_u32(pid);
                let (proc_name, cmd_path, mem_mb, uptime, parent_pid, parent_name) =
                    if let Some(proc) = sys.process(sys_pid) {
                        let name = proc.name().to_string_lossy().to_string();
                        let exe = proc.exe().map(|p| p.to_string_lossy().to_string());
                        let mem = (proc.memory() as f64) / (1024.0 * 1024.0);
                        let run_time = proc.run_time();

                        let ppid = proc.parent().map(|p| p.as_u32());
                        let pname = ppid.and_then(|pp| sys.process(Pid::from_u32(pp)))
                            .map(|p| p.name().to_string_lossy().to_string());

                        (name, exe, mem, run_time, ppid, pname)
                    } else {
                        ("unknown".to_string(), None, 0.0, 0, None, None)
                    };

                let children = parent_to_children.get(&pid).cloned();
                let category = categorize_port(port, &proc_name);

                results.push(PortInfo {
                    port,
                    protocol: proto.clone(),
                    ip: ip.clone(),
                    pid,
                    parent_pid,
                    parent_name,
                    child_pids: children,
                    process_name: proc_name,
                    command_path: cmd_path,
                    memory_mb: mem_mb,
                    uptime_sec: uptime,
                    category,
                    pinned: None,
                    http_health: None,
                });
            }
        }

        results.sort_by_key(|p| p.port);
        Ok(results)
    })
    .await
    .map_err(|e| format!("Task execution failed: {}", e))?
}
