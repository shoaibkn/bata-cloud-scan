# Lumin8 Agent

Scanner routing agent for Bata SVS ERP. Keeps your scanner endpoint DNS updated automatically.

## Features

- Reports public IP address every 5 minutes
- Checks if ERP reader on port 9100 is reachable
- Updates Cloudflare DNS automatically on IP change
- Runs as console app or Windows Service
- Token-based authentication

## Requirements

- Windows 10/11 or Windows Server 2019+
- .NET 8.0 Runtime (included in self-contained build)

## Quick Start

1. Download `Lumin8.Agent.exe` from your dashboard
2. Open `config.json` and paste your agent token
3. Run `Lumin8.Agent.exe`

## Configuration

Edit `config.json`:

```json
{
  "ApiBaseUrl": "https://svs.lumin8.in",
  "AgentToken": "your-token-here",
  "CheckIntervalSeconds": 300,
  "ErpPort": 9100,
  "LogLevel": "Information",
  "LogFilePath": "lumin8-agent.log"
}
```

| Setting | Description | Default |
|---------|------------|--------|
| `ApiBaseUrl` | Platform API URL | https://svs.lumin8.in |
| `AgentToken` | Your agent token from dashboard | - |
| `CheckIntervalSeconds` | Heartbeat interval | 300 (5 min) |
| `ErpPort` | ERP reader port | 9100 |
| `LogLevel` | Log verbosity | Information |
| `LogFilePath` | Log file path | lumin8-agent.log |

## Command Line Options

```
Lumin8.Agent.exe              Run as Windows Service (default on Windows)
Lumin8.Agent.exe --console   Run in console mode
Lumin8.Agent.exe --install  Install as Windows Service
Lumin8.Agent.exe --uninstall Remove Windows Service
```

## Windows Service Installation

Run as Administrator:

```powershell
.\Lumin8.Agent.exe --install
```

To start the service:

```powershell
Start-Service Lumin8Agent
```

To stop the service:

```powershell
Stop-Service Lumin8Agent
```

## Logs

Logs are written to:
- Console (if running in console mode)
- File: `lumin8-agent.log` (in agent directory)

## Support

Email: hello@lumin8.in