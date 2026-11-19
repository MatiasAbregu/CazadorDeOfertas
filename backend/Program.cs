using Microsoft.EntityFrameworkCore;
using CentralizadorDescuentos.Data;
using CentralizadorDescuentos.Services;

var builder = WebApplication.CreateBuilder(args);

// Configuración de MySQL Pomelo Entity Framework Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost;Port=3306;Database=centralizador_descuentos;User=root;Password=mysql_secure_pass;CharSet=utf8mb4;";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString),
        mySqlOptions =>
        {
            mySqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorNumbersToAdd: null);
        });
});

// Registrar servicios de cifrado seguro para la bóveda de tokens
builder.Services.AddSingleton<ITokenEncryptionService, TokenEncryptionService>();

// Controladores MVC
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configuración de CORS para el frontend React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactSpa", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Inicialización de la base de datos MySQL con migraciones automáticas
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        db.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Aviso de inicialización de MySQL: asegurar base de datos en ejecución.");
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowReactSpa");
app.UseAuthorization();
app.MapControllers();

app.Run();
