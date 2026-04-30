using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using fundmonitoring.Models;
using fundmonitoring.QueryModel;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace fundmonitoring.Service
{
    public class LoginService : ILoginService
    {
        private readonly FundmonitoringnewContext _context;
        private readonly IConfiguration _config;

        public LoginService(FundmonitoringnewContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public LoginResponseModel Login(LoginCommandModel model)
        {
            var user = _context.Logins
                .FirstOrDefault(x =>
                    x.Username == model.Username &&
                    x.Password == model.Password);

            if (user == null)
                throw new Exception("Invalid Username or Password");

            // 🔐 Claims
            var claims = new[]
            {
            new Claim(ClaimTypes.Name, user.Username!),
            new Claim(ClaimTypes.Role, user.LoginRole!)
        };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    Convert.ToDouble(_config["Jwt:ExpireMinutes"])
                ),
                signingCredentials: creds
            );

            return new LoginResponseModel
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Username = user.Username!,
                Role = user.LoginRole!
            };
        }
    }
}
