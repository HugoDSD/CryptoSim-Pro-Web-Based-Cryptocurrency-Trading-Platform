using Microsoft.AspNetCore.Mvc;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using BackEnd_CryptoSim.MODEL.APP.DTOs;

namespace  BackEnd_CryptoSim.MODEL.APP.Controllers;
[ApiController]
[Route("api/[controller]")]

public class MarketController : ControllerBase{
    
    private readonly IAuthService _authService;
    private readonly ICryptoPriceService _cryptoservice;

    public MarketController(IAuthService authService, ICryptoPriceService cryptoservice)
    {
        this._authService = authService;
        this._cryptoservice = cryptoservice;
    }
    

    [HttpGet("marketprices")]
    public async Task<ActionResult<IEnumerable<CryptoPriceDto>>> GetMarketPrices()
    {
        try
        {
            var results = await _cryptoservice.GetMarketPriceAsync();
            if(results != null)
            {
                return Ok(results);
            }
            return NotFound("Le marché n'est pas disponible actuellement.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erreur lors de la communication avec l'API : {ex.Message}");
        }
    }

    [HttpGet("price/{cryptoId}")]
    public async Task<ActionResult<CryptoPriceDto>> GetSinglePrice(string cryptoId)
    {
        try
        {
            var results = await _cryptoservice.GetPriceAsync( cryptoId);
            if(results != null)
            {
                return Ok(results);
            }
            return NotFound("Le marché n'est pas disponible actuellement.");
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message); // Renvoie un 404 propre au Front
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erreur : {ex.Message}");
        }
    }

    [HttpGet("ohlc/{cryptoId}")]
    public async Task<ActionResult<IEnumerable<OhlcPointDto>>> GetOhlc(string cryptoId, [FromQuery] int days = 30)
    {
        // Granularités supportées par l'API CoinGecko (public/demo) pour l'endpoint OHLC
        var allowedDays = new[] { 1, 7, 14, 30, 90, 180, 365 };
        if (!allowedDays.Contains(days))
        {
            return BadRequest($"Le paramètre 'days' doit être l'une des valeurs suivantes : {string.Join(", ", allowedDays)}.");
        }

        try
        {
            var results = await _cryptoservice.GetOhlcAsync(cryptoId, days);
            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erreur lors de la communication avec l'API : {ex.Message}");
        }
    }

}


