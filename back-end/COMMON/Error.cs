namespace BackEnd_CryptoSim.COMMON;

public enum ErrorCode
{
    // Erreurs Client (400+)
    VALIDATION_FAILED,   
    NOT_FOUND,         
    ALREADY_EXISTS,      
    
    // Erreurs Sécurité (401/403)
    UNAUTHORIZED,
    FORBIDDEN,      
    
    // Erreurs Serveur (500)
    DATABASE_UNAVAILABLE, 
    INTERNAL_ERROR,      // Erreur UNIQUEMENT dans le back-end de l'application
    
    // Erreur de base de données
    DATABASE_ERROR,     // Erreur UNIQUEMENT dans la base de données

    // Erreurs Temps/Poids
    TIMEOUT,
    TOO_MANY_REQUESTS,
    PAYLOAD_TOO_LARGE
}