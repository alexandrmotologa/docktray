use std::collections::{HashSet, VecDeque};
use std::time::Duration;
use sysinfo::{Pid, System};

fn collect_descendants(root_pid: u32, sys: &System) -> Vec<u32> {
    let mut descendants = Vec::new();
    let mut queue = VecDeque::new();
    let mut visited = HashSet::new();

    queue.push_back(root_pid);
    visited.insert(root_pid);

    while let Some(current_pid) = queue.pop_front() {
        for (pid, proc) in sys.processes() {
            if let Some(parent) = proc.parent() {
                let ppid = parent.as_u32();
                if ppid == current_pid {
                    let child_pid = pid.as_u32();
                    if !visited.contains(&child_pid) {
                        visited.insert(child_pid);
                        descendants.push(child_pid);
                        queue.push_back(child_pid);
                    }
                }
            }
        }
    }

    descendants
}

#[tauri::command]
pub async fn kill_process(pid: u32) -> Result<bool, String> {
    tokio::task::spawn_blocking(move || {
        let sys_pid = Pid::from_u32(pid);
        let mut sys = System::new_all();
        sys.refresh_all();

        if let Some(process) = sys.process(sys_pid) {
            let killed = process.kill();
            if !killed {
                return Err(format!("Operating system refused termination for PID {}", pid));
            }

            std::thread::sleep(Duration::from_millis(200));
            sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

            Ok(sys.process(sys_pid).is_none())
        } else {
            Err(format!("Process with PID {} was not found", pid))
        }
    })
    .await
    .map_err(|e| format!("Process termination task failed: {}", e))?
}

#[tauri::command]
pub async fn kill_process_tree(pid: u32) -> Result<bool, String> {
    tokio::task::spawn_blocking(move || {
        let mut sys = System::new_all();
        sys.refresh_all();

        // 1. Collect all child & grandchild processes
        let descendants = collect_descendants(pid, &sys);

        // 2. Terminate children first in reverse order
        for child_pid in descendants.iter().rev() {
            if let Some(child_proc) = sys.process(Pid::from_u32(*child_pid)) {
                let _ = child_proc.kill();
            }
        }

        // 3. Terminate root process
        if let Some(root_proc) = sys.process(Pid::from_u32(pid)) {
            let _ = root_proc.kill();
        }

        std::thread::sleep(Duration::from_millis(250));
        sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

        // Verify root PID is gone
        Ok(sys.process(Pid::from_u32(pid)).is_none())
    })
    .await
    .map_err(|e| format!("Process tree termination failed: {}", e))?
}
