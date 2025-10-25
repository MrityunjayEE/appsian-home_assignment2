using ProjectManager.DTOs;
using ProjectManager.Services;
using Xunit;

namespace ProjectManager.Tests;

public class SchedulerServiceTests
{
    private readonly SchedulerService _schedulerService = new();

    [Fact]
    public void GenerateSchedule_WithValidTasks_ReturnsCorrectOrder()
    {
        var request = new ScheduleRequest
        {
            Tasks = new List<ScheduleTaskInput>
            {
                new() { Title = "Task A", EstimatedHours = 8, Dependencies = new List<string>() },
                new() { Title = "Task B", EstimatedHours = 16, Dependencies = new List<string> { "Task A" } }
            }
        };

        var result = _schedulerService.GenerateSchedule(request);

        Assert.Equal(new[] { "Task A", "Task B" }, result.RecommendedOrder);
        Assert.Equal(2, result.Schedule.Count);
        Assert.Empty(result.Errors);
    }

    [Fact]
    public void GenerateSchedule_WithCyclicDependencies_ReturnsError()
    {
        var request = new ScheduleRequest
        {
            Tasks = new List<ScheduleTaskInput>
            {
                new() { Title = "Task A", EstimatedHours = 8, Dependencies = new List<string> { "Task B" } },
                new() { Title = "Task B", EstimatedHours = 8, Dependencies = new List<string> { "Task A" } }
            }
        };

        var result = _schedulerService.GenerateSchedule(request);

        Assert.Contains("Dependency cycle detected", result.Errors);
    }

    [Fact]
    public void GenerateSchedule_WithDueDateWarning_ReturnsWarning()
    {
        var request = new ScheduleRequest
        {
            Tasks = new List<ScheduleTaskInput>
            {
                new() { Title = "Task A", EstimatedHours = 40, DueDate = DateTime.Today.AddDays(1) }
            }
        };

        var result = _schedulerService.GenerateSchedule(request);

        Assert.Contains("cannot meet due date", result.Warnings.FirstOrDefault() ?? "");
    }
}
