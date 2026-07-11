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
public class PriceAlertController : ControllerBase
{
    
    private readonly AppDb _context;
    private readonly IPriceAlert _alert;

    public PriceAlertController(AppDb context, IPriceAlert alert)
    {
        _context=context;
        _alert= alert;
    }


    [HttpGet("show")]
    public async Task<IActionResult> GetAllPriceAlerts([FromQuery] bool? onlyActive)
    {
        try
        {
            // On recupère les informations de l'utilisateurs (en particulier ses prices alerts)
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdFromToken))
            {
                return BadRequest(new { Success = false, Message = "Impossible d'identifier l'utilisateur à partir du token." });
            } 
            var user =  await _context.Users.Include(u => u.PriceAlerts).FirstOrDefaultAsync(u => u.Id == userIdFromToken);
            if (user == null)
            {
               return NotFound(new { Success = false, Message = "Utilisateur introuvable dans la base de données." });
            }

            var allpricealert = await  _alert.GetAllPriceAlertsAsync(user, onlyActive ?? false);
            return Ok(allpricealert);
        }
        catch(Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur Price alert : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de la récupération de tous les Price alert");
        }
    }

    [HttpPost("create")]
    public async Task<IActionResult> PutPriceAlert([FromBody] CreatePriceAlertDto request)
    {
        try
        {
            //On gère le cas ou Direction est faux ou vide meme si elle passe déja par le DTO
            var validCriteria = new[] { "ABOVE", "BELOW"};

            if (string.IsNullOrEmpty(request.Direction) || !validCriteria.Contains(request.Direction))
            {
                request.Direction = "ABOVE"; 
            }
            if (string.IsNullOrWhiteSpace(request.CryptoId))
            {
                return BadRequest(new { Success = false, Message = "L'identifiant de la crypto ne peut pas être vide." });
            }

            // On recupère les informations de l'utilisateurs (en particulier ses prices alerts)
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdFromToken))
            {
                return BadRequest(new { Success = false, Message = "Impossible d'identifier l'utilisateur à partir du token." });
            } 
            var user =  await _context.Users.Include(u => u.PriceAlerts).FirstOrDefaultAsync(u => u.Id == userIdFromToken);
            if (user == null)
            {
               return NotFound(new { Success = false, Message = "Utilisateur introuvable dans la base de données." });
            }

            var allpricealert = await _alert.PutPriceAlertAsync(user, request);
            return Ok(allpricealert);
        }
        catch(Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur Price alert : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de la création de l'alerte");
        }
    }

    [HttpPut("toggle/{id}")]
    public async Task<IActionResult> ToggleAlert([FromRoute] int Id)
    {
        try
        {
            // On recupère les informations de l'utilisateurs (en particulier ses prices alerts)
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdFromToken))
            {
                return BadRequest(new { Success = false, Message = "Impossible d'identifier l'utilisateur à partir du token." });
            } 
            var user =  await _context.Users.Include(u => u.PriceAlerts).FirstOrDefaultAsync(u => u.Id == userIdFromToken);
            if (user == null)
            {
               return NotFound(new { Success = false, Message = "Utilisateur introuvable dans la base de données." });
            }
            var allpricealert = await _alert.ToggleAlertAsync(user, Id);
            return Ok(allpricealert);
        }
        catch(Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur Price alert : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de la création de l'alerte");
        }
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeletePriceAlert([FromRoute] int Id)
    {
        try
        {
            // On recupère les informations de l'utilisateurs (en particulier ses prices alerts)
            var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdFromToken))
            {
                return BadRequest(new { Success = false, Message = "Impossible d'identifier l'utilisateur à partir du token." });
            } 
            var user =  await _context.Users.Include(u => u.PriceAlerts).FirstOrDefaultAsync(u => u.Id == userIdFromToken);
            if (user == null)
            {
               return NotFound(new { Success = false, Message = "Utilisateur introuvable dans la base de données." });
            }
            var (Success, Message) = await _alert.DeletePriceAlertAsync(user, Id);
            if (Success)
            {
                return Ok(new { Success = true, Message = Message });
            }
            else
            {
                return BadRequest(new { Success = false, Message = Message });
            }
        }
        catch(Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur Price alert : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de la création de l'alerte");
        }
    }



}