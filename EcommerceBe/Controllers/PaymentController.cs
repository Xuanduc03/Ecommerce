using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PaymentRequestDto dto)
        {
            var id = await _paymentService.CreatePaymentAsync(dto.OrderId, dto.Amount, dto.PaymentMethod);
            return Ok(new { paymentId = id });
        }

        [HttpPut("{orderId}/status")]
        public async Task<IActionResult> UpdateStatus(Guid orderId, [FromQuery] string status)
        {
            await _paymentService.UpdatePaymentStatusAsync(orderId, status);
            return Ok(new { message = "Payment status updated" });
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetByOrderId(Guid orderId)
        {
            var payment = await _paymentService.GetPaymentByOrderIdAsync(orderId);
            return payment == null ? NotFound() : Ok(payment);
        }


    }

}
