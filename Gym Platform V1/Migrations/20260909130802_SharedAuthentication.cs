using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gym_Platform_V1.Migrations
{
    /// <inheritdoc />
    public partial class SharedAuthentication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Trainers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "GymOwners",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Admins",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.Sql(@"
INSERT INTO Users (UserName, Email, FullName, PasswordHash, Role, IsActive)
SELECT UserName, Email, FullName, PasswordHash, 'Admin', IsActive FROM Admins;
INSERT INTO Users (UserName, Email, FullName, PasswordHash, Role, IsActive)
SELECT UserName, Email, FullName, PasswordHash, 'GymOwner', IsActive FROM GymOwners;
INSERT INTO Users (UserName, Email, FullName, PasswordHash, Role, IsActive)
SELECT UserName, NULL, FullName, PasswordHash, 'Trainer', IsActive FROM Trainers;

UPDATE a SET UserId = u.Id
FROM Admins a INNER JOIN Users u ON u.Role = 'Admin' AND u.UserName = a.UserName;
UPDATE o SET UserId = u.Id
FROM GymOwners o INNER JOIN Users u ON u.Role = 'GymOwner' AND u.UserName = o.UserName;

;WITH TrainerRows AS
(
    SELECT Id, UserName, ROW_NUMBER() OVER (PARTITION BY UserName ORDER BY Id) AS RowNumber
    FROM Trainers
), UserRows AS
(
    SELECT Id, UserName, ROW_NUMBER() OVER (PARTITION BY UserName ORDER BY Id) AS RowNumber
    FROM Users WHERE Role = 'Trainer'
)
UPDATE t SET UserId = u.Id
FROM Trainers t
INNER JOIN TrainerRows tr ON tr.Id = t.Id
INNER JOIN UserRows u ON u.UserName = tr.UserName AND u.RowNumber = tr.RowNumber;");

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TokenHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpirationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RevokedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Trainers_UserId",
                table: "Trainers",
                column: "UserId",
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_GymOwners_UserId",
                table: "GymOwners",
                column: "UserId",
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Admins_UserId",
                table: "Admins",
                column: "UserId",
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_TokenHash",
                table: "RefreshTokens",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Role_UserName",
                table: "Users",
                columns: new[] { "Role", "UserName" });

            migrationBuilder.AddForeignKey(
                name: "FK_Admins_Users_UserId",
                table: "Admins",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GymOwners_Users_UserId",
                table: "GymOwners",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Trainers_Users_UserId",
                table: "Trainers",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Admins_Users_UserId",
                table: "Admins");

            migrationBuilder.DropForeignKey(
                name: "FK_GymOwners_Users_UserId",
                table: "GymOwners");

            migrationBuilder.DropForeignKey(
                name: "FK_Trainers_Users_UserId",
                table: "Trainers");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Trainers_UserId",
                table: "Trainers");

            migrationBuilder.DropIndex(
                name: "IX_GymOwners_UserId",
                table: "GymOwners");

            migrationBuilder.DropIndex(
                name: "IX_Admins_UserId",
                table: "Admins");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Trainers");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "GymOwners");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Admins");
        }
    }
}
