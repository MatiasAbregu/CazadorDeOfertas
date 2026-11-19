using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentralizadorDescuentos.Data;
using CentralizadorDescuentos.Models;
using CentralizadorDescuentos.Services;

namespace CentralizadorDescuentos.Controllers
{
    /// <summary>
    /// Controlador MVC para la Bóveda Segura de Credenciales y Tokens.
    /// Resuelve el almacenamiento cifrado exigido para cupones que requieren autenticación.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class UserVaultController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ITokenEncryptionService _encryptionService;
        private readonly ILogger<UserVaultController> _logger;

        public UserVaultController(
            ApplicationDbContext context, 
            ITokenEncryptionService encryptionService,
            ILogger<UserVaultController> logger)
        {
            _context = context;
            _encryptionService = encryptionService;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene el estado de cuentas vinculadas con tokens enmascarados (nunca expone el token plano).
        /// </summary>
        [HttpGet("credentials")]
        public async Task<IActionResult> GetCredentials()
        {
            var tokens = await _context.UserVaultTokens
                .Select(t => new
                {
                    t.Id,
                    t.BrandName,
                    t.EmailOrUsername,
                    t.TokenMasked,
                    ConnectedAt = t.ConnectedAt.ToString("yyyy-MM-dd"),
                    ExpiresInDays = (int)(t.ExpiresAt - DateTime.UtcNow).TotalDays
                })
                .ToListAsync();

            return Ok(new { Items = tokens });
        }

        /// <summary>
        /// Cifra mediante AES-256-GCM y almacena o actualiza el token de sesión de la marca.
        /// </summary>
        [HttpPost("credentials")]
        public async Task<IActionResult> SaveCredential([FromBody] SaveCredentialDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Brand) || 
                string.IsNullOrWhiteSpace(dto.EmailOrUsername) || 
                string.IsNullOrWhiteSpace(dto.Token))
            {
                return BadRequest(new { error = "Brand, emailOrUsername and token are required" });
            }

            var (encryptedHex, ivHex, tagHex) = _encryptionService.EncryptToken(dto.Token);
            var masked = _encryptionService.MaskToken(dto.Token);

            var existing = await _context.UserVaultTokens
                .FirstOrDefaultAsync(t => t.BrandName.ToLower() == dto.Brand.ToLower());

            if (existing != null)
            {
                existing.EmailOrUsername = dto.EmailOrUsername;
                existing.TokenMasked = masked;
                existing.EncryptedTokenHex = encryptedHex;
                existing.IvHex = ivHex;
                existing.AuthTagHex = tagHex;
                existing.ConnectedAt = DateTime.UtcNow;
                existing.ExpiresAt = DateTime.UtcNow.AddDays(30);
            }
            else
            {
                var newRecord = new UserVaultToken
                {
                    BrandName = dto.Brand,
                    EmailOrUsername = dto.EmailOrUsername,
                    TokenMasked = masked,
                    EncryptedTokenHex = encryptedHex,
                    IvHex = ivHex,
                    AuthTagHex = tagHex,
                    ConnectedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddDays(30)
                };
                _context.UserVaultTokens.Add(newRecord);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Token cifrado con AES-256 guardado exitosamente para {Brand}", dto.Brand);

            return Ok(new
            {
                Success = true,
                Message = $"Token cifrado exitosamente para {dto.Brand}",
                Brand = dto.Brand,
                TokenMasked = masked
            });
        }

        /// <summary>
        /// Elimina la credencial y revoca el token cifrado de la bóveda.
        /// </summary>
        [HttpDelete("credentials/{brand}")]
        public async Task<IActionResult> DeleteCredential(string brand)
        {
            var token = await _context.UserVaultTokens
                .FirstOrDefaultAsync(t => t.BrandName.ToLower() == brand.ToLower());

            if (token != null)
            {
                _context.UserVaultTokens.Remove(token);
                await _context.SaveChangesAsync();
            }

            return Ok(new { Success = true, Message = $"Credencial eliminada para {brand}" });
        }
    }

    public record SaveCredentialDto(string Brand, string EmailOrUsername, string Token);
}
