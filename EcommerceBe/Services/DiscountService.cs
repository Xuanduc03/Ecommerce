using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;

namespace EcommerceBe.Services
{
    public class DiscountService : IDiscountService
    {
        private readonly IDiscountRepository _discountRepository;
        private readonly IProductRepository _productRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DiscountService(
            IDiscountRepository discountRepository,
            IProductRepository productRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _discountRepository = discountRepository;
            _productRepository = productRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetShopIdForUser(string userId)
        {
            // Giả định: Lấy ShopId từ cơ sở dữ liệu dựa trên UserId
            // Thay thế bằng logic thực tế của bạn
            return Guid.NewGuid(); // Placeholder
        }

        public async Task<List<DiscountDto>> GetAllAsync(string userId, string role)
        {
            Guid? shopId = role == "Admin" ? null : GetShopIdForUser(userId);
            var discounts = await _discountRepository.GetAllAsync(shopId);

            return discounts.Select(d => new DiscountDto
            {
                DiscountId = d.DiscountId,
                Name = d.Name,
                OrderId = d.OrderId,
                ShopId = d.ShopId,
                StartDate = d.StartDate,
                EndDate = d.EndDate,
                ProductIds = d.DiscountProducts.Select(dp => dp.ProductId).ToList(),
                DiscountType = d.DiscountType.ToString(),
                DiscountValue = d.DiscountValue
            }).ToList();
        }

        public async Task<DiscountDto> GetByIdAsync(Guid discountId, string userId, string role)
        {
            var discount = await _discountRepository.GetByIdAsync(discountId);
            if (discount == null)
            {
                return null;
            }

            if (role != "Admin")
            {
                var shopId = GetShopIdForUser(userId);
                if (discount.ShopId != shopId)
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền truy cập mã giảm giá này.");
                }
            }

            return new DiscountDto
            {
                DiscountId = discount.DiscountId,
                Name = discount.Name,
                OrderId = discount.OrderId,
                ShopId = discount.ShopId,
                StartDate = discount.StartDate,
                EndDate = discount.EndDate,
                ProductIds = discount.DiscountProducts.Select(dp => dp.ProductId).ToList(),
                DiscountType = discount.DiscountType.ToString(),
                DiscountValue = discount.DiscountValue
            };
        }

        public async Task<DiscountDto> CreateAsync(CreateDiscountDto dto, string userId, string role)
        {
            if (role != "Admin")
            {
                var shopId = GetShopIdForUser(userId);
                if (dto.ShopId != shopId)
                {
                    throw new UnauthorizedAccessException("Bạn chỉ có thể tạo mã giảm giá cho shop của mình.");
                }
            }

            if (!Enum.TryParse<DiscountType>(dto.DiscountType, true, out var discountType))
            {
                throw new ArgumentException("Loại giảm giá không hợp lệ.");
            }

            if (dto.DiscountValue <= 0 || (discountType == DiscountType.Percentage && dto.DiscountValue > 100))
            {
                throw new ArgumentException("Giá trị giảm giá không hợp lệ.");
            }

            // Kiểm tra ProductIds tồn tại
            if (dto.ProductIds.Any())
            {
                var products = await _productRepository.GetByIdsAsync(dto.ProductIds);
                if (products.Count != dto.ProductIds.Count)
                {
                    throw new ArgumentException("Một số sản phẩm không tồn tại.");
                }
                // Kiểm tra ShopId của sản phẩm
                if (products.Any(p => p.ShopId != dto.ShopId))
                {
                    throw new ArgumentException("Một số sản phẩm không thuộc shop này.");
                }
            }

            var discount = new Discount
            {
                Name = dto.Name,
                OrderId = dto.OrderId,
                ShopId = dto.ShopId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                DiscountType = discountType,
                DiscountValue = dto.DiscountValue,
               
            };
            discount.DiscountId = Guid.NewGuid();

            discount.DiscountProducts = dto.ProductIds.Select(pid => new DiscountProduct
            {
                DiscountId = discount.DiscountId,
                ProductId = pid
            }).ToList();

            var createdDiscount = await _discountRepository.CreateAsync(discount);
            return new DiscountDto
            {
                DiscountId = createdDiscount.DiscountId,
                Name = createdDiscount.Name,
                OrderId = createdDiscount.OrderId,
                ShopId = createdDiscount.ShopId,
                StartDate = createdDiscount.StartDate,
                EndDate = createdDiscount.EndDate,
                ProductIds = createdDiscount.DiscountProducts.Select(dp => dp.ProductId).ToList(),
                DiscountType = createdDiscount.DiscountType.ToString(),
                DiscountValue = createdDiscount.DiscountValue
            };
        }

