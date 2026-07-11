using BackEnd_CryptoSim.PERSIST;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using Microsoft.Extensions.Caching.Memory;
using BackEnd_CryptoSim.MODEL;
using BackEnd_CryptoSim.LOGIC.Services.Interfaces;
using  BackEnd_CryptoSim.COMMON;
using Microsoft.Extensions.Options; // permet de  gérer le chaos et le manque de sécurisée des fichiers de configuration en passant par IOptions.
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;




namespace BackEnd_CryptoSim.LOGIC.Services
{
    public class BackOffice : IBackOffice{
        
        private readonly TradingRulesSettings _rules;
        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly AppDb _context;
        public BackOffice(IOptions<TradingRulesSettings> options, UserManager<AppUser> userManager, IConfiguration configuration, AppDb context)
        {
            _rules = options.Value;
            _userManager = userManager;
            _configuration = configuration;
            _context=context;
        }
        
        public async Task<(bool Success, string Message)> ExecuteTradeAsync(string userId, TradeRequestDto request, decimal crypto_currentvalue)
        {
            
            var user = await _context.Users
                .Include(u => u.Portfolios)
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null) return (false, "Utilisateur introuvable.");

            decimal brutValue = request.Quantity * crypto_currentvalue;
            decimal feeAmount = brutValue * _rules.TransactionFeePercentage;
            
            if (request.Type == "BUY")
            {   
                decimal totalCost = brutValue + feeAmount;
                user.CashBalance -= totalCost; // Débit du cash

                // On cherche si l'utilisateur possède déjà cette ligne de portefeuille
                var existingPosition = user.Portfolios.FirstOrDefault(p => p.CryptoId == request.CryptoId);

                if (existingPosition == null)
                {
                    // Nouvelle ligne
                    var newPosition = new Portfolio
                    {
                        UserId = userId,
                        CryptoId = request.CryptoId,
                        Quantity = request.Quantity,
                        AvgBuyPrice = crypto_currentvalue // Il suffit de lui donner le prix actuel de la crypto
                    };
                    _context.Portfolios.Add(newPosition);
                }
                else
                {
                    // On recalcul  la quantité et AvgBuyPrice
                    decimal totalQuantity = existingPosition.Quantity + request.Quantity;
                    decimal totalCostBasis = (existingPosition.Quantity * existingPosition.AvgBuyPrice) + (request.Quantity * crypto_currentvalue);
                    
                    existingPosition.AvgBuyPrice = totalCostBasis / totalQuantity;
                    existingPosition.Quantity = totalQuantity;
                }
            }



        else if (request.Type == "SELL")
        {
            decimal netProceeds = brutValue - feeAmount;
            user.CashBalance += netProceeds; // Crédit du cash après déduction des frais

            var existingPosition = user.Portfolios.FirstOrDefault(p => p.CryptoId == request.CryptoId);
            
            // On réduit la quantité possédée
            if (existingPosition != null)
            {
                // Si la quantité vendue est égale à la quantité possédée, on supprime directement l'objet
                if (existingPosition.Quantity == request.Quantity)
                {
                    _context.Portfolios.Remove(existingPosition);
                }
                else
                {
                    // Sinon, on réduit simplement la quantité (la vérification de concurrence s'appliquera)
                    existingPosition.Quantity -= request.Quantity;
                }
            }
        }

        // 4. Ajouter l'historique de la transaction (si tu as une table Transaction)
        var transactionLog = new Transaction
        {
            UserId = userId,
            CryptoId = request.CryptoId,
            Type = request.Type,         
            Quantity = request.Quantity,
            Price = crypto_currentvalue,  
            Fee = feeAmount,              
            CreatedAt = DateTime.UtcNow   
        };
        _context.Transactions.Add(transactionLog);
        // On sauvergarde les modifications dans la Base de Données
        try
        {
            await _context.SaveChangesAsync();
            return (true, $"L'ordre de {request.Type} pour {request.Quantity} {request.CryptoId} a été exécuté avec succès.");
        }
        catch (DbUpdateConcurrencyException)
        {
            // Si on arrive ici, c'est qu'une autre requête a modifié le Cash ou la Quantity en même temps.
            // On annule tout et on demande au Front-end de réessayer.
            return (false, "Une transaction est déjà en cours sur votre portefeuille. Veuillez réessayer dans quelques instants.");
        }
        catch (Exception ex)
        {
            return (false, $"Échec du règlement-livraison en base de données : {ex.Message}");
        }
            }

    public async Task<IEnumerable<TransactionHistoryDto>> GetTransactionHistoryAsync(string userId)
    {
        return await _context.Transactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt) // Les plus récentes en premier
            .Select(t => new TransactionHistoryDto
            {
                Id = t.Id,
                CryptoId = t.CryptoId,
                Type = t.Type,
                Quantity = t.Quantity,
                Price = t.Price,
                Fee = t.Fee,
                CreatedAt = t.CreatedAt
            }).ToListAsync();
        }
    }     
}



/*
            Logique : 

    Ici on a mis en place une concurrence optimiste. C'est a dire que dans les classe AppUser.cs et Portfolio.cs on desormais un [ConcurrencyCheck] qui s'assure que la valeur
    de CashBalance et Quantity n'est pas modifié par une autre execition de Execute que la notre. L'erreur sera ainsi capté ici par le catch (DbUpdateConcurrencyException)
    C'est ultra-léger car on ne bloque pas la base de données avec des verrous lourds qui ralentissent l'application. On part du principe 
    que le spam de requêtes est rare, mais si cela arrive, la base de données rejette le doublon instantanément et protège le compte de l'utilisateur.

*/