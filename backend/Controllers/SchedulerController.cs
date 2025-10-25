using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.Data;
using ProjectManager.DTOs;
using ProjectManager.Services;
using ProjectManager.Models;
using System.Security.Claims;
using System.Text.Json;

namespace ProjectManager.Controllers;

[ApiController]
[Route("api/v1")]
[Authorize]
public class SchedulerController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ISchedulerService _schedulerService;
    
    public SchedulerController(ApplicationDbContext context, ISchedulerService schedulerService)
    {
        _context = context;
        _schedulerService = schedulerService;
    }
    
    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    
    [HttpGet("projects/{projectId}/scheduler-tasks")]
    public async Task<IActionResult> GetSchedulerTasks(int projectId)
    {
        var userId = GetUserId();
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
        
        if (project == null)
            return NotFound();
        
        if (project.OwnerId != userId)
            return Forbid();
        
        var schedulerTasks = await _context.SchedulerTasks
            .Include(st => st.Task)
            .Where(st => st.ProjectId == projectId)
            .ToListAsync();
        
        var response = schedulerTasks.Select(st => new ScheduleTaskInput
        {
            Title = st.Title,
            EstimatedHours = st.EstimatedHours,
            DueDate = st.DueDate?.ToString("yyyy-MM-dd"),
            Dependencies = st.Dependencies.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
        }).ToList();
        
        return Ok(response);
    }
    
    [HttpGet("projects/{projectId}/schedule-result")]
    public async Task<IActionResult> GetScheduleResult(int projectId)
    {
        var userId = GetUserId();
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
        
        if (project == null)
            return NotFound();
        
        if (project.OwnerId != userId)
            return Forbid();
        
        var scheduleResult = await _context.ScheduleResults
            .Where(sr => sr.ProjectId == projectId)
            .OrderByDescending(sr => sr.CreatedAt)
            .FirstOrDefaultAsync();
        
        if (scheduleResult == null)
            return Ok(null);
        
        var response = new ScheduleResponse
        {
            RecommendedOrder = JsonSerializer.Deserialize<List<string>>(scheduleResult.RecommendedOrder) ?? new(),
            Schedule = JsonSerializer.Deserialize<List<ScheduledTask>>(scheduleResult.ScheduleData) ?? new(),
            Warnings = JsonSerializer.Deserialize<List<string>>(scheduleResult.Warnings) ?? new(),
            Errors = JsonSerializer.Deserialize<List<string>>(scheduleResult.Errors) ?? new()
        };
        
        return Ok(response);
    }
    
    [HttpPost("projects/{projectId}/save-scheduler-tasks")]
    public async Task<IActionResult> SaveSchedulerTasks(int projectId, [FromBody] List<ScheduleTaskInput> tasks)
    {
        var userId = GetUserId();
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
        
        if (project == null)
            return NotFound();
        
        if (project.OwnerId != userId)
            return Forbid();
        
        // Remove existing scheduler tasks for this project
        var existingTasks = await _context.SchedulerTasks
            .Where(st => st.ProjectId == projectId)
            .ToListAsync();
        _context.SchedulerTasks.RemoveRange(existingTasks);
        
        // Add new scheduler tasks
        foreach (var taskInput in tasks)
        {
            var schedulerTask = new SchedulerTask
            {
                Title = taskInput.Title,
                EstimatedHours = taskInput.EstimatedHours,
                DueDate = !string.IsNullOrEmpty(taskInput.DueDate) ? DateTime.Parse(taskInput.DueDate) : null,
                Dependencies = string.Join(",", taskInput.Dependencies),
                ProjectId = projectId,
                CreatedAt = DateTime.Now
            };
            
            // Try to link with existing project task
            var existingTask = await _context.Tasks
                .FirstOrDefaultAsync(t => t.ProjectId == projectId && t.Title == taskInput.Title);
            if (existingTask != null)
            {
                schedulerTask.TaskId = existingTask.Id;
            }
            
            _context.SchedulerTasks.Add(schedulerTask);
        }
        
        await _context.SaveChangesAsync();
        return Ok();
    }
    
    [HttpPost("projects/{projectId}/schedule")]
    public async Task<IActionResult> GenerateSchedule(int projectId, ScheduleRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ErrorResponse { Errors = ModelState.SelectMany(x => x.Value!.Errors).Select(e => new ErrorDetail { Field = "", Message = e.ErrorMessage }).ToList() });
        
        var userId = GetUserId();
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
        
        if (project == null)
            return NotFound();
        
        if (project.OwnerId != userId)
            return Forbid();
        
        // Save scheduler tasks first
        await SaveSchedulerTasksInternal(projectId, request.Tasks);
        
        var response = _schedulerService.GenerateSchedule(request);
        
        if (response.Errors.Any())
            return UnprocessableEntity(response);
        
        // Save the schedule result
        await SaveScheduleResult(projectId, response, request.WorkingHoursPerDay);
        
        return Ok(response);
    }
    
    [HttpGet("projects/{projectId}/scheduler-status")]
    public async Task<IActionResult> GetSchedulerStatus(int projectId)
    {
        var userId = GetUserId();
        var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
        
        if (project == null)
            return NotFound();
        
        if (project.OwnerId != userId)
            return Forbid();
        
        var schedulerTasks = await _context.SchedulerTasks
            .Include(st => st.Task)
            .Where(st => st.ProjectId == projectId)
            .ToListAsync();
        
        var status = schedulerTasks.Select(st => new
        {
            Title = st.Title,
            IsCompleted = st.Task?.IsCompleted ?? false,
            TaskId = st.TaskId
        }).ToList();
        
        return Ok(status);
    }
    
    private async System.Threading.Tasks.Task SaveSchedulerTasksInternal(int projectId, List<ScheduleTaskInput> tasks)
    {
        // Remove existing scheduler tasks for this project
        var existingTasks = await _context.SchedulerTasks
            .Where(st => st.ProjectId == projectId)
            .ToListAsync();
        _context.SchedulerTasks.RemoveRange(existingTasks);
        
        // Add new scheduler tasks
        foreach (var taskInput in tasks)
        {
            var schedulerTask = new SchedulerTask
            {
                Title = taskInput.Title,
                EstimatedHours = taskInput.EstimatedHours,
                DueDate = !string.IsNullOrEmpty(taskInput.DueDate) ? DateTime.Parse(taskInput.DueDate) : null,
                Dependencies = string.Join(",", taskInput.Dependencies),
                ProjectId = projectId,
                CreatedAt = DateTime.Now
            };
            
            // Try to link with existing project task
            var existingTask = await _context.Tasks
                .FirstOrDefaultAsync(t => t.ProjectId == projectId && t.Title == taskInput.Title);
            if (existingTask != null)
            {
                schedulerTask.TaskId = existingTask.Id;
            }
            
            _context.SchedulerTasks.Add(schedulerTask);
        }
        
        await _context.SaveChangesAsync();
    }
    
    private async System.Threading.Tasks.Task SaveScheduleResult(int projectId, ScheduleResponse response, int workingHoursPerDay)
    {
        // Remove existing schedule result for this project
        var existingResult = await _context.ScheduleResults
            .Where(sr => sr.ProjectId == projectId)
            .ToListAsync();
        _context.ScheduleResults.RemoveRange(existingResult);
        
        // Save new schedule result
        var scheduleResult = new ScheduleResult
        {
            ProjectId = projectId,
            RecommendedOrder = JsonSerializer.Serialize(response.RecommendedOrder),
            ScheduleData = JsonSerializer.Serialize(response.Schedule),
            Warnings = JsonSerializer.Serialize(response.Warnings),
            Errors = JsonSerializer.Serialize(response.Errors),
            WorkingHoursPerDay = workingHoursPerDay,
            CreatedAt = DateTime.Now
        };
        
        _context.ScheduleResults.Add(scheduleResult);
        await _context.SaveChangesAsync();
    }
}
