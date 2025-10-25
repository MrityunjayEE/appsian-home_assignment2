using System.ComponentModel.DataAnnotations;

namespace ProjectManager.DTOs;

public class ScheduleRequest
{
    [Required]
    public List<ScheduleTaskInput> Tasks { get; set; } = new();
    
    public int WorkingHoursPerDay { get; set; } = 8;
}

public class ScheduleTaskInput
{
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [Range(0.1, double.MaxValue)]
    public double EstimatedHours { get; set; }
    
    public string? DueDate { get; set; }
    
    public List<string> Dependencies { get; set; } = new();
}

public class ScheduleResponse
{
    public List<string> RecommendedOrder { get; set; } = new();
    public List<ScheduledTask> Schedule { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}

public class ScheduledTask
{
    public string Title { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public double AllocatedHours { get; set; }
}
