using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Models;

public class SchedulerTask
{
    public int Id { get; set; }
    
    [Required]
    public string Title { get; set; } = string.Empty;
    
    public double EstimatedHours { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    public string Dependencies { get; set; } = string.Empty; // Comma-separated task titles
    
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; }
    
    // Link to actual task if created
    public int? TaskId { get; set; }
    public Task? Task { get; set; }
}
