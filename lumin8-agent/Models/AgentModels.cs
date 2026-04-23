namespace Lumin8.Agent.Models;

public class AgentConfig
{
    public string ApiBaseUrl { get; set; } = "https://svs.lumin8.in";
    public string AgentToken { get; set; } = "";
    public int CheckIntervalSeconds { get; set; } = 300;
    public int ErpPort { get; set; } = 9100;

    public static AgentConfig Load(string path)
    {
        var json = File.ReadAllText(path);
        return System.Text.Json.JsonSerializer.Deserialize<AgentConfig>(json) ?? new AgentConfig();
    }
}

public class HeartbeatRequest
{
    public string PublicIp { get; set; } = "";
    public int Port { get; set; } = 9100;
    public bool IsReachable { get; set; }
}

public class HeartbeatResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
}

public class RegisterResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? TenantId { get; set; }
    public string? TenantSlug { get; set; }
    public string? TenantName { get; set; }
}