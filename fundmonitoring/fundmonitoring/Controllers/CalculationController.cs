using fundmonitoring.Interface;
using fundmonitoring.QueryModel;
using fundmonitoring.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace fundmonitoring.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CalculationController : ControllerBase
    {
        private readonly ICalculationService _service; // <-- use interface

        public CalculationController(ICalculationService service) // <-- inject interface
        {
            _service = service;
        }


        // =========================
        // GET COMBINED TOTAL
        // =========================

        [HttpGet("total-summary")]
        public async Task<IActionResult> GetTotalSummary()
        {
            var result = await _service.GetCombinedTotal();
            return Ok(result);
        }
    }
}
