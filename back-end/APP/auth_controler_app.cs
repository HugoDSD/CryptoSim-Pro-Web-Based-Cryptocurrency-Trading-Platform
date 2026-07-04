using Microsoft.AspNetCore.Mvc;
using BackEnd_CryptoSim.LOGIC.Interfaces;
using BackEnd_CryptoSim.MODEL.APP.DTOs;


namespace BackEnd_CryptoSim.MODEL.APP.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    //_authService est une instance de la classe AuthService (la classe concrète qui implémente notre interface IAuthService) que nous allons utiliser pour gérer la logique métier de l'authentification. 
    // C'est grâce à l'injection de dépendances que nous pouvons obtenir une instance de AuthService sans avoir à la créer manuellement dans notre contrôleur.
    private readonly IAuthService _authService;

    // On injecte NOTRE service de la couche LOGIC
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        var result = await _authService.RegisterUserAsync(
            request.Email, 
            request.Password, 
            request.Name, 
            request.Surname
            );

        if (result.Success)
        {
            return Ok(new { message = "Utilisateur créé" });
        }

        return BadRequest(result.Errors);
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        var (success, token, errors) = await _authService.LoginUser(request.Email, request.Password);
        if (success)
        {
            return Ok(new{message = "connexion établie", token =token});
        }
        return Unauthorized(errors);
    }
}



/*
ControllerBase permet : 
    - La gestion des réponses HTTP : C'est elle qui te fournit les méthodes comme 
        Ok() (statut 200), 
        BadRequest() (statut 400), 
        Unauthorized() (statut 401) 
        ou NotFound() (statut 404).

    - L'accès au contexte de la requête : C'est grâce à ControllerBase que tu peux taper User pour aller lire le Token JWT,
        ou accéder à Request et Response pour manipuler les en-têtes HTTP.
*/