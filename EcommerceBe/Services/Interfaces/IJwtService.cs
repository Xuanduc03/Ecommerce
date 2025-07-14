using EcommerceBe.Models;

namespace EcommerceBe.Services.Interfaces
{
    public interface IJwtService
    {
        Task<string> GenerateToken(User user);
    }
}
