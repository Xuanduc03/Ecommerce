using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcommerceBe.Models
{
    public enum UserRole
    {
        Client = 0,
        Seller = 1,
        Admin = 2
    }

    public class User
    {
        public Guid UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string PhoneNumber {  get; set; }
        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? FullName { get; set; }

        public string? AvatarUrl { get; set; }
        public UserRole Role { get; set; }
        public DateTime CreateAt {  get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? Otp { get; set; }
        public bool IsVerified { get; set; }
        public Seller? Seller { get; set; }
        public bool IsActive { get; set; }
        public ICollection<Order> Orders { get; set; }
        public ICollection<Review> Reviews { get; set; }
        public ICollection<ShippingAddress> ShippingAddresses { get; set; }
    }
}
