using Microsoft.EntityFrameworkCore;
using CentralizadorDescuentos.Models;

namespace CentralizadorDescuentos.Data
{
    /// <summary>
    /// Contexto de Entity Framework Core para MySQL.
    /// Define esquemas, relaciones e índices de deduplicación.
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Brand> Brands => Set<Brand>();
        public DbSet<Promotion> Promotions => Set<Promotion>();
        public DbSet<PromotionMetric> PromotionMetrics => Set<PromotionMetric>();
        public DbSet<PromotionReport> PromotionReports => Set<PromotionReport>();
        public DbSet<UserVaultToken> UserVaultTokens => Set<UserVaultToken>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Índice único de deduplicación: evita insertar duplicados de la misma marca
            modelBuilder.Entity<Promotion>()
                .HasIndex(p => new { p.BrandId, p.DeduplicationKey })
                .IsUnique()
                .HasDatabaseName("idx_promotions_brand_dedup");

            // 2. Índice compuesto para consultas de vigencia y estado
            modelBuilder.Entity<Promotion>()
                .HasIndex(p => new { p.Status, p.ExpirationDate })
                .HasDatabaseName("idx_promotions_status_expiration");

            // 3. Relación 1:1 entre Promotion y PromotionMetric
            modelBuilder.Entity<Promotion>()
                .HasOne(p => p.Metrics)
                .WithOne(m => m.Promotion)
                .HasForeignKey<PromotionMetric>(m => m.PromotionId)
                .OnDelete(DeleteBehavior.Cascade);

            // 4. Relación 1:N entre Promotion y PromotionReport
            modelBuilder.Entity<PromotionReport>()
                .HasOne(r => r.Promotion)
                .WithMany(p => p.Reports)
                .HasForeignKey(r => r.PromotionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Semilla inicial de marcas
            modelBuilder.Entity<Brand>().HasData(
                new Brand
                {
                    Id = 1,
                    Name = "McDonald's",
                    AccentColor = "#DA291C",
                    AndroidPackageName = "com.mcdo.mcdonalds",
                    OfficialWebsiteUrl = "https://www.mcdonalds.com.ar",
                    PlayStoreUrl = "https://play.google.com/store/apps/details?id=com.mcdo.mcdonalds",
                    AppStoreUrl = "https://apps.apple.com/ar/app/mcdonalds-app-ofertas-y-mop/id1114009171"
                },
                new Brand
                {
                    Id = 2,
                    Name = "Burger King",
                    AccentColor = "#502314",
                    AndroidPackageName = "ar.burgerking",
                    OfficialWebsiteUrl = "https://www.burgerking.com.ar",
                    PlayStoreUrl = "https://play.google.com/store/apps/details?id=ar.burgerking",
                    AppStoreUrl = "https://apps.apple.com/ar/app/burger-king-argentina/id1256346337"
                },
                new Brand
                {
                    Id = 3,
                    Name = "Mostaza",
                    AccentColor = "#C41230",
                    AndroidPackageName = "com.candoit.mostaza",
                    OfficialWebsiteUrl = "https://www.mostazaweb.com.ar",
                    PlayStoreUrl = "https://play.google.com/store/apps/details?id=com.candoit.mostaza",
                    AppStoreUrl = "https://apps.apple.com/ar/app/mostaza/id1458999434"
                }
            );
        }
    }
}
