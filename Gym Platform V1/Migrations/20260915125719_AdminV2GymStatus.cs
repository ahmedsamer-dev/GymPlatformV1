using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym_Platform_V1.Migrations
{
    /// <inheritdoc />
    public partial class AdminV2GymStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Gyms",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateIndex(
                name: "IX_Gym_IsActive",
                table: "Gyms",
                column: "IsActive");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Gym_IsActive",
                table: "Gyms");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Gyms");
        }
    }
}
