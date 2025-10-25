using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.Data;
using ProjectManager.DTOs;
using System.Security.Claims;

namespace ProjectManager.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    public TasksController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    
    [HttpPost("projects/{projectId}/tasks")]
    public async Task<IActionResult> CreateTask(int projectId, CreateTaskRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ErrorResponse { Errors = ModelState.SelectMany(x => x.Value!.Errors).Select(e => new ErrorDetail { Field = "", Message = e.ErrorMessage }).ToList() });
        
        var userId = GetUserId();
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
        
        if (project == null)
            return NotFound();
        
        if (project.OwnerId != userId)
            return Forbid();
        
        var task = new Models.Task
        {
            Title = request.Title,
            DueDate = request.DueDate,
            ProjectId = projectId,
            CreatedAt = DateTime.UtcNow.AddHours(5.5) // IST is UTC+5:30
        };
        
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();
        
        return Ok(new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            DueDate = task.DueDate,
            IsCompleted = task.IsCompleted,
            CreatedAt = task.CreatedAt,
            ProjectId = task.ProjectId
        });
    }
    
    [HttpPut("tasks/{taskId}")]
    public async Task<IActionResult> UpdateTask(int taskId, UpdateTaskRequest request)
    {
        var userId = GetUserId();
        var task = await _context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == taskId);
        
        if (task == null)
            return NotFound();
        
        if (task.Project.OwnerId != userId)
            return Forbid();
        
        if (!string.IsNullOrEmpty(request.Title))
            task.Title = request.Title;
        
        if (request.DueDate.HasValue)
            task.DueDate = request.DueDate;
        
        if (request.IsCompleted.HasValue)
            task.IsCompleted = request.IsCompleted.Value;
        
        await _context.SaveChangesAsync();
        
        return Ok(new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            DueDate = task.DueDate,
            IsCompleted = task.IsCompleted,
            CreatedAt = task.CreatedAt,
            ProjectId = task.ProjectId
        });
    }
    
    [HttpDelete("tasks/{taskId}")]
    public async Task<IActionResult> DeleteTask(int taskId)
    {
        var userId = GetUserId();
        var task = await _context.Tasks
            .Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == taskId);
        
        if (task == null)
            return NotFound();
        
        if (task.Project.OwnerId != userId)
            return Forbid();
        
        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
}
