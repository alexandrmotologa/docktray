use crate::models::{
    EnvDiffEntry, EnvDiffResult, EnvProfile, EnvProfileHeader, SystemStats, TunnelInfo,
};
use std::collections::{BTreeMap, BTreeSet, HashMap};
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

fn parse_env_file(file_path: &Path) -> HashMap<String, String> {
    let mut map = HashMap::new();
    if let Ok(content) = fs::read_to_string(file_path) {
        for line in content.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with('#') {
                continue;
            }
            if let Some((k, v)) = trimmed.split_once('=') {
                let key = k.trim().to_string();
                let val = v.trim().trim_matches('"').trim_matches('\'').to_string();
                map.insert(key, val);
            }
        }
    }
    map
}

fn is_secret_key(key: &str) -> bool {
    let upper = key.to_uppercase();
    upper.contains("SECRET")
        || upper.contains("KEY")
        || upper.contains("TOKEN")
        || upper.contains("PASSWORD")
        || upper.contains("AUTH")
        || upper.contains("PRIVATE")
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
            let count = parse_env_file(&path).len();
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

    if profiles.is_empty() {
        profiles.push(EnvProfile {
            id: "local".to_string(),
            name: "Local Development".to_string(),
            file_name: ".env.local".to_string(),
            is_active: true,
            variables_count: parse_env_file(&active_env_path).len(),
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
pub async fn get_env_diff(project_path: Option<String>) -> Result<EnvDiffResult, String> {
    let dir = get_target_dir(project_path);

    let candidates = [
        ("local", "Local Dev", ".env.local"),
        ("staging", "Staging", ".env.staging"),
        ("production", "Production", ".env.production"),
    ];

    let mut profile_headers = Vec::new();
    let mut profile_maps: BTreeMap<String, HashMap<String, String>> = BTreeMap::new();
    let mut all_keys: BTreeSet<String> = BTreeSet::new();

    for (id, name, file_name) in candidates {
        let path = dir.join(file_name);
        let map = if path.exists() {
            parse_env_file(&path)
        } else {
            HashMap::new()
        };

        for k in map.keys() {
            all_keys.insert(k.clone());
        }

        profile_headers.push(EnvProfileHeader {
            id: id.to_string(),
            name: name.to_string(),
            file_name: file_name.to_string(),
        });

        profile_maps.insert(id.to_string(), map);
    }

    let mut entries = Vec::new();

    for key in all_keys {
        let is_secret = is_secret_key(&key);
        let mut values = HashMap::new();

        for header in &profile_headers {
            let val = profile_maps
                .get(&header.id)
                .and_then(|m| m.get(&key).cloned());
            values.insert(header.id.clone(), val);
        }

        entries.push(EnvDiffEntry {
            key,
            values,
            is_secret,
        });
    }

    Ok(EnvDiffResult {
        profiles: profile_headers,
        entries,
    })
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

    if target_path.exists() {
        let backup_path = dir.join(".env.backup");
        let _ = fs::copy(&target_path, backup_path);
    }

    fs::copy(&source_path, &target_path)
        .map_err(|e| format!("Failed to swap .env file: {}", e))?;

    Ok(true)
}

#[tauri::command]
pub async fn create_local_tunnel(port: u16) -> Result<TunnelInfo, String> {
    let public_url = format!("https://docktray-{}.loca.lt", port);
    Ok(TunnelInfo {
        port,
        public_url,
        expires_at: "In 2 hours".to_string(),
    })
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
