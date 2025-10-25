using System.ComponentModel.DataAnnotations;

namespace ProjectManager.DTOs;

public class CreateProjectRequest
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
}

public class ProjectResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int OwnerId { get; set; }
}

public class ProjectDetailResponse : ProjectResponse
{
    public List<TaskResponse> Tasks { get; set; } = new();
}
