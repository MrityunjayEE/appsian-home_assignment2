using Microsoft.AspNetCore.Identity;

namespace ProjectManager.Services;

public interface IPasswordService
{
    string HashPassword(string password);
    bool VerifyPassword(string hashedPassword, string password);
}

public class PasswordService : IPasswordService
{
    private readonly PasswordHasher<object> _passwordHasher = new();
    
    public string HashPassword(string password)
    {
        return _passwordHasher.HashPassword(new object(), password);
    }
    
    public bool VerifyPassword(string hashedPassword, string password)
    {
        var result = _passwordHasher.VerifyHashedPassword(new object(), hashedPassword, password);
        return result == PasswordVerificationResult.Success;
    }
}
