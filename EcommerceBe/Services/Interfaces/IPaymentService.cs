using EcommerceBe.Dto;
using EcommerceBe.Models;

namespace EcommerceBe.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<Guid> CreatePaymentAsync(Guid orderId, decimal amount, string method);
        Task UpdatePaymentStatusAsync(Guid orderId, string status);
        Task<Payment?> GetPaymentByOrderIdAsync(Guid orderId);
    }

}
