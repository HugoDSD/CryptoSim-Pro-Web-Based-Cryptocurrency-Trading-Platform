using BackEnd_CryptoSim.LOGIC.Services.Interfaces;
using BackEnd_CryptoSim.LOGIC.Services.Interfaces;
using BackEnd_CryptoSim.MODEL;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using BackEnd_CryptoSim.PERSIST;
using Microsoft.EntityFrameworkCore;

namespace BackEnd_CryptoSim.LOGIC.Services
{
    public class WatchListService : IWatchList
    {
        private readonly AppDb _context;

        public WatchListService(AppDb context)
        {
            _context = context;
        }
        public async Task<IEnumerable<CryptoPriceDto>> GetAllWatchListAsync (AppUser user,  IEnumerable<CryptoPriceDto> allPrices)
        {
            try
            {
            // On extrait la liste des CryptoId suivis par l'utilisateur
            var userCryptoIds = user.Watchlists
                .Select(w => w.CryptoId.ToLower())
                .ToHashSet(); // HashSet pour une recherche en complexité O(1)

            // On filtre les prix du marché global pour ne garder que ceux de l'utilisateur
            var userWatchlistPrices = allPrices.Where(p => userCryptoIds.Contains(p.Id.ToLower())).ToList();

            return userWatchlistPrices;
            }
            catch(Exception Ex)
            {
                Console.WriteLine($"[ERROR] Erreur WatchList : {Ex.Message}");
                throw;
            }
        }
         public async Task<CryptoPriceDto> AddCryptoWatchListAsync(AppUser user, string cryptoId)
         {
            try
            {
            var cleanCryptoId = cryptoId.ToLower();

            // Vérification si la crypto est déjà présente dans la liste pour éviter les doublons
            var alreadyExists = user.Watchlists.Any(w => w.CryptoId.ToLower() == cleanCryptoId);
            
            if (!alreadyExists)
            {
                var newWatchItem = new Watchlist
                {
                    UserId = user.Id,
                    CryptoId = cleanCryptoId
                };

                _context.Watchlists.Add(newWatchItem);
                await _context.SaveChangesAsync();
            }
            return new CryptoPriceDto
            {
                Id = cleanCryptoId
            };
            }
            catch(Exception Ex)
            {
                Console.WriteLine($"[ERROR] Erreur WatchList : {Ex.Message}");
                throw;
            }
         }
         public async Task<(bool Success, string Message)> DeleteCryptoWatchListAsync(AppUser user,string cryptoId)
        {
            try
            {
            var cleanCryptoId = cryptoId.ToLower();

            // Recherche de la ligne correspondante dans la table de jointure
            var watchItem = await _context.Watchlists.FirstOrDefaultAsync(w => w.UserId == user.Id && w.CryptoId.ToLower() == cleanCryptoId);
            if (watchItem == null)
            {
                return (false, "Cette crypto-monnaie ne figure pas dans votre Watchlist.");
            }

            _context.Watchlists.Remove(watchItem);
            await _context.SaveChangesAsync();

            return (true, $"{cryptoId.ToUpper()} a été retiré de votre Watchlist avec succès.");
            }
            catch(Exception Ex)
            {
                Console.WriteLine($"[ERROR] Erreur WatchList : {Ex.Message}");
                throw;
            }
        } 

    }
}