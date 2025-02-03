use serde_json::Value;
use tokio::process::Command;

pub async fn run_calimero_cmd(node_name: &str, cmd: &str) -> anyhow::Result<Value> {
    let args = format!("--node-name {} --output-format json {}", node_name, cmd);
    let cmd = Command::new("meroctl")
        .args(args.split_whitespace().collect::<Vec<_>>())
        .output()
        .await?;
    if cmd.status.success() {
        Ok(serde_json::from_slice(&cmd.stdout)?)
    } else {
        anyhow::bail!("Failed to execute calimero command: {}\nError: {:?}", args, String::from_utf8_lossy(&cmd.stderr))
    }
}
