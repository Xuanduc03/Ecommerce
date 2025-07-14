using EcommerceBe.Models;
using System.ComponentModel.DataAnnotations;

namespace EcommerceBe.Dto
{
    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        [MinLength(6)]
        public string Password { get; set; }
        public string PhoneNumber { get; set; }
        public string? Username { get; set; }
        public UserRole Role { get; set; }


        // Dùng khi Role = Seller
        public Guid? ShopId { get; set; }
        public bool CreateNewShop { get; set; } = false;
        public string? ShopName { get; set; }
        public string? Description { get; set; }
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
        public Guid UserId { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
        public string PhoneNumber { get; set; }
        public string Role { get; set; }
      
    }

    //update profile dto
    public class UpdateUserProfileDto
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string PhoneNumber { get; set; }
    }

    // admin update user
    public class AdminUpdateUser
    {
        public string Email { get; set; }
        public string Username { get; set; }
        public string PhoneNumber { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
        public bool IsVerified { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
    }

}
