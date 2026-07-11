using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace BackEnd_CryptoSim.MODEL
{
    public class Portfolio
    {
        [Key] public int Id{get;set;}
        public required string UserId { get; set; }
        [ForeignKey("UserId")] public AppUser? User { get; set; }    
        public required string CryptoId { get; set; }
        [ConcurrencyCheck] public decimal Quantity { get; set; } // permet de faire crasher le logiciel si une execution se produit alors qu'une autre est entrain davoir lieu = evite les problèmes de Concurrence
        public decimal AvgBuyPrice { get; set; }
    }    
}