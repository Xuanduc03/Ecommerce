using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using EcommerceBe.Models;
using EcommerceBe.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace EcommerceBe.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<JwtService> _logger;

        public JwtService(IConfiguration configuration, ILogger<JwtService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public Task<string> GenerateToken(User user)
        {
            try
            {
                // Validate input
                if (user == null)
                    throw new ArgumentNullException(nameof(user), "User object cannot be null");

                if (string.IsNullOrEmpty(user.Email))
                    throw new ArgumentException("User email is required");

                if (user.UserId == Guid.Empty)
                    throw new ArgumentException("Invalid user ID");

                // Get configuration values
                var secretKey = _configuration["Jwt:Key"]
                    ?? throw new ArgumentNullException("JWT Secret Key is not configured");

                var validIssuer = _configuration["Jwt:Issuer"]
                    ?? throw new ArgumentNullException("JWT Valid Issuer is not configured");

                var validAudience = _configuration["Jwt:Audience"]
                    ?? throw new ArgumentNullException("JWT Valid Audience is not configured");

                // Create claims
                var claims = new List<Claim>
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                    new Claim("userId", user.UserId.ToString()),
                    new Claim(JwtRegisteredClaimNames.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.Name, user.Username ?? string.Empty),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                };

                // Create token
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                var expires = DateTime.UtcNow.AddDays(1);

                var token = new JwtSecurityToken(
                    issuer: validIssuer,
                    audience: validAudience,
                    claims: claims,
                    expires: expires,
                    signingCredentials: creds
                );

                return Task.FromResult(new JwtSecurityTokenHandler().WriteToken(token));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT token");
                throw;
            }
        }
    }
}