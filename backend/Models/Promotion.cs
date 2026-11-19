using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralizadorDescuentos.Models
{
    /// <summary>
    /// Entidad principal que almacena cupones y promociones extraídas.
    /// Contiene clave única de deduplicación e índices para búsqueda rápida.
    /// </summary>
    [Table("promotions")]
    public class Promotion
    {
        [Key]
        [MaxLength(64)]
        public string Id { get; set; } = Guid.NewGuid().ToString("N");

        [Required]
        public int BrandId { get; set; }

        [ForeignKey(nameof(BrandId))]
        public Brand Brand { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "TEXT")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = "Burgers";

        [Required]
        [MaxLength(50)]
        public string BenefitType { get; set; } = "FINAL_PRICE";

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [Column(TypeName = "DECIMAL(10,2)")]
        public decimal? OriginalPrice { get; set; }

        [Required]
        [Column(TypeName = "DECIMAL(10,2)")]
        public decimal PromotionalPrice { get; set; }

        public int? DiscountPercentage { get; set; }

        [MaxLength(60)]
        public string? CouponCode { get; set; }

        [Required]
        public DateOnly ExpirationDate { get; set; }

        // Restricciones de canje y letra chica
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "Any Method";

        [MaxLength(100)]
        public string Schedule { get; set; } = "Todo el día";

        public bool RequiresApp { get; set; } = true;

        public bool RequiresLogin { get; set; } = false;

        [Column(TypeName = "TEXT")]
        public string FinePrint { get; set; } = string.Empty;

        [MaxLength(500)]
        public string SourceUrl { get; set; } = string.Empty;

        [MaxLength(500)]
        public string DeepLinkApp { get; set; } = string.Empty;

        /// <summary>
        /// Clave de deduplicación calculada para evitar ofertas duplicadas en ingesta.
        /// Índice único compuesto junto con BrandId.
        /// </summary>
        [Required]
        [MaxLength(160)]
        public string DeduplicationKey { get; set; } = string.Empty;

        public DateTime LastVerifiedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Estados: ACTIVE, EXPIRED_BY_DATE, HIDDEN_BY_REPORTS
        /// </summary>
        [Required]
        [MaxLength(40)]
        public string Status { get; set; } = "ACTIVE";

        public PromotionMetric Metrics { get; set; } = null!;

        public ICollection<PromotionReport> Reports { get; set; } = new List<PromotionReport>();
    }
}
