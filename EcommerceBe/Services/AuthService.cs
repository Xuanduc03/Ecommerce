using EcommerceBe.Database;
using EcommerceBe.Dto;
using EcommerceBe.Models;
using EcommerceBe.Repositories.Interfaces;
using EcommerceBe.Services.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace EcommerceBe.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _dbContext;
        private readonly IUserRepository _repo;
        private readonly ISellerRepository _seller;
        private readonly IJwtService _jwtService;
        private readonly ICustomEmailService _customEmailService;

        public AuthService(
            IUserRepository userRepository, ISellerRepository sellerRepository,
            ICustomEmailService customEmailService,
            IJwtService jwtService)
        {
            _repo = userRepository;
            _seller = sellerRepository;
            _customEmailService = customEmailService;
            _jwtService = jwtService;
        }

        public async Task<string> LoginAsync(LoginDto model)
        {
            if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Password))
                throw new ArgumentException("Email và mật khẩu không được để trống");

            var user = await _repo.GetByEmailAsync(model.Email);

            if (user == null)
                throw new InvalidOperationException("Email hoặc mật khẩu không chính xác");

            if (!user.IsActive)
                throw new InvalidOperationException("Tài khoản đã bị khóa. Vui lòng liên hệ admin.");

            if (!BCrypt.Net.BCrypt.Verify(model.Password, user.Password))
                throw new InvalidOperationException("Email hoặc mật khẩu không chính xác");

            var token = await _jwtService.GenerateToken(user);

            return token;
        }
        // Gửi yêu cầu đăng ký
        public async Task<bool> RequestRegisterAsync(RegisterDto model)
        {
            try
            {
                // 1. Check email trùng
                if (await _repo.GetByEmailAsync(model.Email) is not null)
                    throw new InvalidOperationException("Email đã được sử dụng.");

                var userId = Guid.NewGuid();

                var newUser = new User
                {
                    UserId = userId,
                    Email = model.Email,
                    Username = model.Username,
                    PhoneNumber = model.PhoneNumber,
                    Password = BCrypt.Net.BCrypt.HashPassword(model.Password),
                    Role = model.Role,
                    IsActive = true,
                    CreateAt = DateTime.UtcNow,
                };

                await _repo.AddAsync(newUser);
                await _repo.SaveChangeAsync();

                // 2. Nếu là Seller, tạo Seller record, ShopId = null
                if (model.Role == UserRole.Seller)
                {
                    var seller = new Seller
                    {
                        SellerId = Guid.NewGuid(),
                        UserId = userId,
                        Status = "Chờ duyệt", 
                        ShopId = null, 
                        RequestAt = DateTime.UtcNow,
                        CreateAt = DateTime.UtcNow,
                        ApprovedAt = null
                    };

                    await _seller.AddAsync(seller);
                    await _seller.SaveChangeAsync();
                }

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại sau.");
            }

        }



        public async Task<bool> ForgotPasswordAsync(ForgotPasswordRequest model)
        {
            // 1. Tìm người dùng theo email
            var user = await _repo.GetByEmailAsync(model.Email);

            if (user == null)
                throw new InvalidOperationException("Không tìm thấy người dùng với email đã nhập.");

            // 2. Sinh mã OTP và gán thời gian tạo
            var otp = GenerateOtp();
            user.Otp = otp;

            // 3. Lưu lại thông tin người dùng
            await _repo.UpdateAsync(user);
            await _repo.SaveChangeAsync();

            // 4. Gửi OTP qua email
            var subject = "Xác thực đặt lại mật khẩu";
            var body = $@"
                 <p>Xin chào {user.Username ?? "bạn"},</p>
                 <p>Bạn vừa yêu cầu đặt lại mật khẩu tại hệ thống. Mã xác thực (OTP) của bạn là:</p>
                 <h2>{otp}</h2>
                 <p>Mã có hiệu lực trong 10 phút.</p>
                 <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>";

            await _customEmailService.SendEmailAsync(user.Email, subject, body);

            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequest model)
        {
            // 1. Tìm người dùng theo mã OTP
            var user = await _repo.GetByOtpAsync(model.Token);

            if (user == null)
                throw new InvalidOperationException("Mã xác thực không hợp lệ.");

            // 3. Cập nhật mật khẩu và reset OTP
            user.Password = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
            user.Otp = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(user);
            await _repo.SaveChangeAsync();

            return true;
        }

        public async Task<UserProfileDto> GetProfileAsync(Guid userId)
        {
            var user = await _repo.GetByIdAsync(userId);

            if (user == null)
                throw new InvalidOperationException("Không tìm thấy người dùng.");

            return new UserProfileDto
            {
                UserId = user.UserId,
                Email = user.Email,
                Username = user.Username,
                PhoneNumber = user.PhoneNumber,
            };
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateUserProfileDto model)
        {
            var user = await _repo.GetByIdAsync(userId);

            if (user == null)
                throw new InvalidOperationException("Không tìm thấy người dùng.");

            user.Username = model.Username;
            user.PhoneNumber = model.PhoneNumber;
            user.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(user);
            await _repo.SaveChangeAsync();

            return true;
        }
    
    private string GenerateOtp()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }

    }
}