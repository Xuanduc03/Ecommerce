using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using EcommerceBe.Services.Interfaces;

namespace EcommerceBe.Services
{
    public class CustomEmailService : ICustomEmailService
    {
        private readonly IConfiguration _configuration;

        public CustomEmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var emailMessage = new MimeMessage();

            emailMessage.From.Add(new MailboxAddress(
                _configuration["EmailSettings:SenderName"],
                _configuration["EmailSettings:SenderEmail"]
            ));

            emailMessage.To.Add(MailboxAddress.Parse(to));
            emailMessage.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = body
            };

            emailMessage.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();

            await client.ConnectAsync(
                _configuration["EmailSettings:SmtpServer"],
                int.Parse(_configuration["EmailSettings:SmtpPort"]),
                SecureSocketOptions.StartTls
            );

            await client.AuthenticateAsync(
                _configuration["EmailSettings:SmtpUsername"],
                _configuration["EmailSettings:SmtpPassword"]
            );

            await client.SendAsync(emailMessage);
            await client.DisconnectAsync(true);
        }
    }
}