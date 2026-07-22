using BackEnd_CryptoSim.LOGIC.Services.Interfaces;
using BackEnd_CryptoSim.MODEL;
using BackEnd_CryptoSim.MODEL.APP.DTOs;
using Microsoft.AspNetCore.Identity;

namespace BackEnd_CryptoSim.LOGIC.Services
{
    public class ProfileService : IProfileService
    {
        private readonly UserManager<AppUser> _userManager;

        public ProfileService(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<ProfileResponseDto> GetProfileAsync(AppUser user)
        {
            return MapToDto(user);
        }

        public async Task<(bool Success, string Message, ProfileResponseDto? Profile)> UpdateProfileAsync(AppUser user, UpdateProfileDto request)
        {
            try
            {
                user.Name = request.Name;
                user.Surname = request.Surname;

                if (!string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase))
                {
                    var emailResult = await _userManager.SetEmailAsync(user, request.Email);
                    if (!emailResult.Succeeded)
                    {
                        return (false, string.Join(" ", emailResult.Errors.Select(e => e.Description)), null);
                    }

                    var userNameResult = await _userManager.SetUserNameAsync(user, request.Email);
                    if (!userNameResult.Succeeded)
                    {
                        return (false, string.Join(" ", userNameResult.Errors.Select(e => e.Description)), null);
                    }
                }

                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    return (false, string.Join(" ", updateResult.Errors.Select(e => e.Description)), null);
                }

                return (true, "Profil mis à jour avec succès.", MapToDto(user));
            }
            catch (Exception Ex)
            {
                Console.WriteLine($"[ERROR] Erreur Profile : {Ex.Message}");
                throw;
            }
        }

        public async Task<(bool Success, string Message)> ChangePasswordAsync(AppUser user, ChangePasswordDto request)
        {
            try
            {
                var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
                if (!result.Succeeded)
                {
                    return (false, string.Join(" ", result.Errors.Select(e => e.Description)));
                }

                return (true, "Mot de passe modifié avec succès.");
            }
            catch (Exception Ex)
            {
                Console.WriteLine($"[ERROR] Erreur Profile : {Ex.Message}");
                throw;
            }
        }

        private static ProfileResponseDto MapToDto(AppUser user)
        {
            return new ProfileResponseDto
            {
                Name = user.Name,
                Surname = user.Surname,
                Email = user.Email ?? string.Empty,
                CashBalance = user.CashBalance,
                CreatedAt = user.CreatedAt
            };
        }
    }
}
