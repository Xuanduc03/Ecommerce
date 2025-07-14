namespace EcommerceBe.Services.Interfaces
{
    public interface ICustomEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
}
