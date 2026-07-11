using BackEnd_CryptoSim.LOGIC.Services.Interfaces;
using BackEnd_CryptoSim.MODEL;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using BackEnd_CryptoSim.PERSIST;
using Microsoft.EntityFrameworkCore;

namespace BackEnd_CryptoSim.LOGIC.Services
{
    public class PriceAlertService : IPriceAlert
    {
        private readonly AppDb _context;

        public PriceAlertService(AppDb context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PriceAlertResponseDto>> GetAllPriceAlertsAsync(AppUser user, bool onlyActive)
        {
            try
            {
                var AnswerPriceAlert = new List<PriceAlertResponseDto>();
                var AllUserAlerts = user.PriceAlerts;
                if (AllUserAlerts == null)
                {
                    return AnswerPriceAlert;
                }
                
                foreach(var priceAlert in AllUserAlerts)
                {
        
                    if (onlyActive && !priceAlert.IsActive)
                    {
                        continue; 
                    }

                    
                    var dto = new PriceAlertResponseDto
                    {
                        Id = priceAlert.Id,
                        CryptoId = priceAlert.CryptoId,
                        TargetPrice = priceAlert.TargetPrice,
                        Direction = priceAlert.Direction,
                        IsActive = priceAlert.IsActive
                    };

                    
                    AnswerPriceAlert.Add(dto);
                }

                return AnswerPriceAlert;
            }
            catch(Exception Ex)
            {
                Console.WriteLine($"[ERROR] Erreur Price alert : {Ex.Message}");
                throw;
            }
        }

        public async Task<PriceAlertResponseDto> PutPriceAlertAsync(AppUser user, CreatePriceAlertDto request)
        {
            try
            {
                //  On instancie l'entité de base de données à partir du DTO de requête
                var newAlert = new PriceAlert
                {
                    UserId = user.Id,
                    CryptoId = request.CryptoId.Trim().ToLower(),
                    TargetPrice = request.TargetPrice,
                    Direction = request.Direction,
                    IsActive = true // Active par défaut
                };

                // On l'ajoute au DbSet et on pousse en base de données
                _context.PriceAlerts.Add(newAlert);
                await _context.SaveChangesAsync();

                // On retourne le DTO de réponse avec l'Id généré automatiquement par SQL
                return new PriceAlertResponseDto
                {
                    Id = newAlert.Id, // L'Id SQL est maintenant peuplé grâce au SaveChanges
                    CryptoId = newAlert.CryptoId,
                    TargetPrice = newAlert.TargetPrice,
                    Direction = newAlert.Direction,
                    IsActive = newAlert.IsActive
                };
            }
            catch (Exception Ex)
            {
                Console.WriteLine($"[ERROR] Erreur lors de l'insertion de l'alerte : {Ex.Message}");
                throw;
            }
        }
        

        public async Task<PriceAlertResponseDto> ToggleAlertAsync(AppUser user, int Id)
        {
            try
            {
                // On cherche l'alerte par son Id et on sécurise en vérifiant le UserId
                var alert = await _context.PriceAlerts.FirstOrDefaultAsync(pa => pa.Id == Id && pa.UserId == user.Id);

                if (alert == null)
                {
                    throw new KeyNotFoundException("L'alerte demandée est introuvable ou ne vous appartient pas.");
                }

                // On inverse l'état de l'alerte (Interrupteur On/Off)
                alert.IsActive = !alert.IsActive;

                // On sauvegarde la modification dans la base de données
                await _context.SaveChangesAsync();

                //  On retourne l'alerte mise à jour sous forme de DTO
                return new PriceAlertResponseDto
                {
                    Id = alert.Id,
                    CryptoId = alert.CryptoId,
                    TargetPrice = alert.TargetPrice,
                    Direction = alert.Direction,
                    IsActive = alert.IsActive
                };
            }
            catch (Exception Ex)
            {
                Console.WriteLine($"[ERROR] Erreur lors du basculement de l'alerte {Id} : {Ex.Message}");
                throw;
            }
        }

        public async Task<(bool Success, string Message)> DeletePriceAlertAsync(AppUser user, int Id)
        {
            try
            {
                // 1. On cherche l'alerte en s'assurant qu'elle appartient à l'utilisateur
               var alert = await _context.PriceAlerts.FirstOrDefaultAsync<PriceAlert>(pa => pa.Id == Id && pa.UserId == user.Id);

                if (alert == null)
                {
                    return (false, "L'alerte est introuvable ou ne vous appartient pas.");
                }

                //  On la supprime du DbSet
                _context.PriceAlerts.Remove(alert);

                // On applique la suppression dans la base de données
                await _context.SaveChangesAsync();

                // On retourne le tuple de succès
                return (true, "L'alerte a été supprimée avec succès.");
            }
            catch (Exception Ex)
            {
                Console.WriteLine($"[ERROR] Erreur lors de la suppression de l'alerte {Id} : {Ex.Message}");
                return (false, "Une erreur système est survenue lors de la suppression.");
            }
        }
    }
}