using ProjectManager.DTOs;

namespace ProjectManager.Services;

public interface ISchedulerService
{
    ScheduleResponse GenerateSchedule(ScheduleRequest request);
}

public class SchedulerService : ISchedulerService
{
    public ScheduleResponse GenerateSchedule(ScheduleRequest request)
    {
        var response = new ScheduleResponse();
        
        // Detect cycles
        if (HasCycle(request.Tasks))
        {
            response.Errors.Add("Dependency cycle detected");
            return response;
        }
        
        // Topological sort
        var sortedTasks = TopologicalSort(request.Tasks);
        response.RecommendedOrder = sortedTasks.Select(t => t.Title).ToList();
        
        // Generate schedule
        var currentDate = DateTime.Today;
        foreach (var task in sortedTasks)
        {
            var durationDays = Math.Ceiling(task.EstimatedHours / request.WorkingHoursPerDay);
            var endDate = currentDate.AddDays(durationDays - 1);
            
            response.Schedule.Add(new ScheduledTask
            {
                Title = task.Title,
                StartDate = currentDate,
                EndDate = endDate,
                AllocatedHours = task.EstimatedHours
            });
            
            // Check if task can meet due date
            if (!string.IsNullOrEmpty(task.DueDate) && DateTime.TryParse(task.DueDate, out var dueDate) && endDate > dueDate)
            {
                response.Warnings.Add($"Task '{task.Title}' cannot meet due date");
            }
            
            currentDate = endDate.AddDays(1);
        }
        
        return response;
    }
    
    private bool HasCycle(List<ScheduleTaskInput> tasks)
    {
        var taskMap = tasks.ToDictionary(t => t.Title, t => t);
        var visited = new HashSet<string>();
        var recursionStack = new HashSet<string>();
        
        foreach (var task in tasks)
        {
            if (HasCycleDFS(task.Title, taskMap, visited, recursionStack))
                return true;
        }
        
        return false;
    }
    
    private bool HasCycleDFS(string taskTitle, Dictionary<string, ScheduleTaskInput> taskMap, 
        HashSet<string> visited, HashSet<string> recursionStack)
    {
        if (recursionStack.Contains(taskTitle))
            return true;
            
        if (visited.Contains(taskTitle))
            return false;
            
        visited.Add(taskTitle);
        recursionStack.Add(taskTitle);
        
        if (taskMap.TryGetValue(taskTitle, out var task))
        {
            foreach (var dependency in task.Dependencies)
            {
                if (HasCycleDFS(dependency, taskMap, visited, recursionStack))
                    return true;
            }
        }
        
        recursionStack.Remove(taskTitle);
        return false;
    }
    
    private List<ScheduleTaskInput> TopologicalSort(List<ScheduleTaskInput> tasks)
    {
        var taskMap = tasks.ToDictionary(t => t.Title, t => t);
        var visited = new HashSet<string>();
        var result = new List<ScheduleTaskInput>();
        
        foreach (var task in tasks.OrderBy(t => !string.IsNullOrEmpty(t.DueDate) && DateTime.TryParse(t.DueDate, out var date) ? date : DateTime.MaxValue))
        {
            if (!visited.Contains(task.Title))
            {
                TopologicalSortDFS(task.Title, taskMap, visited, result);
            }
        }
        
        return result;
    }
    
    private void TopologicalSortDFS(string taskTitle, Dictionary<string, ScheduleTaskInput> taskMap,
        HashSet<string> visited, List<ScheduleTaskInput> result)
    {
        visited.Add(taskTitle);
        
        if (taskMap.TryGetValue(taskTitle, out var task))
        {
            foreach (var dependency in task.Dependencies)
            {
                if (!visited.Contains(dependency) && taskMap.ContainsKey(dependency))
                {
                    TopologicalSortDFS(dependency, taskMap, visited, result);
                }
            }
            result.Add(task);
        }
    }
}
