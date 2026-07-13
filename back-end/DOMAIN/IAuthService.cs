using BackEnd_CryptoSim.MODEL.APP.DTOs;
using BackEnd_CryptoSim.MODEL;

namespace BackEnd_CryptoSim.LOGIC.Interfaces;

public interface IAuthService
{
    // On retourne un booléen et un message (ou une liste d'erreurs)
    Task<(bool Success, IEnumerable<string> Errors)> RegisterUserAsync(string email, string password, string name, string surname);
    Task<(bool Success, string? Token, IEnumerable<string> Errors)> LoginUser(string email, string password);
    
}