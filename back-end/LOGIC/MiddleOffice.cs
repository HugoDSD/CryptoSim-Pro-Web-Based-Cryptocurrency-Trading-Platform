using BackEnd_CryptoSim.PERSIST;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using Microsoft.Extensions.Caching.Memory;
using BackEnd_CryptoSim.MODEL;
using BackEnd_CryptoSim.LOGIC.Services.Interfaces;
using  BackEnd_CryptoSim.COMMON;
using Microsoft.Extensions.Options; // permet de  gérer le chaos et le manque de sécurisée des fichiers de configuration en passant par IOptions.



namespace BackEnd_CryptoSim.LOGIC.Services
{
    public class MiddleOffice: IMiddleOffice
    {
        
        private readonly TradingRulesSettings _rules;
        private readonly ICryptoPriceService _crypto;
        public MiddleOffice(IOptions<TradingRulesSettings> options, ICryptoPriceService crypto)
        {
            _rules = options.Value;
            _crypto= crypto;
        }
        
        
        
        public (bool IsValid, string ErrorMessage) ValidateTrade(AppUser user, TradeRequestDto request, IEnumerable<CryptoPriceDto> allPrices)
        {
            // On convertie notre liste en dictionnaire avec pour clé l'id de le crypto
            var priceDictionary = allPrices.ToDictionary(p => p.Id, p => p.CurrentPrice);
            if (priceDictionary.ContainsKey(request.CryptoId))
            {
                decimal currentMarketPrice = priceDictionary[request.CryptoId];
                decimal Quantity = request.Quantity;
                decimal brut_value = Quantity * currentMarketPrice;
                decimal fee_amount = brut_value * _rules.TransactionFeePercentage;
                decimal tot_cost = brut_value + fee_amount;
                
                ICollection<Portfolio> portfolio = user.Portfolios;
                decimal totalMarketValueOfPortfolio = 0;
                decimal tot_invested_our_crypto =0;
                
                foreach( var crypto in portfolio)
                {
                decimal price = priceDictionary.GetValueOrDefault(crypto.CryptoId, 0);
                totalMarketValueOfPortfolio += (crypto.Quantity * price);
                if(crypto.CryptoId == request.CryptoId)
                    {
                        tot_invested_our_crypto = crypto.Quantity *priceDictionary[crypto.CryptoId] ;
                    }  
                }

                decimal nlv = totalMarketValueOfPortfolio + user.CashBalance;
                if(request.Type == "BUY")
                {
                    if(tot_cost > user.CashBalance)
                    {
                        return (false,"The amount invested exceeds the cash available");
                    }
                    if((tot_cost + totalMarketValueOfPortfolio) > (nlv * _rules.GlobalPortfolioExposureLimit))
                    {
                        return (false, "L'ordre dépasse la limite d'exposition globale autorisée du portefeuille.");
                    }
                    return (true, "Trade validé.");
                }
                else if(request.Type == "SELL")
                {
                    
                var existingPosition = user.Portfolios.FirstOrDefault(p => p.CryptoId == request.CryptoId);
                    if (existingPosition == null)
                    {
                        return (false, $"Vous ne pouvez pas vendre cette crypto car vous n'en possédez pas.");
                    }

                    // 2. Vérifier que la quantité possédée est suffisante
                    if (existingPosition.Quantity < request.Quantity)
                    {
                        return (false, $"Quantité insuffisante. Vous tentez de vendre {request.Quantity} mais vous n'en possédez que {existingPosition.Quantity}.");
                    }
                }
                else
                {
                    return (false, "Type d'ordre invalide (doit être BUY ou SELL).");
                }
            }
            else
            {
                return (false, "Crypto non trouvée dans le dictionnaire.");
            }
            return (true, "Trade validé.");
        }
    }

}