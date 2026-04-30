using fundmonitoring.Interface;
using fundmonitoring.CommandModel;
using Microsoft.AspNetCore.Mvc;

namespace fundmonitoring.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MonthlyInfrastructureController : ControllerBase
    {
        private readonly IMonthlyinfrastructure _service;

        public MonthlyInfrastructureController(IMonthlyinfrastructure service)
        {
            _service = service;
        }

        // =========================
        // ADD
        // =========================
        [HttpPost("add")]
        public async Task<IActionResult> Add([FromForm] MonthlyinfrastructureCommandModel model)
        {
            var result = await _service.Add(model);
            return Ok(result);
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("update")]
        public async Task<IActionResult> Update([FromForm] MonthlyinfrastructureCommandModel model)
        {
            var result = await _service.Update(model);
            return result == null ? NotFound() : Ok(result);
        }

        // =========================
        // DELETE
        // =========================
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.Delete(id);
            return success ? Ok() : NotFound();
        }

        // =========================
        // GET ALL
        // =========================
        [HttpGet("getall")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _service.GetAll();
            return Ok(list);
        }

        // =========================
        // GET BY ID
        // =========================
        [HttpGet("getbyid/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetById(id);
            return result == null ? NotFound() : Ok(result);
        }

        // =========================
        // FILTER BY ORGANIZATION NAME
        // =========================
        [HttpGet("GetByOrganizationName")]
        public async Task<IActionResult> GetByOrganizationName([FromQuery] string organizationName)
        {
            if (string.IsNullOrEmpty(organizationName))
                return BadRequest("Organization name is required");

            var result = await _service.GetByOrganizationName(organizationName);
            return Ok(result);
        }

        // =========================
        // FILTER BY MONTH & YEAR
        // =========================
        // Example:
        // api/MonthlyInfrastructure/GetByMonthYear?month=January&year=2026
        [HttpGet("GetByMonthYear")]
        public async Task<IActionResult> GetByMonthYear(
            [FromQuery] string? month,
            [FromQuery] string? year)
        {
            var result = await _service.GetByMonthYear(month, year);
            return Ok(result);
        }

        // =========================
        // TOTAL BY ORGANIZATION TYPE
        // =========================
        // Example:
        // api/MonthlyInfrastructure/GetTotalByOrganizationType?month=January&year=2026
        [HttpGet("GetTotalByOrganizationType")]
        public async Task<IActionResult> GetTotalByOrganizationType(
            [FromQuery] string? month,
            [FromQuery] string? year)
        {
            try
            {
                var result = await _service.GetTotalByOrganizationType(month, year);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Failed to fetch summary",
                    error = ex.InnerException?.Message ?? ex.Message
                });
            }
        }
        [HttpGet("GetOrganizationsByType")]
        public async Task<IActionResult> GetOrganizationsByType(string orgType)
        {
            var data = await _service.GetAll();
            var result = data
                .Where(x => x.OrganizationType == orgType)
                .GroupBy(x => x.OrganizationName)
                .Select(g => new
                {
                    OrganizationName = g.Key,
                    Total = g.Sum(x => x.Total ?? 0)
                });

            return Ok(result);
        }
    }
}