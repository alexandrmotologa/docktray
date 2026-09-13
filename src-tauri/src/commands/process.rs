use sysinfo::{Pid, System};
use std::time::Duration;

#[tauri::command]
pub async fn kill_process(pid: u32) -> Result<bool, String> {
    tokio::task::spawn_blocking(move || {
        let sys_pid = Pid::from_u32(pid);
        let mut sys = System::new_all();
        sys.refresh_all();

        if let Some(process) = sys.process(sys_pid) {
            // Signal::Kill or process.kill()
            let killed = process.kill();
            if !killed {
                return Err(format!("Operating system refused termination for PID {}", pid));
            }

            // Wait briefly to confirm exit
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
