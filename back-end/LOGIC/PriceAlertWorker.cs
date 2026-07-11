using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using BackEnd_CryptoSim.HUBS;
using BackEnd_CryptoSim.PERSIST;
using BackEnd_CryptoSim.MODEL;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using BackEnd_CryptoSim.LOGIC.Interfaces; 

namespace BackEnd_CryptoSim.LOGIC.Services
{
    public class PriceAlertWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly TimeSpan _checkInterval = TimeSpan.FromSeconds(30); // Fréquence de vérification de la boucle

        public PriceAlertWorker(IServiceProvider serviceProvider, IHubContext<NotificationHub> hubContext)
        {
            _serviceProvider = serviceProvider;
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Console.WriteLine("[INFO] Le Worker des alertes de prix a démarré.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Création du scope pour obtenir nos services Scoped en tâche de fond
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetRequiredService<AppDb>();
                        var cryptoPriceService = scope.ServiceProvider.GetRequiredService<ICryptoPriceService>();

                        // 1. Récupération de toutes les alertes actuellement actives en BDD
                        var activeAlerts = await context.PriceAlerts
                            .Where(pa => pa.IsActive)
                            .ToListAsync(stoppingToken);

                        if (activeAlerts.Any())
                        {
                            Console.WriteLine($"[WORKER] Analyse de {activeAlerts.Count} alerte(s) active(s)...");

                            // Récupération des prix actuels du marché global
                            // Pour optimiser les appels réseau, on récupère le marché complet d'un coup
                            var marketPrices = await cryptoPriceService.GetMarketPriceAsync();

                            if (marketPrices != null && marketPrices.Any())
                            {
                                // On transforme la liste en dictionnaire (Key: CryptoId, Value: CurrentPrice) pour une recherche ultra rapide en O(1)
                                var priceDictionary = marketPrices.ToDictionary(
                                    crypto => crypto.Id.ToLower(), 
                                    crypto => crypto.CurrentPrice
                                );

                                bool hasChanges = false;

                                // On passe au crible chaque alerte
                                foreach (var alert in activeAlerts)
                                {
                                    // Uniformisation pour correspondre à notre dictionnaire
                                    var cleanCryptoId = alert.CryptoId.ToLower();

                                    // Si le prix de la crypto n'est pas dans le retour de l'API, on passe
                                    if (!priceDictionary.TryGetValue(cleanCryptoId, out decimal currentPrice))
                                        continue;

                                    bool isTriggered = false;

                                    // Comparaison mathématique selon la direction
                                    if (alert.Direction == "ABOVE" && currentPrice >= alert.TargetPrice)
                                    {
                                        isTriggered = true;
                                    }
                                    else if (alert.Direction == "BELOW" && currentPrice <= alert.TargetPrice)
                                    {
                                        isTriggered = true;
                                    }

                                    // Déclenchement de l'alerte !
                                    if (isTriggered)
                                    {
                                        Console.WriteLine($"[TRIGGER] Alerte franchie pour l'user {alert.UserId} sur {alert.CryptoId} ({currentPrice} USD)");

                                        // Désactivation immédiate de l'alerte pour ne pas notifier en boucle au prochain tour
                                        alert.IsActive = false;
                                        hasChanges = true;

                                        // Envoi de la notification temps réel via le Hub SignalR directement au navigateur de l'utilisateur
                                        await _hubContext.Clients.User(alert.UserId).SendAsync(
                                            "ReceiveNotification", 
                                            new 
                                            { 
                                                message = $"Votre alerte sur {alert.CryptoId.ToUpper()} a été déclenchée ! Le prix spot a atteint {currentPrice} USD (Seuil paramétré : {alert.TargetPrice} USD).",
                                                cryptoId = alert.CryptoId,
                                                direction = alert.Direction,
                                                triggeredAt = DateTime.UtcNow
                                            }, 
                                            stoppingToken
                                        );
                                    }
                                }

                                // On ne sauvegarde en BDD que si au moins une alerte a été désactivée
                                if (hasChanges)
                                {
                                    await context.SaveChangesAsync(stoppingToken);
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR WORKER] Erreur dans la boucle de surveillance : {ex.Message}");
                }

                // Attente de 30 secondes avant la prochaine analyse
                await Task.Delay(_checkInterval, stoppingToken);
            }

            Console.WriteLine("[INFO] Le Worker des alertes de prix s'est arrêté.");
        }
    }
}