using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcommerceBe.Migrations
{
    /// <inheritdoc />
    public partial class updateProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Price",
                table: "Products",
                newName: "OriginalPrice");

            migrationBuilder.RenameColumn(
                name: "IdPrimary",
                table: "ProductImages",
                newName: "IsPrimary");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OriginalPrice",
                table: "Products",
                newName: "Price");

            migrationBuilder.RenameColumn(
                name: "IsPrimary",
                table: "ProductImages",
                newName: "IdPrimary");
        }
    }
}
