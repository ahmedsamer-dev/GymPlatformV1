using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym_Platform_V1.Migrations
{
    /// <inheritdoc />
    public partial class newEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LogoUrl",
                table: "Gyms");

            migrationBuilder.RenameIndex(
                name: "IX_GymOwners_UserName",
                table: "GymOwners",
                newName: "IX_GymOwner_UserName_Unique");

            migrationBuilder.RenameIndex(
                name: "IX_GymOwners_PhoneNumber",
                table: "GymOwners",
                newName: "IX_GymOwner_PhoneNumber_Unique");

            migrationBuilder.RenameIndex(
                name: "IX_GymOwners_Email",
                table: "GymOwners",
                newName: "IX_GymOwner_Email_Unique");

            migrationBuilder.CreateTable(
                name: "GymOwnerApplications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    GymName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    GymAddress = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    GymPhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RejectionReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GymOwnerApplications", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GymOwner_CreatedAt",
                table: "GymOwners",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_GymOwner_IsActive",
                table: "GymOwners",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_GymOwnerApplication_CreatedAt",
                table: "GymOwnerApplications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_GymOwnerApplication_Email_Unique",
                table: "GymOwnerApplications",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GymOwnerApplication_Status",
                table: "GymOwnerApplications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_GymOwnerApplication_UserName_Unique",
                table: "GymOwnerApplications",
                column: "UserName",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GymOwnerApplications");

            migrationBuilder.DropIndex(
                name: "IX_GymOwner_CreatedAt",
                table: "GymOwners");

            migrationBuilder.DropIndex(
                name: "IX_GymOwner_IsActive",
                table: "GymOwners");

            migrationBuilder.RenameIndex(
                name: "IX_GymOwner_UserName_Unique",
                table: "GymOwners",
                newName: "IX_GymOwners_UserName");

            migrationBuilder.RenameIndex(
                name: "IX_GymOwner_PhoneNumber_Unique",
                table: "GymOwners",
                newName: "IX_GymOwners_PhoneNumber");

            migrationBuilder.RenameIndex(
                name: "IX_GymOwner_Email_Unique",
                table: "GymOwners",
                newName: "IX_GymOwners_Email");

            migrationBuilder.AddColumn<string>(
                name: "LogoUrl",
                table: "Gyms",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }
    }
}
