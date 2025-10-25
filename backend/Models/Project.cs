using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Models;

public class Project
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    
    public ICollection<Task> Tasks { get; set; } = new List<Task>();
}
