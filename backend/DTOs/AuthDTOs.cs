using System.ComponentModel.DataAnnotations;

namespace ProjectManager.DTOs;

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string College { get; set; } = string.Empty;
}

public class LoginRequest
{
    [Required]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
}

public class UserResponse
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string College { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;
    
    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}
