using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcommerceBe.Models;
using EcommerceBe.Dto;
using EcommerceBe.Services.Interfaces;

namespace EcommerceBe.Controllers
{
    [ApiController]
    [Route("api/discount")]
    [Authorize]
    public class DiscountController : ControllerBase
    {
        private readonly IDiscountService _discountService;

        public DiscountController(IDiscountService discountService)
        {
            _discountService = discountService;
        }

        // GET: api/Discount
        [HttpGet]
        public async Task<ActionResult<List<DiscountDto>>> GetAll()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.IsInRole("Admin") ? "Admin" : "Seller";
                var discounts = await _discountService.GetAllAsync(userId, role);
                return Ok(discounts);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // GET: api/Discount/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<DiscountDto>> GetById(Guid id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.IsInRole("Admin") ? "Admin" : "Seller";
                var discount = await _discountService.GetByIdAsync(id, userId, role);
                if (discount == null)
                {
                    return NotFound(new { message = "Không tìm thấy mã giảm giá." });
                }
                return Ok(discount);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // POST: api/Discount
        [HttpPost]
        public async Task<ActionResult<DiscountDto>> Create([FromBody] CreateDiscountDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.IsInRole("Admin") ? "Admin" : "Seller";
                var createdDiscount = await _discountService.CreateAsync(dto, userId, role);
                return CreatedAtAction(nameof(GetById), new { id = createdDiscount.DiscountId }, createdDiscount);
            }
           
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // PUT: api/Discount/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<DiscountDto>> Update(Guid id, [FromBody] UpdateDiscountDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.IsInRole("Admin") ? "Admin" : "Seller";
                var updatedDiscount = await _discountService.UpdateAsync(id, dto, userId, role);
                if (updatedDiscount == null)
                {
                    return NotFound(new { message = "Không tìm thấy mã giảm giá." });
                }
                return Ok(updatedDiscount);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Update Error: {ex.Message}");
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        // DELETE: api/Discount/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var role = User.IsInRole("Admin") ? "Admin" : "Seller";
                var result = await _discountService.DeleteAsync(id, userId, role);
                if (!result)
                {
                    return NotFound(new { message = "Không tìm thấy mã giảm giá." });
                }
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }
    }
}