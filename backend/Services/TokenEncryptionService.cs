using System.Security.Cryptography;
using System.Text;

namespace CentralizadorDescuentos.Services
{
    /// <summary>
    /// Servicio de cifrado simétrico AES-256-GCM para proteger credenciales y tokens
    /// de apps oficiales que requieren inicio de sesión del usuario.
    /// </summary>
    public interface ITokenEncryptionService
    {
        (string EncryptedHex, string IvHex, string TagHex) EncryptToken(string plainToken);
        string DecryptToken(string encryptedHex, string ivHex, string tagHex);
        string MaskToken(string plainToken);
    }

    public class TokenEncryptionService : ITokenEncryptionService
    {
        private readonly byte[] _key;

        public TokenEncryptionService(IConfiguration configuration)
        {
            var configuredKey = configuration["VaultSecurity:MasterKey"] 
                ?? "SecretKeyVault2026MasterAES256GCMFastFood!";
            using var sha256 = SHA256.Create();
            _key = sha256.ComputeHash(Encoding.UTF8.GetBytes(configuredKey));
        }

        public (string EncryptedHex, string IvHex, string TagHex) EncryptToken(string plainToken)
        {
            var plainBytes = Encoding.UTF8.GetBytes(plainToken);
            var iv = new byte[12]; // 96 bits estándar para GCM
            var tag = new byte[16]; // 128 bits auth tag
            var cipherText = new byte[plainBytes.Length];

            RandomNumberGenerator.Fill(iv);

            using var aes = new AesGcm(_key, 16);
            aes.Encrypt(iv, plainBytes, cipherText, tag);

            return (
                Convert.ToHexString(cipherText).ToLowerInvariant(),
                Convert.ToHexString(iv).ToLowerInvariant(),
                Convert.ToHexString(tag).ToLowerInvariant()
            );
        }

        public string DecryptToken(string encryptedHex, string ivHex, string tagHex)
        {
            var cipherBytes = Convert.FromHexString(encryptedHex);
            var iv = Convert.FromHexString(ivHex);
            var tag = Convert.FromHexString(tagHex);
            var plainBytes = new byte[cipherBytes.Length];

            using var aes = new AesGcm(_key, 16);
            aes.Decrypt(iv, cipherBytes, tag, plainBytes);

            return Encoding.UTF8.GetString(plainBytes);
        }

        public string MaskToken(string plainToken)
        {
            if (string.IsNullOrWhiteSpace(plainToken)) return "••••••••";
            if (plainToken.Length <= 8) return "••••••••";
            return $"{plainToken[..4]}••••••••{plainToken[^4..]}";
        }
    }
}
