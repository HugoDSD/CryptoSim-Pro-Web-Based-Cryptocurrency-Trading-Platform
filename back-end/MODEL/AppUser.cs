using Microsoft.AspNetCore.Identity;


namespace BackEnd_CryptoSim.MODEL
{
    public class AppUser: IdentityUser
    {
        public string Name {get;set;} = string.Empty;
        public string Surname {get; set;} = string.Empty;

        public decimal CashBalance { get; set; } = 100000m; // Faire une nouvelle route api pour definir le montant inital
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relations avec les autres tables
        public ICollection<Portfolio>? Portfolios { get; set; }
        public ICollection<Transaction>? Transactions { get; set; }
        public ICollection<Watchlist>? Watchlists { get; set; }
        public ICollection<PriceAlert>? PriceAlerts { get; set; }

        
    }
}