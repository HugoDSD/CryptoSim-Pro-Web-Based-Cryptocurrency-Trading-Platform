using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace back_end.Migrations
{
    /// <inheritdoc />
    public partial class AddAutoExecuteToPriceAlert : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Watchlists_UserId",
                table: "Watchlists");

            migrationBuilder.AddColumn<bool>(
                name: "AutoExecute",
                table: "PriceAlerts",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "OrderQuantity",
                table: "PriceAlerts",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OrderType",
                table: "PriceAlerts",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Watchlists_UserId_CryptoId",
                table: "Watchlists",
                columns: new[] { "UserId", "CryptoId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Watchlists_UserId_CryptoId",
                table: "Watchlists");

            migrationBuilder.DropColumn(
                name: "AutoExecute",
                table: "PriceAlerts");

            migrationBuilder.DropColumn(
                name: "OrderQuantity",
                table: "PriceAlerts");

            migrationBuilder.DropColumn(
                name: "OrderType",
                table: "PriceAlerts");

            migrationBuilder.CreateIndex(
                name: "IX_Watchlists_UserId",
                table: "Watchlists",
                column: "UserId");
        }
    }
}
