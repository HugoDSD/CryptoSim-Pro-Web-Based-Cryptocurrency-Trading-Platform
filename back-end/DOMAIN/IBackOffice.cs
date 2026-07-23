using BackEnd_CryptoSim.PERSIST;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using Microsoft.Extensions.Caching.Memory;
using BackEnd_CryptoSim.MODEL;

namespace BackEnd_CryptoSim.LOGIC.Services.Interfaces
{
    public interface IBackOffice
    {
        /// <summary>
        /// Exécute mathématiquement l'ordre (calcul des frais, mise à jour du PRU, débit/crédit du solde) 
        /// et enregistre la transaction de manière immuable en base de données.
        /// </summary>
        /// <param name="userId">L'identifiant unique de l'utilisateur concerné.</param>
        /// <param name="request">Les paramètres de l'ordre (qui ont DÉJÀ été validés par le Middle Office).</param>
        /// <param name="executionPrice">Le prix unitaire exact figé au moment de l'exécution.</param>
        /// <returns>Un tuple asynchrone confirmant le succès de l'opération en base de données.</returns>
        Task<(bool Success, string Message)> ExecuteTradeAsync(string userId, TradeRequestDto request, decimal crypto_currentvalue);

        Task<IEnumerable<TransactionHistoryDto>> GetTransactionHistoryAsync(string userId);
    }


    

}
