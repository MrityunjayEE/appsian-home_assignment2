using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [EmailAddress]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string College { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; }
    
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}
