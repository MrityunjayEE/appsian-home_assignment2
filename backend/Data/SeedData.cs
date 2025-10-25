using Microsoft.EntityFrameworkCore;
using ProjectManager.Models;
using ProjectManager.Services;

namespace ProjectManager.Data;

public static class SeedData
{
    public static async System.Threading.Tasks.Task Initialize(IServiceProvider serviceProvider)
    {
        using var context = new ApplicationDbContext(
            serviceProvider.GetRequiredService<DbContextOptions<ApplicationDbContext>>());
        
        try
        {
            if (await context.Users.AnyAsync())
                return;
        }
        catch
        {
            // Table might not exist yet, continue with seeding
        }
        
        var passwordService = serviceProvider.GetRequiredService<IPasswordService>();
        
        var demoUser = new User
        {
            Username = "demo@example.com",
            PasswordHash = passwordService.HashPassword("Demo123!"),
            Name = "Demo User",
            College = "Demo College"
        };
        
        context.Users.Add(demoUser);
        await context.SaveChangesAsync();
        
        var sampleProject = new Project
        {
            Title = "Sample Project",
            Description = "A sample project with tasks",
            OwnerId = demoUser.Id
        };
        
        context.Projects.Add(sampleProject);
        await context.SaveChangesAsync();
        
        var tasks = new[]
        {
            new Models.Task { Title = "Setup Development Environment", ProjectId = sampleProject.Id, DueDate = DateTime.Today.AddDays(2) },
            new Models.Task { Title = "Design Database Schema", ProjectId = sampleProject.Id, DueDate = DateTime.Today.AddDays(5) },
            new Models.Task { Title = "Implement Authentication", ProjectId = sampleProject.Id, DueDate = DateTime.Today.AddDays(7) },
            new Models.Task { Title = "Create API Endpoints", ProjectId = sampleProject.Id, DueDate = DateTime.Today.AddDays(10) }
        };
        
        context.Tasks.AddRange(tasks);
        await context.SaveChangesAsync();
    }
}
