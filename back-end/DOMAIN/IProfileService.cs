using BackEnd_CryptoSim.MODEL;
using BackEnd_CryptoSim.MODEL.APP.DTOs;

namespace BackEnd_CryptoSim.LOGIC.Services.Interfaces
{
    public interface IProfileService
    {
        Task<ProfileResponseDto> GetProfileAsync(AppUser user);
        Task<(bool Success, string Message, ProfileResponseDto? Profile)> UpdateProfileAsync(AppUser user, UpdateProfileDto request);
        Task<(bool Success, string Message)> ChangePasswordAsync(AppUser user, ChangePasswordDto request);
    }
}
