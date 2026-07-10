
// Cette class à pour unique but de recuperer les informations de
namespace BackEnd_CryptoSim.COMMON
{
    public class TradingRulesSettings
    {
        public decimal MaxExposurePerAssetPercentage { get; set; }
        public decimal TransactionFeePercentage { get; set; }
        public decimal GlobalPortfolioExposureLimit { get; set; }
    }
}

