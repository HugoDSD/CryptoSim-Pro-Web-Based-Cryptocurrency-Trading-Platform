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
            // On fait en sorte de fetch en meme temps les informations sur l'utilisateur et sur les prix de la crypto pour gagner du temps
            // Au lieu de faire l'un, attendre, puis faire l'autre des qu'il a fini et attendre de nouveau
            var userTask =  _context.Users.Include(u => u.Portfolios).FirstOrDefaultAsync(u => u.Id == userIdFromToken);
            var cryptoPricesTask =  _crypto.GetMarketPriceAsync();
            await Task.WhenAll(userTask, cryptoPricesTask);
            var user = userTask.Result;
            var allInfoCrypto = cryptoPricesTask.Result;
    
            if (user == null)
            {
               return NotFound(new { Success = false, Message = "Utilisateur introuvable dans la base de données." });
            }
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
        catch (Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur historique : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de la récupération de l'historique.");
        }
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashBoard()
    {
        try{
             // On recupère d'abord les informations sur l'utilisateur
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            
            if (string.IsNullOrEmpty(userIdFromToken)){
                return Unauthorized("Impossible d'identifier l'utilisateur.");
            }
            // On fait en sorte de fetch en meme temps les informations sur l'utilisateur et sur les prix de la crypto pour gagner du temps
            // Au lieu de faire l'un, attendre, puis faire l'autre des qu'il a fini et attendre
            var userTask =  _context.Users.Include(u => u.Portfolios).FirstOrDefaultAsync(u => u.Id == userIdFromToken);
            var cryptoPricesTask =  _crypto.GetMarketPriceAsync();
            await Task.WhenAll(userTask, cryptoPricesTask);
            var user = userTask.Result;
            var allInfoCrypto = cryptoPricesTask.Result;
            
            if (user == null)
            {
                return NotFound(new { Success = false, Message = "Utilisateur introuvable dans la base de données." });
            }

            // On récupère les informations sur les cryptos actuellement
            if(allInfoCrypto == null)
            {
                return NotFound(new { Success = false, Message = "Impossible de récupérer le cours du marché des cryptos" });
            }


            // On calcul le dashboard
            var dashboard =  _middleOffice.CalculateDashboard(user, allInfoCrypto);
            return Ok(dashboard);
        }
        catch(Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur Dashboard : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de la récupération des valeurs du DashBoard");
        }
        
    }


    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderBoard([FromQuery] string? sortBy)
    {
        try
        {
            sortBy = sortBy?.ToLower();
            var validCriteria = new[] { "nlv", "cryptovalue", "activity", "percentage" };

            if (string.IsNullOrEmpty(sortBy) || !validCriteria.Contains(sortBy))
            {
                sortBy = "nlv"; 
            }
            
            var allUsersTask = _context.Users.Include(u => u.Portfolios).Include(u => u.Transactions).ToListAsync();
            var cryptoPricesTask =  _crypto.GetMarketPriceAsync();


            await Task.WhenAll(allUsersTask, cryptoPricesTask);
            var allUsers = allUsersTask.Result;
            var allInfoCrypto = cryptoPricesTask.Result;
            
            if (allUsers == null)
            {
                return NotFound(new { Success = false, Message = "Impossible de charger tous les utilisateurs" });
            }
            if(allInfoCrypto == null)
            {
                return NotFound(new { Success = false, Message = "Impossible de récupérer le cours du marché des cryptos" });
            }


            var leaderboard =  await _middleOffice.GetLeaderboardAsync(allUsers, allInfoCrypto, sortBy);
            return Ok(leaderboard);
        }
        catch(Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur LeaderBoard : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de la récupération des 10 valeurs du LeaderBoard");
        }


    }










    

}