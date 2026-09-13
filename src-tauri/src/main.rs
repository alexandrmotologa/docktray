#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;

use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").expect("Main window not found");

            // Automatically hide window when it loses focus (blur)
            let win_blur = window.clone();
            window.on_window_event(move |event| {
                if let WindowEvent::Focused(false) = event {
                    let _ = win_blur.hide();
                }
            });

            // Configure system tray click listener
            let tray_win = window.clone();
            let _tray = TrayIconBuilder::new()
                .tooltip("DockTray - Ports & Containers")
                .on_tray_icon_event(move |_tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        if tray_win.is_visible().unwrap_or(false) {
                            let _ = tray_win.hide();
                        } else {
                            let _ = tray_win.show();
                            let _ = tray_win.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::ports::get_listening_ports,
            commands::process::kill_process,
            commands::docker::get_docker_containers,
            commands::docker::restart_docker_container,
            commands::docker::stop_docker_container,
            commands::env_profiles::get_env_profiles,
            commands::env_profiles::switch_env_profile,
            commands::env_profiles::get_system_stats,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running DockTray application");
}
