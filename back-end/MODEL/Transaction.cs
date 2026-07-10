using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace BackEnd_CryptoSim.MODEL
{
    public class Transaction
    {
        [Key] public int Id{get;set;}

        // Pour le connecter à l'user concerné
        public required string UserId { get; set; }
        [ForeignKey("UserId")][JsonIgnore]public AppUser? User { get; set; }

        //Detail sur la transaction
        public required string CryptoId{get;set;}
        public required string Type{get;set;} //ici il prendra la valeur de "BUY" ou "SELL"
        public decimal Quantity{get;set;}

        //Detail financiers
        public decimal Price{get;set;} // Prix unitaire de la crypto concerné
        public decimal Fee{get;set;} // les frais de transaction (Ex : 0.5% sur Price x  Quantity)

        public DateTime CreatedAt{get; set;}=DateTime.UtcNow;
    }

}