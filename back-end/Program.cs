using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using BackEnd_CryptoSim.MODEL;
using BackEnd_CryptoSim.PERSIST;
using BackEnd_CryptoSim.COMMON;
using BackEnd_CryptoSim.LOGIC.Services;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using BackEnd_CryptoSim.LOGIC.Services.Interfaces;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. CONFIGURATION DES SERVICES (Le conteneur de dépendances)
// ==========================================

// Ajout des contrôleurs d'API
builder.Services.AddControllers();

// Configuration de la base de données PostgreSQL
builder.Services.AddDbContext<AppDb>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configuration de la sécurité (Identity)
builder.Services.AddAuthorization();
builder.Services.AddIdentity<AppUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDb>()
    .AddDefaultTokenProviders();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Remplace par l'URL exacte de ton front-end Vue.js
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174") 
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddHttpClient<ICryptoPriceService, CryptoPriceService>(); // Configuration du client HTTP pour le service CryptoPrice
builder.Services.AddMemoryCache();
builder.Services.Configure<TradingRulesSettings>(builder.Configuration.GetSection("TradingRules")); //permet de recuperer les paramètres de trading qu'une seule fois et de les stocker pour toutes les instances
builder.Services.AddScoped<IMiddleOffice, MiddleOffice>();
builder.Services.AddScoped<IBackOffice, BackOffice>();

// ...



// --- CONFIGURATION DE L'AUTHENTIFICATION JWT ---
var jwtSecret = builder.Configuration["JwtSettings:Secret"] 
    ?? throw new InvalidOperationException("Clé secrète JWT manquante.");

builder.Services.AddAuthentication(options =>
{
    // On dit à l'API que par défaut, on va chercher un Token "Bearer" dans les requêtes
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = false,   // On désactive pour le développement local
        ValidateAudience = false, // On désactive pour le développement local
        ClockSkew = TimeSpan.Zero // Supprime le délai de tolérance de 5 min sur l'expiration
    };
});




// ==========================================
// 2. CONSTRUCTION DE L'APPLICATION
// ==========================================
builder.Services.AddScoped<IAuthService, AuthService>(); // On dit à ASP.NET Core que chaque fois qu'on demande un IAuthService, il doit nous donner une instance de AuthService (qui est la classe concrète qui implémente notre interface IAuthService)
var app = builder.Build();

// ==========================================
// 3. CONFIGURATION DU PIPELINE HTTP (Les Middlewares)
// ==========================================


// app.UseMiddleware<ExceptionHandlingMiddleware>();  // Décommente cette ligne une fois qu'on auras ajouté la classe ExceptionHandlingMiddleware à ton projet

// Activation de la sécurité dans le pipeline
app.UseCors("AllowFrontend");
app.UseAuthentication(); // il permet de verifier qui notamment avec le token
app.UseAuthorization();  // est ce qu'il en a le droit

// ==========================================
// 4. CONFIGURATION DES ROUTES (Endpoints)
// ==========================================


/*
    En lisant cette ligne, notre API va, dans les coulisses, générer et exposer automatiquement tout un groupe de routes pré-codées pour gérer la sécurité.
    Ainsi on a déjà des routes prêtes à l'emploi pour :
    - S'inscrire (/register)
    - Se connecter (/login)
    - Se déconnecter (/logout)
    - Gérer les rôles (ajouter, supprimer, etc.)
    - Gérer les utilisateurs (voir la liste, supprimer, etc.)
    - Gérer les sessions (voir les sessions actives, les terminer, etc.)
    - Gérer les tokens (générer, révoquer, etc.)
    - Gérer les mots de passe (changer, réinitialiser, etc.)
*/



// Expose les futures routes de tes propres contrôleurs
app.MapControllers();

// Lancement du serveur
app.Run();