using Microsoft.AspNetCore.Identity;
using BackEnd_CryptoSim.MODEL;
using BackEnd_CryptoSim.PERSIST;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using Microsoft.Extensions.Caching.Memory;
using System.Net.Http.Json;


namespace BackEnd_CryptoSim.LOGIC.Services;

public class CryptoPriceService : ICryptoPriceService
{
    private readonly AppDb _context;                  // Acceder à la base de donnée, voir si necessaire sinon supprimer 
    private readonly IConfiguration _configuration;   // permet de lire le fichier de configuration (appsetting.json) pour récupérer la clé secrète du JWT 
    private readonly HttpClient _httpClient;          // permet de connecter CryptoPriceService au réseau et de faire de requete à CoinGecko et de lire sa réponse
    private readonly IMemoryCache _cache;

    private const string MarketPricesCacheKey = "CryptoMarketPrices"; // Clé pour la valeurs des 10 cryptos
    private const string SinglePriceCacheKeyPrefix = "CryptoPrice_";  // Préfixe pour chacun des cryptos (Exemple : CryptoPrice_Bitcoin, CryptoPrice_Etherum ... )
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(30); // On choisi la durée de vie du cache a 30s
    public CryptoPriceService(AppDb context, IConfiguration configuration, HttpClient httpClient, IMemoryCache cache)
    {
        
        _context = context;
        _configuration = configuration;
        _httpClient = httpClient;
        _cache = cache;
        
        
        //On recupère la clé API depuis le fichier appsetting.json
        string apiKey = _configuration["CoinGecko:Secret"];
        if (!string.IsNullOrEmpty(apiKey))
        {
            // On ajoute le header requis par CoinGecko pour la clé API
            _httpClient.DefaultRequestHeaders.Add("x-cg-demo-api-key", apiKey);
        }
    }


     public async Task <IEnumerable<CryptoPriceDto>> GetMarketPriceAsync()
    {
        if (_cache.TryGetValue(MarketPricesCacheKey, out IEnumerable<CryptoPriceDto>? cachedPrices))
        {
            Console.WriteLine("[Cache] Récupération de la liste des prix depuis la mémoire vive.");
            return cachedPrices; // Retour instantané, l'appel HTTP est évité !
        }
        
        
        // on récupère l'addresse url de CoinGecko + la clé api configuré dans le fichier appsetting.json
        string baseUrl = _configuration["CoinGecko:Url"];

        try
        {
            var response = await _httpClient.GetAsync(baseUrl); 
            response.EnsureSuccessStatusCode();     // Si jamais une erreur (4XX ou 5XX est relevé, le throw est automatiquement activé, sinon on passe à la suite )  
            var result = await response.Content.ReadFromJsonAsync<Dictionary<string, CoinGeckoSimplePriceData>>(); // S'occupe de désérialisé le json envoyé par CoinGecko 
            
            List<CryptoPriceDto> final_result = new List<CryptoPriceDto> ();

            if (result !=null)
            {
                foreach (var cryptoresult in result)
                {
                    // cryptoresult.Key   -> contient le nom de la crypto (ex: "bitcoin", "ethereum")
                    // cryptoresult.Value -> contient l'objet CoinGeckoSimplePriceData (Usd, UsdMarketCap...)

                    var cryptoDto = new CryptoPriceDto
                    {
                        Id = cryptoresult.Key,                             
                        CurrentPrice = cryptoresult.Value.Usd,             
                        MarketCap = cryptoresult.Value.UsdMarketCap,       
                        PriceChange24h = cryptoresult.Value.Usd24hChange,
                        Volume24h = cryptoresult.Value.Usd24hVol
                    };

                    // 4. On ajoute cet objet complet à notre l
                    // 
                    // 
                    // iste
                    final_result.Add(cryptoDto);
                }
            }
            _cache.Set(MarketPricesCacheKey, final_result, CacheDuration);
            return final_result;
        }
        catch(Exception ex)
        {
            Console.WriteLine($"[CryptoPriceService] Erreur lors de la récupération des prix : {ex.Message}");
            throw;      // On relance l'erreur pour etre sur que le contrôleur soit au courant du problème
        }
       
        
    }

    public async Task <CryptoPriceDto> GetPriceAsync(string cryptoID)
    {
        // On génère la clé unique pour cette crypto spécifique
        string cacheKey = $"{SinglePriceCacheKeyPrefix}{cryptoID.ToLower()}";
        if (_cache.TryGetValue(cacheKey, out CryptoPriceDto? cachedPrice))
        {
            Console.WriteLine($"[Cache] Récupération du prix de {cryptoID} depuis la mémoire vive.");
            return cachedPrice;
        }


        string url = $"https://api.coingecko.com/api/v3/simple/price?ids={cryptoID.ToLower()}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true";

        try
        {
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<Dictionary<string, CoinGeckoSimplePriceData>>();
            
            List<CryptoPriceDto> final_result = new List<CryptoPriceDto> ();
            if(result!=null)
            {
        
                if (result != null && result.TryGetValue(cryptoID.ToLower(), out var data))
                {
                    var cryptoDto = new CryptoPriceDto
                    {
                        Id = cryptoID,                             
                        CurrentPrice = data.Usd,             
                        MarketCap = data.UsdMarketCap,       
                        PriceChange24h = data.Usd24hChange,
                        Volume24h = data.Usd24hVol
                    };
                    _cache.Set(cacheKey, cryptoDto, CacheDuration);
                    
                    return cryptoDto;
                }
            }
            throw new KeyNotFoundException($"La crypto-monnaie '{cryptoID}' n'a pas été trouvée.");
        }
        catch(Exception e)
        {
            Console.WriteLine($"[CryptoPriceService] Erreur lors de la récupération du prix pour {cryptoID} : {e.Message}");
            throw;
        }
    }


    
}




/*
    Point important
    pour gérer le problème de token, on a mis en place un système de cache : lors d'un appel des fonctions GetPriceAsync, GetAsync on verifie que les informations on moins de 30s
    Si ce n'est pas le cas(le cache est vide sur cet élément), on fait un appel a coingecko pour les avoir, ces valeurs seront donc partagé entre tous les utilisateurs qui demanderont les informations, 
    ce qui permet d'économiser les tokens et de dépasser les 20 tokens minutes
*/