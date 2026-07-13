using BackEnd_CryptoSim.PERSIST;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using Microsoft.Extensions.Caching.Memory;
using BackEnd_CryptoSim.MODEL;
using Microsoft.AspNetCore.Mvc;

namespace BackEnd_CryptoSim.LOGIC.Services.Interfaces
{
    public interface IWatchList
    {
        
        Task<IEnumerable<CryptoPriceDto>> GetAllWatchListAsync (AppUser user,  IEnumerable<CryptoPriceDto> allPrices);
        Task<CryptoPriceDto> AddCryptoWatchListAsync(AppUser user, string cryptoId);  
        Task<(bool Success, string Message)> DeleteCryptoWatchListAsync(AppUser user,string cryptoId);  
    }

}
