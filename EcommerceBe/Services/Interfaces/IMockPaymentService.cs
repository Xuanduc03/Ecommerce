using EcommerceBe.Dto;

namespace EcommerceBe.Services.Interfaces
{
    public interface IMockPaymentService
    {
        Task<PaymentResponseDto> CreateMockPaymentAsync(PaymentRequestDto request);
        Task<PaymentCallbackDto> ProcessMockCallbackAsync(string orderId, string status);
        Task<bool> ValidateMockPaymentAsync(string orderId, string transactionId);
        Task<MockPaymentStatusDto> GetMockPaymentStatusAsync(string orderId);
    }
}