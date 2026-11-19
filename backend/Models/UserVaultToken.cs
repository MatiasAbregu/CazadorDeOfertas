using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralizadorDescuentos.Models
{
    /// <summary>
    /// Bóveda segura de credenciales y tokens cifrados de apps de comida rápida (McDonald's, Burger King, Mostaza).
    /// Los tokens se almacenan con cifrado simétrico AES-256-GCM y nunca se exponen en texto plano.
    /// </summary>
    [Table("user_vault_tokens")]
    public class UserVaultToken
    {
        [Key]
        [MaxLength(64)]
        public string Id { get; set; } = Guid.NewGuid().ToString("N");

        [Required]
        [MaxLength(80)]
        public string BrandName { get; set; } = string.Empty;

        [Required]
        [MaxLength(120)]
        public string EmailOrUsername { get; set; } = string.Empty;

        [Required]
        [MaxLength(40)]
        public string TokenMasked { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "TEXT")]
        public string EncryptedTokenHex { get; set; } = string.Empty;

        [Required]
        [MaxLength(64)]
        public string IvHex { get; set; } = string.Empty;

        [Required]
        [MaxLength(64)]
        public string AuthTagHex { get; set; } = string.Empty;

        public DateTime ConnectedAt { get; set; } = DateTime.UtcNow;

        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddDays(30);
    }
}
