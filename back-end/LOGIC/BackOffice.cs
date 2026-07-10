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
            existingPosition.Quantity -= request.Quantity;

            // Si la quantité tombe à 0, on supprime la ligne du portefeuille
            if (existingPosition.Quantity <= 0)
            {
                _context.Portfolios.Remove(existingPosition);
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