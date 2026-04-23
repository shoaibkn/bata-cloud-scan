using System.Timers;
using Lumin8.Agent.Services;

namespace Lumin8.Agent;

class Program
{
    private static AgentService? _agentService;
    private static System.Timers.Timer? _timer;

    static async Task Main(string[] args)
    {
        var configPath = args.Length > 0 ? args[0] : "config.json";
        
        Console.WriteLine("Lumin8 SVS Agent v1.0.0");
        Console.WriteLine($"Loading config from: {configPath}");

        if (!File.Exists(configPath))
        {
            Console.WriteLine($"Config file not found: {configPath}");
            Console.WriteLine("Please ensure config.json exists in the same directory.");
            return;
        }

        var agentConfig = Lumin8.Agent.Models.AgentConfig.Load(configPath);

        if (string.IsNullOrWhiteSpace(agentConfig.AgentToken))
        {
            Console.WriteLine("Agent token is not configured. Please set your token in config.json");
            return;
        }

        Console.WriteLine($"API: {agentConfig.ApiBaseUrl}");
        Console.WriteLine($"Check Interval: {agentConfig.CheckIntervalSeconds} seconds");
        Console.WriteLine($"ERP Port: {agentConfig.ErpPort}");

        _agentService = new AgentService(agentConfig);

        Console.CancelKeyPress += (s, e) =>
        {
            e.Cancel = true;
            Console.WriteLine("\nShutting down...");
            _timer?.Stop();
            _timer?.Dispose();
        };

        _timer = new System.Timers.Timer(agentConfig.CheckIntervalSeconds * 1000);
        _timer.Elapsed += OnTimerElapsed;
        _timer.AutoReset = true;
        
        Console.WriteLine("\nStarting heartbeat loop...");
        await RunCheckAsync();
        
        _timer.Start();

        Console.WriteLine("Agent running. Press Ctrl+C to stop.");
        
        await Task.Delay(Timeout.Infinite);
    }

    private static async void OnTimerElapsed(object? sender, ElapsedEventArgs e)
    {
        await RunCheckAsync();
    }

    private static async Task RunCheckAsync()
    {
        if (_agentService == null) return;
        
        try
        {
            await _agentService.RunCheckAndReportAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error during check: {ex.Message}");
        }
    }
}