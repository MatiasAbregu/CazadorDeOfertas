using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralizadorDescuentos.Models
{
    /// <summary>
    /// Registro de reportes de anomalías de cupones enviados por la comunidad.
    /// Si una promoción acumula 3 reportes, es dada de baja pasivamente.
    /// </summary>
    [Table("promotion_reports")]
    public class PromotionReport
    {
        [Key]
        [MaxLength(64)]
        public string Id { get; set; } = Guid.NewGuid().ToString("N");

        [Required]
        public string PromotionId { get; set; } = string.Empty;

        [ForeignKey(nameof(PromotionId))]
        public Promotion Promotion { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string Reason { get; set; } = "EXPIRED"; // EXPIRED, WRONG_DATA, REJECTED_AT_STORE, BROKEN_LINK

        [MaxLength(500)]
        public string Details { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
