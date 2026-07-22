using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using BackEnd_CryptoSim.MODEL;

namespace BackEnd_CryptoSim.PERSIST;

// On hérite de IdentityDbContext<AppUser> pour inclure le système d'authentification
public class AppDb : IdentityDbContext<AppUser>
{
    public AppDb(DbContextOptions<AppDb> options) : base(options)
    {
    }

    //On declare les tables de nos MODELS
    public DbSet<Portfolio>Portfolios{get;set;}
    public DbSet<Transaction>Transactions{get;set;}
    public DbSet<Watchlist> Watchlists{get;set;}
    public DbSet<PriceAlert> PriceAlerts{get;set;}


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Si on supprime un utilisateur, on supprime aussi son historique (Cascade) et toutes ses cases (NE PAS OUBLIER DE L'IMPLEMENTER POUR CHAQUE NOUVELLE TABLE)
       // modelBuilder.Entity<EvaluationHistory>()
       //     .HasOne(h => h.User)
       //     .WithMany(u => u.Histories)
       //     .HasForeignKey(h => h.UserId)
        //    .OnDelete(DeleteBehavior.Cascade);



        // Configuration stricte de la précision mathématique pour éviter les pertes
            modelBuilder.Entity<AppUser>().Property(u => u.CashBalance).HasColumnType("decimal(18,8)");
            
            modelBuilder.Entity<Portfolio>().Property(p => p.Quantity).HasColumnType("decimal(18,8)");
            modelBuilder.Entity<Portfolio>().Property(p => p.AvgBuyPrice).HasColumnType("decimal(18,8)");

            modelBuilder.Entity<Transaction>().Property(t => t.Quantity).HasColumnType("decimal(18,8)");
            modelBuilder.Entity<Transaction>().Property(t => t.Price).HasColumnType("decimal(18,8)");
            modelBuilder.Entity<Transaction>().Property(t => t.Fee).HasColumnType("decimal(18,8)");

            modelBuilder.Entity<PriceAlert>().Property(pa => pa.TargetPrice).HasColumnType("decimal(18,8)");
            modelBuilder.Entity<Watchlist>().HasIndex(w => new { w.UserId, w.CryptoId }).IsUnique(); // Permet d'éviter d'ajouter plusieurs fois la meme crypto à la watchlist
    }
}



/*
                        -- Choix de technologie --
On choisit d'utiliser IdentityDbContext<AppUser> pour bénéficier de toutes les fonctionnalités d'ASP.NET Core Identity (gestion des utilisateurs, rôles, etc.) 
tout en ajoutant notre propre table EvaluationHistory pour stocker l'historique des évaluations environnementales de chaque utilisateur.
DbContext est la classe standard d'Entity Framework Core. C'est une page blanche : elle ne contient aucune table par défaut. 

En héritant de IdentityDbContext<AppUser>, on ajoute automatiquement toutes les tables nécessaires pour gérer les utilisateurs (AspNetUsers, AspNetRoles, etc.)
donc  mots de passe, les jetons de connexion, les rôles (administrateur, utilisateur), etc.

                        -- Rôle de ce fichier --

C'est la passerelle unique entre ton monde en C# (orienté objet) et ton monde SQL (PostgreSQL, orienté relationnel).
    - La cartographie (Mapping) : C'est lui qui dit à Entity Framework quelles classes C# doivent devenir des tables SQL. 
Grâce à la ligne public DbSet<EvaluationHistory> EvaluationHistories { get; set; }
    - Le traducteur SQL
    - Le suivi des modifications (Change Tracker) : Dès que tu récupères, modifies, ajoutes ou supprimes un objet en C#, le AppDbContext garde cela en mémoire. 
Rien n'est envoyé à la base de données tant que tu n'appelles pas explicitement la méthode SaveChanges()
    - La définition des règles métier (OnModelCreating) : C'est à cet endroit que tu définis les relations complexes. 
Dans ton code, tu as configuré un comportement de suppression en cascade (DeleteBehavior.Cascade)
*/