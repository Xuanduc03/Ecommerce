namespace EcommerceBe.Dto
{
    public class PaymentRequestDto
    {
        public Guid OrderId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } // VNPAY, COD, etc.
    }

    public class MomoPaymentRequest
    {
        public string PartnerCode { get; set; }
        public string AccessKey { get; set; }
        public string RequestId { get; set; }
        public string OrderId { get; set; }
        public string OrderInfo { get; set; }
        public string RedirectUrl { get; set; }
        public string IpnUrl { get; set; } // Webhook nhận callback
        public string Amount { get; set; }
        public string RequestType { get; set; } = "captureWallet";
        public string Signature { get; set; }
        public string Lang { get; set; } = "vi";
        public string ExtraData { get; set; } = "";
    }


}
