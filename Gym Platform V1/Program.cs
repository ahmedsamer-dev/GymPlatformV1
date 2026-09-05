using FluentValidation;
using Gym_Management_System.Contexts;
using Gym_Platform_V1.Abstractions.Implemention.Services;
using Gym_Platform_V1.Abstractions.Interfaces;
using Gym_Platform_V1.optins;
using Gym_Platform_V1.options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
//Console.WriteLine(BCrypt.Net.BCrypt.HashPassword("Admin@123"));
// ============================================
// DATABASE CONFIGURATION
// ============================================
builder.Services.AddDbContext<GymPlatformDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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
builder.Services.Configure<CorsSettings>(
builder.Configuration.GetSection("CorsSettings"));
builder.Services.AddAuthorization();

// ============================================
// CORS CONFIGURATION
// ============================================
var corsSettings = builder.Configuration
    .GetSection("CorsSettings")
    .Get<CorsSettings>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins(corsSettings!.AllowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

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
builder.Services.AddScoped<IMembershipPlanService, MembershipPlanService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
// ============================================
// MapsterConfig.RegisterMappings();
// ============================================
MapsterConfig.RegisterMappings();

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


if(app.Environment.IsDevelopment())
{   
    app.UseSwagger();
    app.UseSwaggerUI();
}



app.UseHttpsRedirection();

// Add Authentication middleware BEFORE Authorization
app.UseAuthentication();
app.UseAuthorization();

// Add CORS before routing/controllers
app.UseCors("FrontendPolicy");

app.MapControllers();

app.Run();
