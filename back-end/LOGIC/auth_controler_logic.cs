using Microsoft.AspNetCore.Identity;
using BackEnd_CryptoSim.MODEL;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;



namespace BackEnd_CryptoSim.LOGIC.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _configuration; // permet de lire le fichier de configuration (appsetting.json) pour récupérer la clé secrète du JWT 

    public AuthService(UserManager<AppUser> userManager, IConfiguration configuration  )
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<(bool Success, IEnumerable<string> Errors)> RegisterUserAsync(string email, string password, string name, string surname)
    {
        var user = new AppUser
        {
            UserName = email,
            Email = email,
            Name = name,
            Surname = surname
        };

        var result = await _userManager.CreateAsync(user, password);

        if (result.Succeeded)
        {
            return (true, Array.Empty<string>());
        }

        // Si ça échoue, on extrait les descriptions des erreurs
        var errors = result.Errors.Select(e => e.Description);
        return (false, errors);
    }

    public async Task<(bool Success, string? Token, IEnumerable<string> Errors)> LoginUser(string email, string password)
    {
       var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            return (false,null,new[] { "Email d'utilisateur non trouvé" });
        }
        var result = await _userManager.CheckPasswordAsync(user, password);
        if (!result)
        {
            return (false, null, new[] { "Mot de passe incorrect" });
        }
        
        
        
        
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(ClaimTypes.GivenName, user.Name),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };



        var secretKey = _configuration["JwtSettings:Secret"];
        if (string.IsNullOrEmpty(secretKey))
        {
            throw new Exception("La clé secrète pour JWT n'est pas configurée. Demander à hugo le fichier appsettings.json");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(2), 
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenObject = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(tokenObject);

        return (true, tokenString, Array.Empty<string>());
            
    }

    
}