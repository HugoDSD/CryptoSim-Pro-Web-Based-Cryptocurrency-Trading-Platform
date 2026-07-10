using BackEnd_CryptoSim.MODEL.APP.DTOs;

namespace BackEnd_CryptoSim.LOGIC.Interfaces;

public interface IAuthService
{
    // On retourne un booléen et un message (ou une liste d'erreurs)
    Task<(bool Success, IEnumerable<string> Errors)> RegisterUserAsync(string email, string password, string name, string surname);
    Task<(bool Success, string? Token, IEnumerable<string> Errors)> LoginUser(string email, string password);
    
}



public interface ICryptoPriceService
{
    Task <IEnumerable<CryptoPriceDto>> GetMarketPriceAsync();  // Will Allow us to get the prices for our 10 cryptos
    Task <CryptoPriceDto> GetPriceAsync(string cryptoID);              // Will allow us to get the prices for the crypto with this ID
}



    