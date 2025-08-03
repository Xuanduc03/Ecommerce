using EcommerceBe.Dto;

namespace EcommerceBe.Services.Interfaces
{
    public interface IMockPaymentService
    {
        Task<MockPaymentResponseDto> CreatePaymentAsync(MockPaymentRequestDto request);
        Task<MockPaymentCallbackDto> ProcessPaymentAsync(string transactionId);
        Task<MockPaymentStatusDto> GetPaymentStatusAsync(string orderId);
        Task<MockPaymentVerificationDto> VerifyPaymentAsync(string transactionId);
        Task<bool> CancelPaymentAsync(string transactionId);
        Task<List<MockPaymentStatusDto>> GetAllPaymentsAsync();
        string GenerateTransactionId();
    }
}