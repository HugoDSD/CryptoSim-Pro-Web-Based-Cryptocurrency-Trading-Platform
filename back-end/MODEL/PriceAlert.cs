using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;


namespace BackEnd_CryptoSim.MODEL
{
    public class PriceAlert
    {
        [Key] public int Id { get; set; }
        
        // Pour le connecter à l'user concerné
        public required string UserId { get; set; }
        [ForeignKey("UserId")] public AppUser? User { get; set; }
        
        // Configuration de l'alerte
        public required string CryptoId { get; set; }
        public decimal TargetPrice { get; set; }
        public required string Direction { get; set; } // "ABOVE" (dépasse) ou "BELOW" (chute sous)
        
        // État de l'alerte
        public bool IsActive { get; set; } = true; // Passe à false une fois déclenchée

        // Exécution automatique d'un ordre au déclenchement (sinon simple notification)
        public bool AutoExecute { get; set; } = false;
        public string? OrderType { get; set; } // "BUY" ou "SELL", requis si AutoExecute = true
        public decimal? OrderQuantity { get; set; } // Quantité à acheter/vendre, requis si AutoExecute = true
    }
}