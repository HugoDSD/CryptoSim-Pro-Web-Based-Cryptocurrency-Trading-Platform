using BackEnd_CryptoSim.PERSIST;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using Microsoft.Extensions.Caching.Memory;
using BackEnd_CryptoSim.MODEL;

namespace BackEnd_CryptoSim.LOGIC.Services.Interfaces
{
    public interface IPriceAlert
    {
        
        Task<IEnumerable<PriceAlertResponseDto>> GetAllPriceAlertsAsync (AppUser user, bool onlyActive);
        Task<PriceAlertResponseDto> PutPriceAlertAsync(AppUser user,CreatePriceAlertDto request);        
        Task<PriceAlertResponseDto> ToggleAlertAsync(AppUser user, int Id);
        Task<(bool Success, string Message)> DeletePriceAlertAsync(AppUser user, int Id);
    }

}
