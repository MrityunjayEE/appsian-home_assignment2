using System.ComponentModel.DataAnnotations;

namespace ProjectManager.DTOs;

public class CreateTaskRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;
    
    public DateTime? DueDate { get; set; }
}

public class UpdateTaskRequest
{
    public string? Title { get; set; }
    public DateTime? DueDate { get; set; }
    public bool? IsCompleted { get; set; }
}

public class TaskResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ProjectId { get; set; }
}
