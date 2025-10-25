using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Models;

public class ScheduleResult
{
    public int Id { get; set; }
    
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    
    public string RecommendedOrder { get; set; } = string.Empty; // JSON array of task titles
    
    public string ScheduleData { get; set; } = string.Empty; // JSON of scheduled tasks
    
    public string Warnings { get; set; } = string.Empty; // JSON array of warnings
    
    public string Errors { get; set; } = string.Empty; // JSON array of errors
    
    public int WorkingHoursPerDay { get; set; }
    
    public DateTime CreatedAt { get; set; }
}
