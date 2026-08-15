using FluentValidation;
using Gym_Management_System.Contexts;
using Gym_Platform_V1.Abstractions.Implemention.Services;
using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.optins;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("Admin@123"));
// ============================================
// DATABASE CONFIGURATION
// ============================================
builder.Services.AddDbContext<GymPlatformDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.")));

// ============================================
// JWT AUTHENTICATION CONFIGURATION
// ============================================
var jwtSection = builder.Configuration.GetSection("Jwt").Get<Jwtoptions>();
var jwtKey = jwtSection.Key;
var jwtIssuer = jwtSection.Issuer;
var jwtAudience = jwtSection.Audience;

// ============================================
// FluentValidation 
// ============================================
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly, includeInternalTypes: true);

var symmetricSecurityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = symmetricSecurityKey,
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero // Strict token expiration validation
        };
    });
builder.Services.Configure<Jwtoptions>(builder.Configuration.GetSection("Jwt"));

// ============================================
// AUTHORIZATION CONFIGURATION
// ============================================
builder.Services.AddAuthorization();

// ============================================
// DEPENDENCY INJECTION
// ============================================
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAdminAuthService, AdminAuthService>();
builder.Services.AddScoped<ITrainerAuthService, TrainerAuthService>();
builder.Services.AddScoped<IGymOwnerService, GymOwnerService>();
builder.Services.AddScoped<IGymOwnerApplicationService, GymOwnerApplicationService>();
builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<IGymOwnerAuthService, GymOwnerAuthService>();
builder.Services.AddScoped<ITrainerService, TrainerService>();

// ============================================
// API CONFIGURATION
// ============================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ============================================
// HTTP PIPELINE CONFIGURATION
// ============================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Add Authentication middleware BEFORE Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
