namespace EcommerceBe.Dto
{
    public class AddToCartRequest
    {
        public Guid UserId { get; set; }
        public Guid ProductVariantId { get; set; }
        public int Quantity { get; set; }
    }

}
