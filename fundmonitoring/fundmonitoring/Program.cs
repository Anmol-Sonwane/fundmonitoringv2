using fundmonitoring.Interface;
using fundmonitoring.Models;
using fundmonitoring.Service;
using fundmonitoring.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// -------------------- Database Configuration --------------------
var conn = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<FundmonitoringnewContext>(options =>
    options.UseMySql(
        conn,
        ServerVersion.AutoDetect(conn)
    )
);

// -------------------- Dependency Injection --------------------
builder.Services.AddScoped<IOrganization, OrganizationService>();
builder.Services.AddScoped<IInformation, InformationService>();
builder.Services.AddScoped<IMonthlyCalculation, MonthlyCalculationService>();
builder.Services.AddScoped<IYearlyCalculation, YearlyCalculationService>();
builder.Services.AddScoped<ILoginService, LoginService>();
builder.Services.AddScoped<ICalculationService, CalculationService>();
builder.Services.AddScoped<IMonthlyinfrastructure, MonthlyInfrastructureService>();
builder.Services.AddScoped<INodel, NodelService>();
builder.Services.AddScoped<INodelentry, NodelentryService>();
builder.Services.AddScoped<IStudentInformation, StudentInformationService>();
builder.Services.AddScoped<IStudenthealth, StudentHealthService>();
builder.Services.AddHttpClient<IHeadcountDetector, HeadcountDetectorService>();

// -------------------- JWT Authentication --------------------
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey!)
        ),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// -------------------- Controllers --------------------
builder.Services.AddControllers();

// -------------------- Swagger --------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "fundmonitoring",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter JWT token like: Bearer {token}"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


// -------------------- CORS --------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

app.UseStaticFiles();
app.UseForwardedHeaders();

// -------------------- Middleware Pipeline --------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

var enableHttpsRedirection = builder.Configuration.GetValue("EnableHttpsRedirection", !app.Environment.IsDevelopment());
if (enableHttpsRedirection)
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");

// ?? ORDER IS IMPORTANT
app.UseAuthentication(); // ? MUST COME BEFORE Authorization
app.UseAuthorization();

app.MapControllers();

app.Run();
