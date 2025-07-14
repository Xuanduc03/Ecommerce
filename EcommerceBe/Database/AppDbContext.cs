using EcommerceBe.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Product> Products { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<Seller> Sellers { get; set; }
        public DbSet<Shop> Shops { get; set; }
        public DbSet<SellerReport> SellerReports { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ProductImages> ProductImages { get; set; }
        public DbSet<ProductCategories> ProductCategories { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<OrderDiscount> OrderDiscounts { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Discount> Discounts { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<ShippingAddress> ShippingAddresses { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình kiểu dữ liệu và mối quan hệ
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>()
                .HasColumnType("nvarchar(20)");

            modelBuilder.Entity<Order>()
                .Property(o => o.Status)
                .HasConversion<string>()
                .HasColumnType("nvarchar(20)");

            modelBuilder.Entity<User>()
               .HasMany(u => u.ShippingAddresses)
               .WithOne(a => a.user)
               .HasForeignKey(a => a.UserId)
               .OnDelete(DeleteBehavior.Cascade); // Xóa địa chỉ khi xóa user

            // Đặt chỉ 1 địa chỉ mặc định cho mỗi user
            modelBuilder.Entity<ShippingAddress>()
                .HasIndex(a => new { a.UserId, a.IsDefault })
                .HasFilter("[IsDefault] = 1")
                .IsUnique();
            // Cấu hình các bảng N:N
            modelBuilder.Entity<ProductCategories>()
                    .HasKey(pc => new { pc.ProductId, pc.CategoryId });

            modelBuilder.Entity<OrderDiscount>()
                .HasKey(od => new { od.OrderId, od.DiscountId });
            modelBuilder.Entity<ProductImages>()
                .HasKey(pi => pi.ProductImageId);

            modelBuilder.Entity<ProductVariant>()
                .HasKey(pi => pi.ProductVariantId);
            // Cấu hình mối quan hệ
            modelBuilder.Entity<Seller>()
                .HasOne(s => s.User)
                .WithOne(u => u.Seller)
                .HasForeignKey<Seller>(s => s.SellerId);

            modelBuilder.Entity<Shop>()
                .HasOne(s => s.Seller)
                .WithOne(seller => seller.Shop)
                .HasForeignKey<Seller>(seller => seller.ShopId);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Shop)
                .WithMany(s => s.Products)
                .HasForeignKey(p => p.ShopId);

            modelBuilder.Entity<ProductCategories>()
                .HasOne(pc => pc.Product)
                .WithMany(p => p.ProductCategories)
                .HasForeignKey(pc => pc.ProductId);

            modelBuilder.Entity<ProductCategories>()
                .HasOne(pc => pc.Product)
                .WithMany(p => p.ProductCategories)
                .HasForeignKey(pc => pc.ProductId);

            modelBuilder.Entity<ProductVariant>() // Bắt đầu từ bên "1"
               .HasMany(pv => pv.OrderItems) // Một ProductVariant có NHIỀU OrderItem
               .WithOne(oi => oi.ProductVariant) // Một OrderItem có MỘT ProductVariant
               .HasForeignKey(oi => oi.ProductVariantId);

            modelBuilder.Entity<Cart>()
               .HasMany(c => c.CartItems)
               .WithOne(ci => ci.Cart)
               .HasForeignKey(ci => ci.CartId)
               .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.ProductVariant)
                .WithMany()  
                .HasForeignKey(ci => ci.ProductVariantId);

            // Thêm index để tối ưu
            modelBuilder.Entity<Order>()
                .HasIndex(o => o.OrderDate);

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.ShopId);
        }

    }
}
