namespace EcommerceBe.Dto
{
    public class CartDto
    {
        public Guid CartId { get; set; }
        public Guid? UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();

        public decimal TotalPrice => Items.Sum(i => i.TotalPrice);
    }

    public class CartItemDto
    {
        public Guid CartItemId { get; set; }
        public Guid ProductVariantId { get; set; }
        public string ProductName { get; set; }
        public string Size { get; set; }
        public string ColorName { get; set; }
        public string ColorCode { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public Guid ShopId { get; set; } // Nếu cần group theo shop

        public decimal TotalPrice => Price * Quantity;
    }

    public class CartResponseDto
    {
        public Guid CartId { get; set; }
        public Guid? UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<CartItemResponseDto> Items { get; set; } = new List<CartItemResponseDto>();
        public decimal TotalPrice => Items.Sum(i => i.TotalPrice);
    }


    public class CartItemResponseDto
    {
        public Guid CartItemId { get; set; }
        public Guid ProductVariantId { get; set; }
        public string ProductName { get; set; }
        public string Size { get; set; }
        public string ColorName { get; set; }
        public string ColorCode { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }

        public decimal TotalPrice => Price * Quantity;
    }

    public class AddToCartDto
    {
        public Guid UserId { get; set; } // Hoặc null nếu cho phép guest
        public Guid ProductVariantId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateCartItemDto
    {
        public Guid CartItemId { get; set; }
        public int Quantity { get; set; }
    }

    public class RemoveCartItemDto
    {
        public Guid CartItemId { get; set; }
    }

    public class ClearCartDto
    {
        public Guid CartId { get; set; }
    }

    public class CheckoutDto
    {
        public Guid CartId { get; set; }
        public Guid UserId { get; set; }
        public string PaymentMethod { get; set; } // VNPAY, COD...
        public string ShippingAddress { get; set; }
        public string Note { get; set; }
    }

}
