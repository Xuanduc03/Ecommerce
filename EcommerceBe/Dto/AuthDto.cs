using EcommerceBe.Models;
using System.ComponentModel.DataAnnotations;

namespace EcommerceBe.Dto
{
    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;

        public string? PhoneNumber { get; set; }

        [Required]
        public string? Username { get; set; }

        [Required]
        public UserRole Role { get; set; }

    }

    // login dto
    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
    //forget password request dto
    public class ForgotPasswordRequest
    {
        [Required]
        public string Email { get; set; }
    }

    // reset password dto
    public class ResetPasswordRequest
    {
        [Required]
        public string Token { get; set; }
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
    }

    //user profile dto 
    public class UserProfileDto
    {
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public Guid UserId { get; set; }
        public string? Gender {  get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Email { get; set; }
        public string? Username { get; set; }
        public string? PhoneNumber { get; set; }
      
    }

    //update profile dto
    public class UpdateUserProfileDto : UserProfileDto
    {
    }

    // admin update user
    public class AdminUpdateUser
    {
        public string Email { get; set; }
        public string Username { get; set; }
        public string PhoneNumber { get; set; }
        public UserRole Role { get; set; }
        public bool IsVerified { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmNewPassword { get; set; }
    }

}
