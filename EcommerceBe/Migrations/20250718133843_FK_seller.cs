using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcommerceBe.Migrations
{
    /// <inheritdoc />
    public partial class FK_seller : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sellers_Users_SellerId",
                table: "Sellers");

            migrationBuilder.CreateIndex(
                name: "IX_Sellers_UserId",
                table: "Sellers",
                column: "UserId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Sellers_Users_UserId",
                table: "Sellers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sellers_Users_UserId",
                table: "Sellers");

            migrationBuilder.DropIndex(
                name: "IX_Sellers_UserId",
                table: "Sellers");

            migrationBuilder.AddForeignKey(
                name: "FK_Sellers_Users_SellerId",
                table: "Sellers",
                column: "SellerId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
