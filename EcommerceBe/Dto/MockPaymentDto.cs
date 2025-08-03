namespace EcommerceBe.Dto
{
    public class MockPaymentRequestDto
    {
        public string OrderId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string OrderInfo { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = "MOCK"; // MOCK, CREDIT_CARD, BANK_TRANSFER, WALLET
        public MockPaymentSimulation? Simulation { get; set; } // Optional simulation settings
    }

    public class MockPaymentSimulation
    {
        public bool ShouldSucceed { get; set; } = true; // Simulate success or failure
        public int DelaySeconds { get; set; } = 2; // Simulate processing time
        public string? FailureReason { get; set; } // Reason for failure if ShouldSucceed = false
        public string? BankCode { get; set; } = "MOCK_BANK"; // Simulated bank
        public string? TransactionRef { get; set; } // Custom transaction reference
    }

    public class MockPaymentResponseDto
    {
        public bool Success { get; set; }
        public string PaymentUrl { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public MockPaymentStatus Status { get; set; }
        public DateTime ProcessedAt { get; set; }
    }

    public class MockPaymentCallbackDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public MockPaymentStatus Status { get; set; }
        public string ResponseCode { get; set; } = string.Empty; // "00" = success, others = error codes
        public string Message { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public string? BankCode { get; set; }
        public string? BankTransactionRef { get; set; }
    }

    public class MockPaymentStatusDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public MockPaymentStatus Status { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime LastUpdated { get; set; }
    }

    public enum MockPaymentStatus
    {
        Pending,
        Processing,
        Success,
        Failed,
        Cancelled,
        Expired
    }

    public class MockPaymentVerificationDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public bool IsValid { get; set; }
        public MockPaymentStatus Status { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}