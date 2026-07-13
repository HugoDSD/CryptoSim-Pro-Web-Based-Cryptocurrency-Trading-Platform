using BackEnd_CryptoSim.PERSIST;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using Microsoft.Extensions.Caching.Memory;
using BackEnd_CryptoSim.MODEL;

namespace BackEnd_CryptoSim.LOGIC.Services.Interfaces
{
    public interface IMiddleOffice
    {
        /// <summary>
        /// Exécute mathématiquement l'ordre (calcul des frais, mise à jour du PRU, débit/crédit du solde) 
        /// et enregistre la transaction de manière immuable en base de données.
        /// </summary>
        /// <param name="userId">L'identifiant unique de l'utilisateur concerné.</param>
        /// <param name="request">Les paramètres de l'ordre (déjà validés par le Middle Office).</param>
        /// <param name="executionPrice">Le prix unitaire exact figé au moment de l'exécution.</param>
        /// <returns>Un tuple asynchrone confirmant le succès de l'opération en base de données.</returns>
        (bool IsValid, string ErrorMessage) ValidateTrade(AppUser user, TradeRequestDto request, IEnumerable<CryptoPriceDto> allPrices);
        PortfolioTotalDashboardDto CalculateDashboard(AppUser user, IEnumerable<CryptoPriceDto> allPrices);
        Task<IEnumerable<LeaderBoardUserDto>> GetLeaderboardAsync(IEnumerable<AppUser> allUsers, IEnumerable<CryptoPriceDto> allPrices, string sortBy );
    }

}
