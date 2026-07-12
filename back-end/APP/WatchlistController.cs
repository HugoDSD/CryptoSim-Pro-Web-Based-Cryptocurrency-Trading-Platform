using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using BackEnd_CryptoSim.LOGIC.Services.Interfaces;
using BackEnd_CryptoSim.PERSIST;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Back_end_Innovation_Project.APP.Controllers;


[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WatchListController : ControllerBase
{
    private readonly AppDb _context;
    private readonly IWatchList _watchlist;
    private readonly ICryptoPriceService _crypto;

    public WatchListController (AppDb context, IWatchList watchlist, ICryptoPriceService crypto)
    {
        _context=context;
        _watchlist=watchlist;
        _crypto=crypto;
    }

    [HttpGet("show")]
    public async Task<IActionResult> GetAllWatchList()
    {
        try
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdFromToken))
            {
                return BadRequest(new { Success = false, Message = "Impossible d'identifier l'utilisateur à partir du token." });
            } 
            
            var UsersTask =  _context.Users.Include(u => u.Watchlists).FirstOrDefaultAsync(u => u.Id == userIdFromToken);
            var cryptoPricesTask =  _crypto.GetMarketPriceAsync();


            await Task.WhenAll(UsersTask, cryptoPricesTask);
            
            var user = UsersTask.Result;
            var allInfoCrypto = cryptoPricesTask.Result;
            
            if (user == null)
            {
                return NotFound(new { Success = false, Message = "Impossible de charger tous les utilisateurs" });
            }
            if(allInfoCrypto == null)
            {
                return NotFound(new { Success = false, Message = "Impossible de récupérer le cours du marché des cryptos" });
            }



            var allwatchlist = await  _watchlist.GetAllWatchListAsync(user,allInfoCrypto );
            return Ok(allwatchlist);
        }
        catch(Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur Price alert : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de la récupération de tous la WatchList");
        }

    }

    [HttpPost("add/{cryptoId}")]
    public async Task<IActionResult> AddCryptoWatchList([FromRoute] string cryptoId)
    {
        try
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdFromToken))
            {
                return BadRequest(new { Success = false, Message = "Impossible d'identifier l'utilisateur à partir du token." });
            } 
            
            var UsersTask =  _context.Users.Include(u => u.Watchlists).FirstOrDefaultAsync(u => u.Id == userIdFromToken);
            var cryptoPricesTask =  _crypto.GetMarketPriceAsync();


            await Task.WhenAll(UsersTask, cryptoPricesTask);
            
            var user = UsersTask.Result;
            var allInfoCrypto = cryptoPricesTask.Result;
            
            if (user == null)
            {
                return NotFound(new { Success = false, Message = "Impossible de charger tous les utilisateurs" });
            }
            if(allInfoCrypto == null)
            {
                return NotFound(new { Success = false, Message = "Impossible de récupérer le cours du marché des cryptos" });
            }



            var addwatchlist = await  _watchlist.AddCryptoWatchListAsync(user,cryptoId );
            return Ok(addwatchlist);
        }
        catch(Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur Price alert : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de l'ajout de la crypto de la WatchList");
        }
    }

    [HttpDelete("delete/{cryptoId}")]
    public async Task<IActionResult> DeleteCryptoWatchList([FromRoute] string cryptoId)
    {
       try
        {
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdFromToken))
            {
                return BadRequest(new { Success = false, Message = "Impossible d'identifier l'utilisateur à partir du token." });
            } 
            
            var UsersTask =  _context.Users.Include(u => u.Watchlists).FirstOrDefaultAsync(u => u.Id == userIdFromToken);
            var cryptoPricesTask =  _crypto.GetMarketPriceAsync();


            await Task.WhenAll(UsersTask, cryptoPricesTask);
            
            var user = UsersTask.Result;
            var allInfoCrypto = cryptoPricesTask.Result;
            
            if (user == null)
            {
                return NotFound(new { Success = false, Message = "Impossible de charger tous les utilisateurs" });
            }
            if(allInfoCrypto == null)
            {
                return NotFound(new { Success = false, Message = "Impossible de récupérer le cours du marché des cryptos" });
            }



            var (success, message) = await _watchlist.DeleteCryptoWatchListAsync(user, cryptoId);
            if (success)
            {
                return Ok(new { Success = true, Message = message });
            }
            else
            {
                return BadRequest(new { Success = false, Message = message });
            }
        }
        catch(Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur WatchList : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de la deletion de la crypto de la WatchList");
        }
    }

}