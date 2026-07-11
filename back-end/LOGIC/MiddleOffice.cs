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



        public PortfolioTotalDashboardDto CalculateDashboard(AppUser user, IEnumerable<CryptoPriceDto> allPrices)
        {
            var dashboard = new PortfolioTotalDashboardDto
            {
                CashBalance = user.CashBalance, 
                Portfolios = new List<PortfolioIndividualDashboardDto>()
            };

            // On convertie notre liste en dictionnaire avec pour clé l'id de le crypto
            var priceDictionary = allPrices.ToDictionary(p => p.Id, p => p.CurrentPrice);
            
            var individualPositions = new List<PortfolioIndividualDashboardDto>();
            decimal totalInitialCostOfCrypto = 0;

            //  Boucle sur chacune des cryptos de notre portofolio global
            if (user.Portfolios != null)
            {
                foreach (var position in user.Portfolios)
                {
                    // Récupère le prix actuel ou 0 si la crypto n'est pas trouvée
                    decimal currentPrice = priceDictionary.GetValueOrDefault(position.CryptoId, 0);
                    
                    decimal initialCost = position.Quantity * position.AvgBuyPrice;
                    decimal totMarketValue = position.Quantity * currentPrice;
                    decimal pAndL = totMarketValue - initialCost;
                    
                    // Calcul du pourcentage de P&L de la ligne (évite la division par zéro)
                    decimal pAndLPercentage;
                    if (initialCost > 0)
                    {
                        pAndLPercentage = (pAndL / initialCost) * 100;
                    }
                    else
                    {
                        pAndLPercentage = 0;
                    }

                    // Instanciation du DTO individuel
                    var individualDto = new PortfolioIndividualDashboardDto
                    {
                        CryptoId = position.CryptoId,
                        Quantity = position.Quantity,
                        AvgBuyPrice = position.AvgBuyPrice,
                        CurrentPrice = currentPrice,
                        InitialCost = initialCost,
                        TotMarketValue = totMarketValue,
                        PAndL = pAndL,
                        PAndLPercentage = pAndLPercentage
                    };

                    individualPositions.Add(individualDto);

                    // Performance global du portfolio
                    dashboard.TotalCryptoValue += totMarketValue;
                    totalInitialCostOfCrypto += initialCost;
                }
            }

            // On termine les derniers calcul concernant le portfolio
            dashboard.Portfolios = individualPositions;
            dashboard.NetLiquidationValue = dashboard.CashBalance + dashboard.TotalCryptoValue;
            dashboard.TotalPAndL = dashboard.TotalCryptoValue - totalInitialCostOfCrypto;
            
            if (totalInitialCostOfCrypto > 0)
            {
                dashboard.EarningReturn = (dashboard.TotalPAndL / totalInitialCostOfCrypto) * 100;
            }
            else
            {
                dashboard.EarningReturn = 0;
            }

            return dashboard;
        }

        public Task<IEnumerable<LeaderBoardUserDto>> GetLeaderboardAsync(IEnumerable<AppUser> allUsers, IEnumerable<CryptoPriceDto> allPrices, string sortBy)
        {
            var leaderboardList = new List<LeaderBoardUserDto>();

            //  On boucle sur tous les utilisateurs pour recuperer les informations du dashboard
            foreach (var user in allUsers)
            {
               
                var userDashboard = CalculateDashboard(user, allPrices);

                //  On extrait juste ce dont le leaderboard a besoin 
                leaderboardList.Add(new LeaderBoardUserDto
                {
                    UserName = $"{user.Name} {user.Surname}", 
                    NetLiquidationValue = userDashboard.NetLiquidationValue,
                    TotalPAndL = userDashboard.TotalPAndL,
                    EarningReturn = userDashboard.EarningReturn,
                    TotalCryptoValue = userDashboard.TotalCryptoValue, 
                    ActivityVolume = user.Transactions?.Count ?? 0
                });
            }

            // On applique le tri dynamique selon le paramètre de l'utilisateur
            IEnumerable<LeaderBoardUserDto> sortedList;
            if (sortBy == "percentage")
            {
                sortedList = leaderboardList.OrderByDescending(u => u.EarningReturn);
            }
            else if (sortBy == "cryptovalue")
            {
                sortedList = leaderboardList.OrderByDescending(u => u.TotalCryptoValue);
            }
            else if (sortBy == "activity")
            {
                sortedList = leaderboardList.OrderByDescending(u => u.ActivityVolume);
            }
            else
            {
                // Tri par défaut ("nlv")
                sortedList = leaderboardList.OrderByDescending(u => u.NetLiquidationValue);
            }

            // On extrait le top 10 et on attribut les rangs
            var top10 = sortedList
                .Take(10)
                .Select((userDto, index) => new LeaderBoardUserDto
                {
                    Classement = index + 1,
                    UserName = userDto.UserName,
                    NetLiquidationValue = userDto.NetLiquidationValue,
                    TotalPAndL = userDto.TotalPAndL,
                    EarningReturn = userDto.EarningReturn,
                    TotalCryptoValue = userDto.TotalCryptoValue,
                    ActivityVolume = userDto.ActivityVolume
                })
                .ToList();

            return Task.FromResult<IEnumerable<LeaderBoardUserDto>>(top10);
        }




    }
}