using EcommerceBe.Database;
using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcommerceBe.Services
{
    public class SellerService : ISellerService
    {
        private readonly AppDbContext _context;
        private readonly ISellerRepository _repo;
        public SellerService(AppDbContext context, ISellerRepository sellerRepository)
        {
            _context = context;
            _repo = sellerRepository;
        }

        public async Task<PagedResultDto<SellerDto>> GetSellersAsync(string? search, int page, int pageSize)
        {
            var query = _context.Sellers
                .Include(s => s.User)
                .Include(s => s.Shop)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s =>
                    s.User.Username.Contains(search) ||
                    s.User.Email.Contains(search));
            }

            var total = await query.CountAsync();

            var sellers = await query
                .OrderByDescending(s => s.CreateAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var sellerDtos = sellers.Select(s => new SellerDto
            {
                SellerId = s.SellerId,
                Status = s.Status,
                UserId = s.UserId,
                Description = s.Description,
                ShopId = s.ShopId,
                RequestAt = s.RequestAt,
                ApprovedAt = s.ApprovedAt,
                CreateAt = s.CreateAt,
                UserFullName = s.User?.Username,
                UserEmail = s.User?.Email,
                ShopName = s.Shop?.Name
            }).ToList();

            return new PagedResultDto<SellerDto>
            {
                Items = sellerDtos,
                TotalCount = total
            };
        }

        public async Task<SellerDto?> GetSellerByIdAsync(Guid sellerId)
        {
            var seller = await _context.Sellers
                .Include(s => s.User)
                .Include(s => s.Shop)
                .FirstOrDefaultAsync(s => s.SellerId == sellerId);

            if (seller == null) return null;

            return new SellerDto
            {
                SellerId = seller.SellerId,
                Status = seller.Status,
                UserId = seller.UserId,
                Description = seller.Description,
                ShopId = seller.ShopId,
                RequestAt = seller.RequestAt,
                ApprovedAt = seller.ApprovedAt,
                CreateAt = seller.CreateAt,
                UserFullName = seller.User?.Username,
                UserEmail = seller.User?.Email,
                ShopName = seller.Shop?.Name
            };
        }

        public async Task<bool> CreateSellerAsync(SellerDto sellerDto)
        {
            var seller = new Seller
            {
                SellerId = Guid.NewGuid(),
                UserId = sellerDto.UserId,
                Description = sellerDto.Description,
                ShopId = sellerDto.ShopId,
                Status = "Pending",
                RequestAt = DateTime.UtcNow,
                CreateAt = DateTime.UtcNow
            };

            _repo.AddAsync(seller);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateSellerAsync(Guid sellerId, SellerDto dto)
        {
            var seller = await _repo.GetByIdAsync(sellerId);
            if (seller == null) return false;

            // Update các field
            seller.Description = dto.Description;
            seller.ShopId = dto.ShopId;
            seller.Status = dto.Status;
            seller.ApprovedAt = dto.ApprovedAt; // Cho phép set null

            // Ghi DB
            await _repo.UpdateAsync(seller);
            await _repo.SaveChangeAsync();
            return true;
        }


        public async Task<bool> DeleteSellerAsync(Guid sellerId)
        {
            var seller = await _context.Sellers.FindAsync(sellerId);
            if (seller == null) return false;

            _context.Sellers.Remove(seller);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateSellerStatusAsync(Guid sellerId, string newStatus)
        {
            var seller = await _context.Sellers.FindAsync(sellerId);
            if (seller == null) return false;

            seller.Status = newStatus;
            seller.ApprovedAt = newStatus == "Approved" ? DateTime.UtcNow : seller.ApprovedAt;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
