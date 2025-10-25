using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.Data;
using ProjectManager.DTOs;
using ProjectManager.Models;
using System.Security.Claims;

namespace ProjectManager.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    public ProjectsController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    
    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var userId = GetUserId();
        var projects = await _context.Projects
            .Where(p => p.OwnerId == userId)
            .Select(p => new ProjectResponse
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                CreatedAt = p.CreatedAt,
                OwnerId = p.OwnerId
            })
            .ToListAsync();
        
        return Ok(projects);
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateProject(CreateProjectRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ErrorResponse { Errors = ModelState.SelectMany(x => x.Value!.Errors).Select(e => new ErrorDetail { Field = "", Message = e.ErrorMessage }).ToList() });
        
        var project = new Project
        {
            Title = request.Title,
            Description = request.Description,
            OwnerId = GetUserId(),
            CreatedAt = DateTime.UtcNow.AddHours(5.5) // IST is UTC+5:30
        };
        
        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, new ProjectResponse
        {
            Id = project.Id,
            Title = project.Title,
            Description = project.Description,
            CreatedAt = project.CreatedAt,
            OwnerId = project.OwnerId
        });
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProject(int id)
    {
        var userId = GetUserId();
        var project = await _context.Projects
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == id);
        
        if (project == null)
            return NotFound();
        
        if (project.OwnerId != userId)
            return Forbid();
        
        return Ok(new ProjectDetailResponse
        {
            Id = project.Id,
            Title = project.Title,
            Description = project.Description,
            CreatedAt = project.CreatedAt,
            OwnerId = project.OwnerId,
            Tasks = project.Tasks.Select(t => new TaskResponse
            {
                Id = t.Id,
                Title = t.Title,
                DueDate = t.DueDate,
                IsCompleted = t.IsCompleted,
                CreatedAt = t.CreatedAt,
                ProjectId = t.ProjectId
            }).ToList()
        });
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var userId = GetUserId();
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id);
        
        if (project == null)
            return NotFound();
        
        if (project.OwnerId != userId)
            return Forbid();
        
        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
}
