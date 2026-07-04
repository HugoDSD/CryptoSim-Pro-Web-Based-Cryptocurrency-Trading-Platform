using Microsoft.AspNetCore.Identity;


namespace BackEnd_CryptoSim.MODEL
{
    public class AppUser: IdentityUser
    {
        public string Name {get;set;} = string.Empty;
        public string Surname {get; set;} = string.Empty;
    }
}