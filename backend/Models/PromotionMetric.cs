using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralizadorDescuentos.Models
{
    /// <summary>
    /// Métricas comunitarias de éxito, reportes y semáforo de confiabilidad.
    /// </summary>
    [Table("promotion_metrics")]
    public class PromotionMetric
    {
        [Key]
        public string PromotionId { get; set; } = string.Empty;

        [ForeignKey(nameof(PromotionId))]
        public Promotion Promotion { get; set; } = null!;

        public int WorkedCount { get; set; } = 0;

        public int DidNotWorkCount { get; set; } = 0;

        public int InterestCount { get; set; } = 0;

        public int OpenCount { get; set; } = 0;

        public int CriticalReportsCount { get; set; } = 0;

        /// <summary>
        /// Semáforo de confiabilidad: GREEN (>=80%), YELLOW (50-79%), RED (<50% o >=3 reportes)
        /// </summary>
        [Required]
        [MaxLength(20)]
        public string TrafficLight { get; set; } = "GREEN";

        public int SuccessRate { get; set; } = 100;
    }
}
