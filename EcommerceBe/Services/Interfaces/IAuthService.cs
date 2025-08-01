using EcommerceBe.Dto;

namespace EcommerceBe.Services.Interfaces
{
    public interface IAuthService
    {
        // interface register
        Task<bool> RequestRegisterAsync(RegisterDto model);
        //interface login
        Task<string> LoginAsync(LoginDto model);
        
        //interface forgot password
        Task<bool> ForgotPasswordAsync(ForgotPasswordRequest model);
        Task<bool> ResetPasswordAsync(ResetPasswordRequest model);
        Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto model);

        //interface get profile and update profile
        Task<UserProfileDto> GetProfileAsync(Guid userId);
        Task<bool> UpdateProfileAsync(Guid userId, UpdateUserProfileDto model);
    }
}