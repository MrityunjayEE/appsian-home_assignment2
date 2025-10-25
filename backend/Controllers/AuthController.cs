using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.Data;
using ProjectManager.DTOs;
using ProjectManager.Models;
using ProjectManager.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ProjectManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IJwtService _jwtService;
    
    public AuthController(ApplicationDbContext context, IPasswordService passwordService, IJwtService jwtService)
    {
        _context = context;
        _passwordService = passwordService;
        _jwtService = jwtService;
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ErrorResponse { Errors = ModelState.SelectMany(x => x.Value!.Errors).Select(e => new ErrorDetail { Field = "", Message = e.ErrorMessage }).ToList() });
        
        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            return BadRequest(new ErrorResponse { Errors = new List<ErrorDetail> { new() { Field = "username", Message = "Username already exists" } } });
        
        var user = new User
        {
            Username = request.Username,
            PasswordHash = _passwordService.HashPassword(request.Password),
            Name = request.Name,
            College = request.College,
            CreatedAt = DateTime.UtcNow.AddHours(5.5) // IST is UTC+5:30
        };
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        return Ok(new UserResponse
        {
            Id = user.Id,
            Username = user.Username,
            Name = user.Name,
            College = user.College,
            CreatedAt = user.CreatedAt
        });
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ErrorResponse { Errors = ModelState.SelectMany(x => x.Value!.Errors).Select(e => new ErrorDetail { Field = "", Message = e.ErrorMessage }).ToList() });
        
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null || !_passwordService.VerifyPassword(user.PasswordHash, request.Password))
            return BadRequest(new ErrorResponse { Errors = new List<ErrorDetail> { new() { Field = "", Message = "Invalid credentials" } } });
        
        var token = _jwtService.GenerateToken(user);
        
        return Ok(new LoginResponse
        {
            Token = token,
            ExpiresIn = 24 * 3600 // 24 hours in seconds
        });
    }
    
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ErrorResponse { Errors = ModelState.SelectMany(x => x.Value!.Errors).Select(e => new ErrorDetail { Field = "", Message = e.ErrorMessage }).ToList() });
        
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        
        if (user == null)
            return NotFound();
        
        if (!_passwordService.VerifyPassword(user.PasswordHash, request.CurrentPassword))
            return BadRequest(new ErrorResponse { Errors = new List<ErrorDetail> { new() { Field = "currentPassword", Message = "Current password is incorrect" } } });
        
        user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Password changed successfully" });
    }
}
