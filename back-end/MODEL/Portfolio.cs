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
        public decimal Quantity { get; set; }
        public decimal AvgBuyPrice { get; set; }
    }    
}