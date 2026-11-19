// ============================================================================
// C# ASP.NET Core MVC Backend Reference Architecture
// Implementa Entity Framework Core con Pomelo.EntityFrameworkCore.MySql
// ============================================================================

export const CSHARP_MVC_ARCHITECTURE = {
  projectFile: `<!-- CentralizadorDescuentos.csproj -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Pomelo.EntityFrameworkCore.MySql" Version="8.0.2" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.8" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.8" />
  </ItemGroup>
</Project>`,

  dbContext: `// Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using CentralizadorDescuentos.Models;

namespace CentralizadorDescuentos.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Brand> Brands => Set<Brand>();
        public DbSet<Promotion> Promotions => Set<Promotion>();
        public DbSet<PromotionMetric> PromotionMetrics => Set<PromotionMetric>();
        public DbSet<UserVaultToken> UserVaultTokens => Set<UserVaultToken>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Deduplication Key Constraint
            modelBuilder.Entity<Promotion>()
                .HasIndex(p => new { p.BrandId, p.DeduplicationKey })
                .IsUnique();

            modelBuilder.Entity<Promotion>()
                .HasIndex(p => new { p.Status, p.ExpirationDate });
        }
    }
}`,

  models: `// Models/Promotion.cs
namespace CentralizadorDescuentos.Models
{
    public class Promotion
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int BrandId { get; set; }
        public Brand Brand { get; set; } = null!;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public decimal? OriginalPrice { get; set; }
        public decimal PromotionalPrice { get; set; }
        public int? DiscountPercentage { get; set; }
        public string? CouponCode { get; set; }
        public DateTime ExpirationDate { get; set; }
        public string DeduplicationKey { get; set; } = string.Empty;
        public string SourceUrl { get; set; } = string.Empty;
        public string DeepLinkApp { get; set; } = string.Empty;
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, EXPIRED_BY_DATE, HIDDEN_BY_REPORTS
        public PromotionMetric Metrics { get; set; } = null!;
    }

    public class UserVaultToken
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string BrandName { get; set; } = string.Empty;
        public string EncryptedAuthToken { get; set; } = string.Empty; // AES-256 GCM
        public string TokenIv { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}`
};
