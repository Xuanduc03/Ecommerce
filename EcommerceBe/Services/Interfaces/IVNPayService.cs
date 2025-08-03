using EcommerceBe.Dto;

namespace EcommerceBe.Services.Interfaces
{
    public interface IVNPayService
    {
        Task<PaymentResponseDto> CreatePaymentAsync(PaymentRequestDto request);
        Task<bool> ValidateCallbackAsync(PaymentCallbackDto callback);
        Task<PaymentCallbackDto> ProcessCallbackAsync(IQueryCollection queryParams);
        string GetResponseCodeMeaning(string responseCode);

    }
}
