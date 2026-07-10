using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;


namespace BackEnd_CryptoSim.MODEL
{
    public class Watchlist
    {
        [Key] public int Id { get; set; }
        
        // Pour le connecter à l'user concerné
        public required string UserId { get; set; }
        [ForeignKey("UserId")]public AppUser? User { get; set; }
        
        
        
        // La crypto qui est mise en favori
        public required string CryptoId { get; set; }
    }
}