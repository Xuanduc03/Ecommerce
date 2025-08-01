namespace EcommerceBe.Dto
{
    public class ShopResponseDto
    {
        public Guid ShopId { get; set; }
        public string Name { get; set; }
        public Guid SellerId { get; set; }
        public string SellerName { get; set; }
        public string Description { get; set; }
        public string ContactPhone { get; set; }
        public string LogoUrl { get; set; }
        public string BannerUrl { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    public class CreateShopDto
    {
        public Guid SellerId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ContactPhone { get; set; }
        public string LogoUrl { get; set; }
        public string BannerUrl { get; set; }
    }

    public class UpdateShopDto : CreateShopDto {
        public Guid ShopId { get; set; }
        public bool IsActive { get; set ; }
    }

}
