using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

using System.ComponentModel.DataAnnotations.Schema;
using BackEnd_CryptoSim.MODEL;
namespace BackEnd_CryptoSim.MODEL.APP.DTOs;

public class RegisterDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(8)]
    public required string Password { get; set; }

    public required string Name { get; set; }
    public required string Surname { get; set; }
    
}


public class LoginDto
{
    [Required]
    [EmailAddress]
    public required string Email {get;set;}

    public required string Password {get;set;}

}


//Pour voir l'allure du json : https://docs.coingecko.com/reference/simple-price


public class CoinGeckoRequest
{
    public required string cryptoname { get; set; }
}
public class CoinGeckoSimplePriceData
{
    [JsonPropertyName("usd")]
    public decimal Usd { get; set; }

    [JsonPropertyName("usd_market_cap")]
    public decimal UsdMarketCap { get; set; }

    [JsonPropertyName("usd_24h_vol")]
    public decimal Usd24hVol { get; set; }

    [JsonPropertyName("usd_24h_change")]
    public decimal Usd24hChange { get; set; }

    [JsonPropertyName("last_updated_at")]
    public long LastUpdatedAt { get; set; }
}


public class CryptoPriceDto
{
    public string Id { get; set; } = string.Empty; 
    public decimal CurrentPrice { get; set; }
    public decimal MarketCap { get; set; }
    public decimal PriceChange24h { get; set; }
    public decimal Volume24h { get; set; }
}






public class TradeRequestDto
{
    [Required(ErrorMessage = "L'identifiant de la cryptomonnaie est requis.")]
    public string CryptoId{get;set;} = string.Empty;
    
    [Required(ErrorMessage ="Le type de l'ordre est requis. (BUY ou SELL)")]
    [RegularExpression("^(BUY|SELL)$", ErrorMessage = "Le type doit être 'BUY' ou 'SELL'.")]
    public string Type {get;set;} = string.Empty;


    [Required(ErrorMessage = "La quantité est requise.")]
    [Range(0.00000001, double.MaxValue, ErrorMessage = "La quantité doit être strictement positive.")]
    public decimal Quantity { get; set; }
}

public class TransactionHistoryDto
{
    public int Id { get; set; }
    public string CryptoId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // BUY ou SELL
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Fee { get; set; }
    public decimal TotalValue => (Quantity * Price) + (Type == "BUY" ? Fee : -Fee); 
    public DateTime CreatedAt { get; set; }
}



public class PortfolioIndividualDashboardDto
{
    public string CryptoId { get; set; } = string.Empty;
    public decimal Quantity { get; set; }       
    public decimal AvgBuyPrice { get; set; }     // Le PRU actuel de la ligne
    public decimal CurrentPrice { get; set; }    // Le prix spot actuel du marché
    public decimal TotMarketValue { get; set; }  // Quantité * CurrentPrice
    public decimal InitialCost { get; set; }     // Quantité * AvgBuyPrice
    public decimal PAndL { get; set; }           // TotMarketValue - InitialCost
    public decimal PAndLPercentage { get; set; } // Performance de la ligne en %

}

public class PortfolioTotalDashboardDto
{
    // La liste de toutes les positions de nos crytpos
    public IEnumerable<PortfolioIndividualDashboardDto> Portfolios { get; set; } = new List<PortfolioIndividualDashboardDto>();

    // Indicateur des performance global de ce  compte
    public decimal CashBalance { get; set; }      // Le cash disponible 
    public decimal TotalCryptoValue { get; set; } // Somme des TotMarketValue de toutes les lignes
    public decimal NetLiquidationValue { get; set; } // CashBalance + TotalCryptoValue
    
    // Performance globale du portefeuille
    public decimal TotalPAndL { get; set; }       // Plus-value/Moins-value totale en USD
    public decimal EarningReturn { get; set; }     // Performance globale en %

}



public class LeaderBoardUserDto
{
    public int Classement{get;set;}
    public string UserName{get;set;}= string.Empty;
    public decimal NetLiquidationValue{get;set;}
    public decimal TotalPAndL{get;set;}
    public decimal EarningReturn { get; set; }
    public decimal TotalCryptoValue { get; set; } 
    public int ActivityVolume { get; set; }
}


public class CreatePriceAlertDto
{
    public string CryptoId { get; set; } = string.Empty;
    public decimal TargetPrice{get;set;}
    [RegularExpression("^(ABOVE|BELOW)$", ErrorMessage = "Le type doit être 'ABOVE' ou 'BELOW'.")]
    public string Direction{get;set;}= string.Empty;
}


public class PriceAlertResponseDto
{
    public int Id { get; set; }
    public string CryptoId { get; set; } = string.Empty;
    public decimal TargetPrice { get; set; }
    public string Direction { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}


