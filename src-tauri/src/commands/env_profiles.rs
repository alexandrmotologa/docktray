use crate::models::{EnvProfile, SystemStats};
use std::fs;
use std::path::{Path, PathBuf};
use sysinfo::System;

fn get_target_dir(project_path: Option<String>) -> PathBuf {
    if let Some(p) = project_path {
        PathBuf::from(p)
    } else {
        std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
    }
}

fn count_env_variables(file_path: &Path) -> usize {
    if let Ok(content) = fs::read_to_string(file_path) {
        content
            .lines()
            .filter(|line| {
                let trimmed = line.trim();
                !trimmed.is_empty() && !trimmed.starts_with('#') && trimmed.contains('=')
            })
            .count()
    } else {
        0
    }
}

#[tauri::command]
pub async fn get_env_profiles(project_path: Option<String>) -> Result<Vec<EnvProfile>, String> {
    let dir = get_target_dir(project_path);
    let mut profiles = Vec::new();

    let candidates = [
        ("local", "Local Development", ".env.local"),
        ("development", "Development", ".env.development"),
        ("staging", "Remote Staging", ".env.staging"),
        ("production", "Production", ".env.production"),
    ];

    let active_env_path = dir.join(".env");
    let active_content = fs::read_to_string(&active_env_path).unwrap_or_default();

    for (id, label, file_name) in candidates {
        let path = dir.join(file_name);
        if path.exists() {
            let count = count_env_variables(&path);
            let candidate_content = fs::read_to_string(&path).unwrap_or_default();
            let is_active = !active_content.is_empty() && active_content == candidate_content;

            profiles.push(EnvProfile {
                id: id.to_string(),
                name: label.to_string(),
                file_name: file_name.to_string(),
                is_active,
                variables_count: count,
            });
        }
    }

    // If no specific environment files exist, provide template placeholders
    if profiles.is_empty() {
        profiles.push(EnvProfile {
            id: "local".to_string(),
            name: "Local Development".to_string(),
            file_name: ".env.local".to_string(),
            is_active: true,
            variables_count: count_env_variables(&active_env_path),
        });
        profiles.push(EnvProfile {
            id: "staging".to_string(),
            name: "Remote Staging".to_string(),
            file_name: ".env.staging".to_string(),
            is_active: false,
            variables_count: 0,
        });
        profiles.push(EnvProfile {
            id: "production".to_string(),
            name: "Production".to_string(),
            file_name: ".env.production".to_string(),
            is_active: false,
            variables_count: 0,
        });
    }

    Ok(profiles)
}

#[tauri::command]
pub async fn switch_env_profile(
    profile_id: String,
    project_path: Option<String>,
) -> Result<bool, String> {
    let dir = get_target_dir(project_path);
    let source_file_name = format!(".env.{}", profile_id);
    let source_path = dir.join(&source_file_name);
    let target_path = dir.join(".env");

    if !source_path.exists() {
        return Err(format!("Profile file {} does not exist", source_file_name));
    }

    // Create a backup if .env exists
    if target_path.exists() {
        let backup_path = dir.join(".env.backup");
        let _ = fs::copy(&target_path, backup_path);
    }

    fs::copy(&source_path, &target_path)
        .map_err(|e| format!("Failed to swap .env file: {}", e))?;

    Ok(true)
}

#[tauri::command]
pub async fn get_system_stats() -> Result<SystemStats, String> {
    tokio::task::spawn_blocking(|| {
        let mut sys = System::new_all();
        sys.refresh_all();

        let total_mem = sys.total_memory() / (1024 * 1024);
        let used_mem = sys.used_memory() / (1024 * 1024);
        let free_mem = sys.free_memory() / (1024 * 1024);
        let cpu_usage = sys.global_cpu_usage() as u32;

        Ok(SystemStats {
            total_memory_mb: total_mem,
            used_memory_mb: used_mem,
            free_memory_mb: free_mem,
            cpu_usage_percent: cpu_usage,
            listening_port_count: 0,
            docker_available: true,
        })
    })
    .await
    .map_err(|e| format!("Failed to read system metrics: {}", e))?
}
