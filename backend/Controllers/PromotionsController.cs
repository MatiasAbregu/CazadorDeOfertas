using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CentralizadorDescuentos.Data;
using CentralizadorDescuentos.Models;

namespace CentralizadorDescuentos.Controllers
{
    /// <summary>
    /// Controlador MVC / API para listar, filtrar y registrar votos comunitarios de promociones.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PromotionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PromotionsController> _logger;

        public PromotionsController(ApplicationDbContext context, ILogger<PromotionsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene el catálogo de promociones activas con filtros opcionales.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetPromotions(
            [FromQuery] string? brand,
            [FromQuery] string? category,
            [FromQuery] string? search,
            [FromQuery] string? paymentMethod,
            [FromQuery] bool includeHidden = false)
        {
            var query = _context.Promotions
                .Include(p => p.Brand)
                .Include(p => p.Metrics)
                .AsNoTracking();

            if (!includeHidden)
            {
                query = query.Where(p => p.Status == "ACTIVE");
            }

            if (!string.IsNullOrWhiteSpace(brand) && brand != "ALL")
            {
                query = query.Where(p => p.Brand.Name.ToLower() == brand.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(category) && category != "ALL")
            {
                query = query.Where(p => p.Category.ToLower() == category.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(paymentMethod) && paymentMethod != "ALL")
            {
                query = query.Where(p => p.PaymentMethod == paymentMethod);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var q = search.Trim().ToLower();
                query = query.Where(p =>
                    p.Title.ToLower().Contains(q) ||
                    p.Description.ToLower().Contains(q) ||
                    (p.CouponCode != null && p.CouponCode.ToLower().Contains(q)));
            }

            var items = await query.ToListAsync();

            return Ok(new
            {
                Total = items.Count,
                Items = items.Select(p => new
                {
                    p.Id,
                    Brand = p.Brand.Name,
                    BrandColor = p.Brand.AccentColor,
                    p.Title,
                    p.Description,
                    p.Category,
                    p.BenefitType,
                    p.ImageUrl,
                    p.OriginalPrice,
                    p.PromotionalPrice,
                    p.DiscountPercentage,
                    p.CouponCode,
                    ExpirationDate = p.ExpirationDate.ToString("yyyy-MM-dd"),
                    Restrictions = new
                    {
                        p.PaymentMethod,
                        p.Schedule,
                        p.RequiresApp,
                        p.RequiresLogin,
                        p.FinePrint
                    },
                    p.SourceUrl,
                    p.DeepLinkApp,
                    p.DeduplicationKey,
                    p.LastVerifiedAt,
                    p.Status,
                    Metrics = new
                    {
                        p.Metrics.WorkedCount,
                        p.Metrics.DidNotWorkCount,
                        p.Metrics.InterestCount,
                        p.Metrics.OpenCount,
                        p.Metrics.CriticalReportsCount,
                        p.Metrics.TrafficLight,
                        p.Metrics.SuccessRate
                    }
                })
            });
        }

        /// <summary>
        /// Registra retroalimentación inmediata comunitaria ("WORKED", "DID_NOT_WORK", "INTEREST").
        /// Recalcula el semáforo y la tasa de éxito.
        /// </summary>
        [HttpPost("{id}/feedback")]
        public async Task<IActionResult> SubmitFeedback(string id, [FromBody] FeedbackRequest request)
        {
            var metric = await _context.PromotionMetrics
                .Include(m => m.Promotion)
                .FirstOrDefaultAsync(m => m.PromotionId == id);

            if (metric == null) return NotFound(new { error = "Promotion not found" });

            switch (request.Type.ToUpperInvariant())
            {
                case "WORKED":
                    metric.WorkedCount++;
                    break;
                case "DID_NOT_WORK":
                    metric.DidNotWorkCount++;
                    break;
                case "INTEREST":
                    metric.InterestCount++;
                    break;
                default:
                    return BadRequest(new { error = "Invalid feedback type" });
            }

            // Recalcular semáforo
            var total = metric.WorkedCount + metric.DidNotWorkCount;
            metric.SuccessRate = total == 0 ? 100 : (int)Math.Round((double)metric.WorkedCount / total * 100);

            if (metric.CriticalReportsCount >= 3 || metric.SuccessRate < 50)
            {
                metric.TrafficLight = "RED";
                if (metric.CriticalReportsCount >= 3)
                {
                    metric.Promotion.Status = "HIDDEN_BY_REPORTS";
                }
            }
            else if (metric.CriticalReportsCount >= 2 || metric.SuccessRate < 80)
            {
                metric.TrafficLight = "YELLOW";
            }
            else
            {
                metric.TrafficLight = "GREEN";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Id = id,
                Metrics = metric,
                Status = metric.Promotion.Status
            });
        }

        /// <summary>
        /// Reporta una oferta rota, vencida o rechazada en local.
        /// </summary>
        [HttpPost("{id}/report")]
        public async Task<IActionResult> SubmitReport(string id, [FromBody] ReportRequest request)
        {
            var promo = await _context.Promotions
                .Include(p => p.Metrics)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (promo == null) return NotFound(new { error = "Promotion not found" });

            var report = new PromotionReport
            {
                PromotionId = id,
                Reason = request.Reason ?? "EXPIRED",
                Details = request.Details ?? string.Empty
            };

            _context.PromotionReports.Add(report);
            promo.Metrics.CriticalReportsCount++;

            if (promo.Metrics.CriticalReportsCount >= 3)
            {
                promo.Status = "HIDDEN_BY_REPORTS";
                promo.Metrics.TrafficLight = "RED";
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Success = true,
                Message = "Report registered",
                Status = promo.Status,
                CriticalReportsCount = promo.Metrics.CriticalReportsCount
            });
        }

        /// <summary>
        /// Registra la apertura de canje en 1 toque.
        /// </summary>
        [HttpPost("{id}/claim")]
        public async Task<IActionResult> TrackClaim(string id)
        {
            var metric = await _context.PromotionMetrics.FindAsync(id);
            if (metric != null)
            {
                metric.OpenCount++;
                await _context.SaveChangesAsync();
            }
            return Ok(new { Success = true });
        }
    }

    public record FeedbackRequest(string Type);
    public record ReportRequest(string? Reason, string? Details);
}
