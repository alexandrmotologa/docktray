use crate::models::{DockerContainer, DockerPortMapping};
use bollard::container::ListContainersOptions;
use bollard::Docker;
use std::default::Default;

async fn get_docker_client() -> Result<Docker, String> {
    Docker::connect_with_defaults().map_err(|e| format!("Docker connection error: {}", e))
}

#[tauri::command]
pub async fn get_docker_containers() -> Result<Vec<DockerContainer>, String> {
    let docker = match get_docker_client().await {
        Ok(client) => client,
        Err(_) => return Ok(Vec::new()), // Graceful fallback when Docker daemon is offline
    };

    let options = ListContainersOptions::<String> {
        all: true,
        ..Default::default()
    };

    let containers = match docker.list_containers(Some(options)).await {
        Ok(list) => list,
        Err(_) => return Ok(Vec::new()),
    };

    let mut results = Vec::new();

    for c in containers {
        let id = c.id.unwrap_or_default();
        let name = c
            .names
            .and_then(|names| names.into_iter().next())
            .map(|n| n.trim_start_matches('/').to_string())
            .unwrap_or_else(|| "unnamed".to_string());
        let image = c.image.unwrap_or_else(|| "unknown".to_string());
        let status = match c.state.as_deref() {
            Some("running") => "running".to_string(),
            Some("exited") => "exited".to_string(),
            Some("paused") => "paused".to_string(),
            Some("restarting") => "restarting".to_string(),
            _ => "exited".to_string(),
        };
        let state = c.status.unwrap_or_default();

        let ports = c
            .ports
            .unwrap_or_default()
            .into_iter()
            .map(|p| DockerPortMapping {
                private_port: p.private_port,
                public_port: p.public_port,
                r#type: p.typ.map(|t| t.to_string()).unwrap_or_else(|| "tcp".to_string()),
            })
            .collect();

        results.push(DockerContainer {
            id,
            name,
            image,
            status,
            state,
            ports,
            memory_usage_mb: 0.0,
            cpu_percent: 0.0,
            uptime: "Active".to_string(),
        });
    }

    Ok(results)
}

#[tauri::command]
pub async fn restart_docker_container(id: String) -> Result<bool, String> {
    let docker = get_docker_client().await?;
    docker
        .restart_container(&id, None)
        .await
        .map_err(|e| format!("Failed to restart container: {}", e))?;
    Ok(true)
}

#[tauri::command]
pub async fn stop_docker_container(id: String) -> Result<bool, String> {
    let docker = get_docker_client().await?;
    let inspect = docker
        .inspect_container(&id, None)
        .await
        .map_err(|e| format!("Failed to inspect container: {}", e))?;

    let is_running = inspect
        .state
        .and_then(|s| s.running)
        .unwrap_or(false);

    if is_running {
        docker
            .stop_container(&id, None)
            .await
            .map_err(|e| format!("Failed to stop container: {}", e))?;
    } else {
        docker
            .start_container::<String>(&id, None)
            .await
            .map_err(|e| format!("Failed to start container: {}", e))?;
    }

    Ok(true)
}
