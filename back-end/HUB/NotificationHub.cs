using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace BackEnd_CryptoSim.HUBS
{
    [Authorize] 
    public class NotificationHub : Hub
    {
        // Pour l'instant, on laisse la classe vide. 
        // C'est le serveur qui va pousser des messages vers le client (React), 
        // le client n'a pas besoin d'appeler de fonctions spécifiques ici.
    }
}