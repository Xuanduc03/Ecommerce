using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;


namespace EcommerceBe.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;

        public PaymentService(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<Guid> CreatePaymentAsync(Guid orderId, decimal amount, string method)
        {
            var payment = new Payment
            {
                PaymentId = Guid.NewGuid(),
                OrderId = orderId,
                Amount = amount,
                PaymentMethod = method,
                Status = "Pending",
                PaymentDate = DateTime.UtcNow
            };
            await _paymentRepository.AddPaymentAsync(payment);
            return payment.PaymentId;
        }

        public async Task UpdatePaymentStatusAsync(Guid orderId, string status)
        {
            var payment = await _paymentRepository.GetPaymentByOrderIdAsync(orderId);
            if (payment == null) throw new Exception("Payment not found");

            payment.Status = status;
            payment.PaymentDate = DateTime.UtcNow;
            await _paymentRepository.UpdatePaymentAsync(payment);
        }

        public async Task<Payment?> GetPaymentByOrderIdAsync(Guid orderId)
        {
            return await _paymentRepository.GetPaymentByOrderIdAsync(orderId);
        }


    }
}