        public async Task<DiscountDto> UpdateAsync(Guid discountId, UpdateDiscountDto dto, string userId, string role)
        {
            var discount = await _discountRepository.GetByIdAsync(discountId);
            if (discount == null)
            {
                return null;
            }

            if (role != "Admin")
            {
                var shopId = GetShopIdForUser(userId);
                if (discount.ShopId != shopId)
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền cập nhật mã giảm giá này.");
                }
            }

            if (!Enum.TryParse<DiscountType>(dto.DiscountType, true, out var discountType))
            {
                throw new ArgumentException("Loại giảm giá không hợp lệ.");
            }

            if (dto.DiscountValue <= 0 || (discountType == DiscountType.Percentage && dto.DiscountValue > 100))
            {
                throw new ArgumentException("Giá trị giảm giá không hợp lệ.");
            }

            // Kiểm tra ProductIds tồn tại
            if (dto.ProductIds.Any())
            {
                var products = await _productRepository.GetByIdsAsync(dto.ProductIds);
                if (products.Count != dto.ProductIds.Count)
                {
                    throw new ArgumentException("Một số sản phẩm không tồn tại.");
                }
                // Kiểm tra ShopId của sản phẩm
                if (products.Any(p => p.ShopId != discount.ShopId))
                {
                    throw new ArgumentException("Một số sản phẩm không thuộc shop này.");
                }
            }

            // Tạo đối tượng Discount mới với thông tin cập nhật
            var updatedDiscount = new Discount
            {
                DiscountId = discountId, // Giữ nguyên ID
                Name = dto.Name,
                OrderId = dto.OrderId,
                ShopId = dto.ShopId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                DiscountType = discountType,
                DiscountValue = dto.DiscountValue,
                DiscountProducts = dto.ProductIds.Select(pid => new DiscountProduct
                {
                    DiscountId = discountId,
                    ProductId = pid
                }).ToList()
            };

            var result = await _discountRepository.UpdateAsync(discountId, updatedDiscount);
            if (result == null)
            {
                return null;
            }

            return new DiscountDto
            {
                DiscountId = result.DiscountId,
                Name = result.Name,
                OrderId = result.OrderId,
                ShopId = result.ShopId,
                StartDate = result.StartDate,
                EndDate = result.EndDate,
                ProductIds = result.DiscountProducts.Select(dp => dp.ProductId).ToList(),
                DiscountType = result.DiscountType.ToString(),
                DiscountValue = result.DiscountValue
            };
        }

        public async Task<bool> DeleteAsync(Guid discountId, string userId, string role)
        {
            var discount = await _discountRepository.GetByIdAsync(discountId);
            if (discount == null)
            {
                return false;
            }

            if (role != "Admin")
            {
                var shopId = GetShopIdForUser(userId);
                if (discount.ShopId != shopId)
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền xóa mã giảm giá này.");
                }
            }

            return await _discountRepository.DeleteAsync(discountId);
        }

        public async Task<ApplyDiscountResponseDto> ApplyDiscountAsync(string code, string userId, List<Guid> productIds)
        {
            var discount = await _discountRepository.GetByCodeAsync(code);
            if (discount == null || discount.StartDate > DateTime.UtcNow || discount.EndDate < DateTime.UtcNow)
            {
                return null;
            }

            // Kiểm tra ProductIds
            var discountProductIds = discount.DiscountProducts.Select(dp => dp.ProductId).ToList();
            if (discountProductIds.Any() && !productIds.Any(p => discountProductIds.Contains(p)))
            {
                throw new ArgumentException("Mã giảm giá không áp dụng cho các sản phẩm trong giỏ hàng.");
            }

            // Tính toán giá trị giảm giá
            decimal discountAmount = 0;
            var applicableProducts = await _productRepository.GetByIdsAsync(productIds);
            foreach (var product in applicableProducts)
            {
                if (discountProductIds.Count == 0 || discountProductIds.Contains(product.ProductId))
                {
                    if (discount.DiscountType == DiscountType.Percentage)
                    {
                        discountAmount += product.OriginalPrice * (discount.DiscountValue / 100);
                    }
                    else
                    {
                        discountAmount += discount.DiscountValue;
                    }
                }
            }

            return new ApplyDiscountResponseDto
            {
                Discount = new DiscountDto
                {
                    DiscountId = discount.DiscountId,
                    Name = discount.Name,
                    OrderId = discount.OrderId,
                    ShopId = discount.ShopId,
                    StartDate = discount.StartDate,
                    EndDate = discount.EndDate,
                    ProductIds = discount.DiscountProducts.Select(dp => dp.ProductId).ToList(),
                    DiscountType = discount.DiscountType.ToString(),
                    DiscountValue = discount.DiscountValue
                },
                DiscountAmount = discountAmount
            };
        }
    }
}
