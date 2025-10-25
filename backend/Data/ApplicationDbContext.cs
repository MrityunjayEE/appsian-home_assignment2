using Microsoft.EntityFrameworkCore;
using ProjectManager.Models;

namespace ProjectManager.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
    
    public DbSet<User> Users { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<Models.Task> Tasks { get; set; }
    public DbSet<SchedulerTask> SchedulerTasks { get; set; }
    public DbSet<ScheduleResult> ScheduleResults { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();
            
        modelBuilder.Entity<Project>()
            .HasOne(p => p.Owner)
            .WithMany(u => u.Projects)
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Models.Task>()
            .HasOne(t => t.Project)
            .WithMany(p => p.Tasks)
            .HasForeignKey(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<SchedulerTask>()
            .HasOne(st => st.Project)
            .WithMany()
            .HasForeignKey(st => st.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<SchedulerTask>()
            .HasOne(st => st.Task)
            .WithMany()
            .HasForeignKey(st => st.TaskId)
            .OnDelete(DeleteBehavior.SetNull);
            
        modelBuilder.Entity<ScheduleResult>()
            .HasOne(sr => sr.Project)
            .WithMany()
            .HasForeignKey(sr => sr.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
