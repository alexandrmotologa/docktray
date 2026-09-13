use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HttpHealth {
    pub status: u16,
    pub status_text: String,
    pub latency_ms: u64,
    pub checked_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PortInfo {
    pub port: u16,
    pub protocol: String,
    pub ip: String,
    pub pid: u32,
    pub parent_pid: Option<u32>,
    pub parent_name: Option<String>,
    pub child_pids: Option<Vec<u32>>,
    pub process_name: String,
    pub command_path: Option<String>,
    pub memory_mb: f64,
    pub uptime_sec: u64,
    pub category: String,
    pub pinned: Option<bool>,
    pub http_health: Option<HttpHealth>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DockerPortMapping {
    pub private_port: u16,
    pub public_port: Option<u16>,
    pub r#type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DockerContainer {
    pub id: String,
    pub name: String,
    pub image: String,
    pub status: String,
    pub state: String,
    pub ports: Vec<DockerPortMapping>,
    pub memory_usage_mb: f64,
    pub cpu_percent: f64,
    pub uptime: String,
    pub compose_project: Option<String>,
    pub compose_service: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvProfile {
    pub id: String,
    pub name: String,
    pub file_name: String,
    pub is_active: bool,
    pub variables_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvProfileHeader {
    pub id: String,
    pub name: String,
    pub file_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvDiffEntry {
    pub key: String,
    pub values: HashMap<String, Option<String>>,
    pub is_secret: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnvDiffResult {
    pub profiles: Vec<EnvProfileHeader>,
    pub entries: Vec<EnvDiffEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TunnelInfo {
    pub port: u16,
    pub public_url: String,
    pub expires_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemStats {
    pub total_memory_mb: u64,
    pub used_memory_mb: u64,
    pub free_memory_mb: u64,
    pub cpu_usage_percent: u32,
    pub listening_port_count: usize,
    pub docker_available: bool,
}
