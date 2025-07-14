using System.ComponentModel.DataAnnotations;

namespace EcommerceBe.Dto
{

    public class AddressDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Street { get; set; }
        public string Ward { get; set; }
        public string District { get; set; }
        public string City { get; set; }
        public bool IsDefault { get; set; }
    }
    public class CreateAddressDto
    {
        [Required] public string FullName { get; set; }
        [Required] public string PhoneNumber { get; set; }
        [Required] public string Street { get; set; }
        [Required] public string Ward { get; set; }
        [Required] public string District { get; set; }
        [Required] public string City { get; set; }
        public bool IsDefault { get; set; } = false;
    }

    public class UpdateAddressDto : CreateAddressDto { }

}
