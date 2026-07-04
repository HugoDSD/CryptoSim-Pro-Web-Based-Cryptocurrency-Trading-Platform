using System.ComponentModel.DataAnnotations;

using System.ComponentModel.DataAnnotations.Schema;
using BackEnd_CryptoSim.MODEL;
namespace BackEnd_CryptoSim.MODEL.APP.DTOs;

public class RegisterDto
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(8)]
    public required string Password { get; set; }

    public required string Name { get; set; }
    public required string Surname { get; set; }
    
}


public class LoginDto
{
    [Required]
    [EmailAddress]
    public required string Email {get;set;}

    public required string Password {get;set;}

}
