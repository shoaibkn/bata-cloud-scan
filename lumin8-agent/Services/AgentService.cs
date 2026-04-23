using System.Net.Sockets;
using System.Text.Json;

namespace Lumin8.Agent.Services;

public class AgentService
{
    private readonly Models.AgentConfig _config;
    private readonly HttpClient _httpClient;
    private string? _lastReportedIp;

    public AgentService(Models.AgentConfig config)
    {
        _config = config;
        _httpClient = new HttpClient();
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    public async Task RunCheckAndReportAsync()
    {
        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] Running check cycle...");

        var publicIp = await GetPublicIpAsync();
        if (string.IsNullOrWhiteSpace(publicIp))
        {
            Console.WriteLine("Could not determine public IP");
            return;
        }

        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] Public IP: {publicIp}");

        var isReachable = await CheckErpPortAsync();
        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] ERP Port {_config.ErpPort} reachable: {isReachable}");

        var heartbeatResult = await SendHeartbeatAsync(publicIp, isReachable);
        if (heartbeatResult)
        {
            _lastReportedIp = publicIp;
            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] Heartbeat sent successfully");
        }
    }

    private async Task<string?> GetPublicIpAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("https://api.ipify.org");
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsStringAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to get public IP from ipify: {ex.Message}");
        }

        try
        {
            var response = await _httpClient.GetAsync("https://ifconfig.me/ip");
            if (response.IsSuccessStatusCode)
            {
                var ip = await response.Content.ReadAsStringAsync();
                return ip?.Trim();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to get public IP from ifconfig.me: {ex.Message}");
        }

        return null;
    }

    private async Task<bool> CheckErpPortAsync()
    {
        try
        {
            using var client = new TcpClient();
            await client.ConnectAsync("127.0.0.1", _config.ErpPort);
            return client.Connected;
        }
        catch
        {
            return false;
        }
    }

    private async Task<bool> SendHeartbeatAsync(string publicIp, bool isReachable)
    {
        try
        {
            var request = new Models.HeartbeatRequest
            {
                PublicIp = publicIp,
                Port = _config.ErpPort,
                IsReachable = isReachable
            };

            var requestJson = JsonSerializer.Serialize(request);
            var httpContent = new StringContent(requestJson, System.Text.Encoding.UTF8, "application/json");

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, $"{_config.ApiBaseUrl}/api/agent/heartbeat")
            {
                Content = httpContent
            };
            httpRequest.Headers.Add("X-Agent-Token", _config.AgentToken);

            var response = await _httpClient.SendAsync(httpRequest);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"Heartbeat failed: {response.StatusCode} - {content}");
                return false;
            }

            var result = JsonSerializer.Deserialize<Models.HeartbeatResponse>(content);
            return result?.Success == true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send heartbeat: {ex.Message}");
            return false;
        }
    }
}