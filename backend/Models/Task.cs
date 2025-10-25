using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Models;

public class Task
{
    public int Id { get; set; }
    
    [Required]
    public string Title { get; set; } = string.Empty;
    
    public DateTime? DueDate { get; set; }
    
    public bool IsCompleted { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}
