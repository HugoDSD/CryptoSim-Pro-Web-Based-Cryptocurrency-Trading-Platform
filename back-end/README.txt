# CryptoSim Backend
Note: le fichier de démarage "appsettings.json" n'est pas disponible sur le git, il faut le reclamer ! 


## pour télécharger les extentions :
    - Mettez-vous à la racine du projet
    - Tapez : dotnet restore

## Package installé
    dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL                ("traducteur" entre Entity Framework Core (EF Core) et ta base de données PostgreSQL)
    dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore    (le pont entre le système de sécurité de Microsoft (Identity) et ta base de données (EF Core))
    dotnet add package Microsoft.EntityFrameworkCore.Design                 (C'est le moteur d'analyse de ton code pour créer les migrations) Microsoft.EntityFrameworkCore.Tools                                     (fournit l'interface en ligne de commande pour gérer ta base de données.)
    dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer        (permet de générer les tokens )

## Outils utilisés:
 - Postgre 17.10
 - Postman



##Commande pour créer la Base de donnée + Update ses tables

- créer la base de donnée
 psql -U postgres (acceder à POSTGRE)
 CREATE DATABASE "CryptoSimDb"; (crr la BD)
 \q (quite la console postgre)

 - créer les tables / les mettres à jour
 dotnet ef migrations add InitialIdentitySetup (changer le nom)
 dotnet ef database update


 ## Lancer l'application
    dotnet watch run