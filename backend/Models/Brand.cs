using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CentralizadorDescuentos.Models
{
    /// <summary>
    /// Modelo de entidad que representa una marca de comida rápida (McDonald's, Burger King, Mostaza).
    /// </summary>
    [Table("brands")]
    public class Brand
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(80)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string AccentColor { get; set; } = "#000000";

        [MaxLength(120)]
        public string AndroidPackageName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string OfficialWebsiteUrl { get; set; } = string.Empty;

        [MaxLength(255)]
        public string PlayStoreUrl { get; set; } = string.Empty;

        [MaxLength(255)]
        public string AppStoreUrl { get; set; } = string.Empty;

        public ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();
    }
}
