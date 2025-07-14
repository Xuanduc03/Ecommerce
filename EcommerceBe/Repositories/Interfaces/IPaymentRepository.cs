using EcommerceBe.Models;

namespace EcommerceBe.Repositories.Interfaces
{
    public interface IPaymentRepository
    {
        Task AddPaymentAsync(Payment payment);
        Task<Payment> GetPaymentByOrderIdAsync(Guid orderId);
        Task UpdatePaymentAsync(Payment payment);
    }
}
