using BackEnd_CryptoSim.MODEL.APP.DTOs;
using BackEnd_CryptoSim.MODEL;

namespace BackEnd_CryptoSim.LOGIC.Interfaces;





public interface ICryptoPriceService
{
    Task <IEnumerable<CryptoPriceDto>> GetMarketPriceAsync();  // Will Allow us to get the prices for our 10 cryptos
    Task <CryptoPriceDto> GetPriceAsync(string cryptoID);              // Will allow us to get the prices for the crypto with this ID
    Task <IEnumerable<OhlcPointDto>> GetOhlcAsync(string cryptoID, int days); // Historique OHLC (pour les graphiques + indicateurs techniques)
}




    