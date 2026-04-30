using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using fundmonitoring.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace fundmonitoring.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly ILoginService _service;
        private readonly FundmonitoringnewContext _context;

        public LoginController(ILoginService service, FundmonitoringnewContext context)
        {
            _service = service;
            _context = context;
        }

        // ================= LOGIN =================
        [AllowAnonymous]
        [HttpPost("login")]
        public IActionResult Login(LoginCommandModel model)
        {
            try
            {
                var result = _service.Login(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { title = ex.Message });
            }
        }


        // ================= GET ALL LOGINS =================
        [Authorize(Roles = "Admin")]
        [HttpGet("getall")]
        public IActionResult GetAll()
        {
            var logins = _context.Logins.ToList();
            return Ok(logins);
        }

        // ================= ADD LOGIN =================
        [Authorize(Roles = "Admin")]
        [HttpPost("add")]
        public IActionResult AddLogin(LoginCommandModel model)
        {
            int nextYearSno = _context.Logins.Any()
                ? _context.Logins.Max(h => h.Id) + 1
                : 1;
            var login = new Login
            {
                Id = nextYearSno,
                Username = model.Username,
                Password = model.Password, // TODO: Hash password later
                LoginRole = model.LoginRole
            };

            _context.Logins.Add(login);
            _context.SaveChanges();
            return Ok(login);
        }

        // ================= UPDATE LOGIN =================
        [Authorize(Roles = "Admin")]
        [HttpPut("update/{id}")]
        public IActionResult UpdateLogin(int id, LoginCommandModel model)
        {
            var login = _context.Logins.FirstOrDefault(x => x.Id == id);
            if (login == null) return NotFound("Login not found");

            login.Username = model.Username;
            login.Password = model.Password; // TODO: Hash password later
            login.LoginRole = model.LoginRole;

            _context.SaveChanges();
            return Ok(login);
        }

        // ================= DELETE LOGIN =================
        [Authorize(Roles = "Admin")]
        [HttpDelete("delete/{id}")]
        public IActionResult DeleteLogin(int id)
        {
            var login = _context.Logins.FirstOrDefault(x => x.Id == id);
            if (login == null) return NotFound("Login not found");

            _context.Logins.Remove(login);
            _context.SaveChanges();
            return Ok("Deleted successfully");
        }
    }
}
