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
    public double Usd { get; set; }

    [JsonPropertyName("usd_market_cap")]
    public double UsdMarketCap { get; set; }

    [JsonPropertyName("usd_24h_vol")]
    public double Usd24hVol { get; set; }

    [JsonPropertyName("usd_24h_change")]
    public double Usd24hChange { get; set; }

    [JsonPropertyName("last_updated_at")]
    public long LastUpdatedAt { get; set; }
}


public class CryptoPriceDto
{
    public string Id { get; set; } = string.Empty; 
    public double CurrentPrice { get; set; }
    public double MarketCap { get; set; }
    public double PriceChange24h { get; set; }
    public double Volume24h { get; set; }
}

