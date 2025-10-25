using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ProjectManager.Controllers;
using ProjectManager.Data;
using ProjectManager.DTOs;
using ProjectManager.Services;
using Xunit;

namespace ProjectManager.Tests;

public class AuthControllerTests
{
    private ApplicationDbContext GetInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async void Register_WithValidData_ReturnsUserResponse()
    {
        using var context = GetInMemoryContext();
        var passwordService = new PasswordService();
        var jwtService = new JwtService(new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:SecretKey"] = "test-secret-key-minimum-32-characters-long",
                ["JwtSettings:ExpiryHours"] = "24"
            })
            .Build());
        
        var controller = new AuthController(context, passwordService, jwtService);
        var request = new RegisterRequest { Username = "test@example.com", Password = "Test123!" };

        var result = await controller.Register(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var userResponse = Assert.IsType<UserResponse>(okResult.Value);
        Assert.Equal("test@example.com", userResponse.Username);
    }

    [Fact]
    public async void Login_WithValidCredentials_ReturnsToken()
    {
        using var context = GetInMemoryContext();
        var passwordService = new PasswordService();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:SecretKey"] = "test-secret-key-minimum-32-characters-long",
                ["JwtSettings:ExpiryHours"] = "24"
            })
            .Build();
        var jwtService = new JwtService(configuration);
        
        var controller = new AuthController(context, passwordService, jwtService);
        controller.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
        {
            HttpContext = new Microsoft.AspNetCore.Http.DefaultHttpContext
            {
                RequestServices = new Microsoft.Extensions.DependencyInjection.ServiceCollection()
                    .AddSingleton<IConfiguration>(configuration)
                    .BuildServiceProvider()
            }
        };
        
        // Register user first
        await controller.Register(new RegisterRequest { Username = "test@example.com", Password = "Test123!" });
        
        var loginRequest = new LoginRequest { Username = "test@example.com", Password = "Test123!" };
        var result = await controller.Login(loginRequest);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var loginResponse = Assert.IsType<LoginResponse>(okResult.Value);
        Assert.NotEmpty(loginResponse.Token);
    }
}
