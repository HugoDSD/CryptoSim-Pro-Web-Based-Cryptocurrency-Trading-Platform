using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackEnd_CryptoSim.LOGIC.Services.Interfaces;
using BackEnd_CryptoSim.MODEL;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using BackEnd_CryptoSim.PERSIST;

namespace Back_end_Innovation_Project.APP.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AppDb _context;
    private readonly IProfileService _profile;

    public ProfileController(AppDb context, IProfileService profile)
    {
        _context = context;
        _profile = profile;
    }

    private async Task<AppUser?> GetCurrentUserAsync()
    {
        var userIdFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdFromToken))
        {
            return null;
        }
        return await _context.Users.FirstOrDefaultAsync(u => u.Id == userIdFromToken);
    }

    [HttpGet("show")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var user = await GetCurrentUserAsync();
            if (user == null)
            {
                return NotFound(new { Success = false, Message = "Utilisateur introuvable dans la base de données." });
            }

            var profile = await _profile.GetProfileAsync(user);
            return Ok(profile);
        }
        catch (Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur Profile : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de la récupération du profil.");
        }
    }

    [HttpPut("update")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto request)
    {
        try
        {
            var user = await GetCurrentUserAsync();
            if (user == null)
            {
                return NotFound(new { Success = false, Message = "Utilisateur introuvable dans la base de données." });
            }

            var (success, message, profile) = await _profile.UpdateProfileAsync(user, request);
            if (success)
            {
                return Ok(new { Success = true, Message = message, Profile = profile });
            }
            return BadRequest(new { Success = false, Message = message });
        }
        catch (Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur Profile : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors de la mise à jour du profil.");
        }
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto request)
    {
        try
        {
            var user = await GetCurrentUserAsync();
            if (user == null)
            {
                return NotFound(new { Success = false, Message = "Utilisateur introuvable dans la base de données." });
            }

            var (success, message) = await _profile.ChangePasswordAsync(user, request);
            if (success)
            {
                return Ok(new { Success = true, Message = message });
            }
            return BadRequest(new { Success = false, Message = message });
        }
        catch (Exception Ex)
        {
            Console.WriteLine($"[ERROR] Erreur Profile : {Ex.Message}");
            return StatusCode(500, "Une erreur est survenue lors du changement de mot de passe.");
        }
    }
}
