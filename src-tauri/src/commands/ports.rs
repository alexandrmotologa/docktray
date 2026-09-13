use crate::models::PortInfo;
use netstat2::*;
use std::collections::HashSet;
use sysinfo::{Pid, System};

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
pub async fn get_listening_ports() -> Result<Vec<PortInfo>, String> {
    tokio::task::spawn_blocking(|| {
        let mut sys = System::new_all();
        sys.refresh_all();

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

            // Avoid duplicate socket entries
            let key = (proto.clone(), port);
            if seen.contains(&key) {
                continue;
            }
            seen.insert(key);

            for pid in s.associated_pids {
                let sys_pid = Pid::from_u32(pid);
                let (proc_name, cmd_path, mem_mb, uptime) = if let Some(proc) = sys.process(sys_pid) {
                    let name = proc.name().to_string_lossy().to_string();
                    let exe = proc.exe().map(|p| p.to_string_lossy().to_string());
                    let mem = (proc.memory() as f64) / (1024.0 * 1024.0);
                    let run_time = proc.run_time();
                    (name, exe, mem, run_time)
                } else {
                    ("unknown".to_string(), None, 0.0, 0)
                };

                let category = categorize_port(port, &proc_name);

                results.push(PortInfo {
                    port,
                    protocol: proto.clone(),
                    ip: ip.clone(),
                    pid,
                    process_name: proc_name,
                    command_path: cmd_path,
                    memory_mb: mem_mb,
                    uptime_sec: uptime,
                    category,
                    pinned: None,
                });
            }
        }

        results.sort_by_key(|p| p.port);
        Ok(results)
    })
    .await
    .map_err(|e| format!("Task execution failed: {}", e))?
}
