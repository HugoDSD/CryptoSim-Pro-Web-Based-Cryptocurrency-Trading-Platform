using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using BackEnd_CryptoSim.LOGIC.Services.Interfaces;
using BackEnd_CryptoSim.PERSIST;
using Microsoft.EntityFrameworkCore;


namespace Back_end_Innovation_Project.APP.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]

public class TradingController:ControllerBase
{
    private readonly AppDb _context;
    private readonly ICryptoPriceService _crypto;
    private readonly IMiddleOffice _middleOffice;
    private readonly IBackOffice _backOffice;



    public  TradingController(AppDb context, ICryptoPriceService crypto, IMiddleOffice middleOffice, IBackOffice backOffice)
    {
        _context = context;
        _crypto= crypto;
        _middleOffice= middleOffice;
        _backOffice=backOffice;
    }


    [HttpPost("execute")]
    public async  Task<IActionResult> Execute ([FromBody] TradeRequestDto request)
    {
        try
        {
        
            //On recupère l'id de l'utilisateur
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdFromToken))
            {
                return BadRequest(new { Success = false, Message = "Impossible d'identifier l'utilisateur à partir du token." });
            } 
            //charger les information de l'utilisateur 
            var user = await _context.Users.Include(u => u.Portfolios).FirstOrDefaultAsync(u => u.Id == userIdFromToken);
            if (user == null)
            {
               return NotFound(new { Success = false, Message = "Utilisateur introuvable dans la base de données." });
            }

            //On va chercher le prix de la crypto
            var allInfoCrypto = await _crypto.GetMarketPriceAsync();
            if (allInfoCrypto == null)
            {
                return NotFound(new { Success = false, Message = "Impossible de récupérer les informations concernantl la crypto" });
            }


            // On envoi les informations au MiddleOffice
            (bool IsValid, string ErrorMessage) = _middleOffice.ValidateTrade(user, request, allInfoCrypto );
            if(IsValid == false)
            {
                return BadRequest(new { Success = false, Message = ErrorMessage });
            }


            // On envoi les information au backoffice pour les enregistrer si accepter, l'await permet de bien respecter l'asynchronisme de cette opération puisqu'elle traite avec la Base de Donnée
            decimal crypto_currentvalue = allInfoCrypto.FirstOrDefault(p => p.Id == request.CryptoId)?.CurrentPrice ?? 0;
            if (crypto_currentvalue == 0)
            {
                return NotFound(new { Success = false, Message = "Impossible de déterminer le prix d'exécution actuel." });
            }
            (bool success, string message) = await _backOffice.ExecuteTradeAsync (userIdFromToken,  request,  crypto_currentvalue);
             
            return Ok(new 
            { 
                Success = success, 
                Message = message 
            });
        }
        catch(Exception Ex)
        {
            Console.WriteLine($"[CRITICAL] Erreur lors de l'exécution de l'ordre : {Ex.Message}");
            return StatusCode(500, new { Success = false, Message = "Une erreur système est survenue." });
        }
    }
    
    
    
    
    
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        try
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdFromToken))
            {
                return Unauthorized("Impossible d'identifier l'utilisateur.");
            }
            var history = await _backOffice.GetTransactionHistoryAsync(userIdFromToken);

            return Ok(history);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Erreur historique : {ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de la récupération de l'historique.");
        }
    }

}