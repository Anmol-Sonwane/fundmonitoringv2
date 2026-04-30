using fundmonitoring.Interface;
using fundmonitoring.CommandModel;
using fundmonitoring.QueryModel;
using Microsoft.AspNetCore.Mvc;

namespace fundmonitoring.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class YearlyCalculationController : ControllerBase
    {
        private readonly IYearlyCalculation _service;

        public YearlyCalculationController(IYearlyCalculation service)
        {
            _service = service;
        }

        [HttpPost("add")]
        public async Task<IActionResult> Add([FromForm] YearlycalculationCommandModel model)
        {
            var result = await _service.Add(model);
            return Ok(result);
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update([FromForm] YearlycalculationCommandModel model)
        {
            var result = await _service.Update(model);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.Delete(id);
            return success ? Ok() : NotFound();
        }

        [HttpGet("getall")]
        public async Task<IActionResult> GetAll()
        {
            var list = await _service.GetAll();
            return Ok(list);
        }

        [HttpGet("getbyid/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetById(id);
            return result == null ? NotFound() : Ok(result);
        }


        [HttpGet("GetTotalByOrganizationTypeYear")]
        public async Task<IActionResult> GetTotalByOrganizationTypeYear()
        {
            try
            {
                var result = await _service.GetTotalByOrganizationTypeYear();
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

        [HttpGet("GetTotalByOrganizationTypeY")]
        public async Task<IActionResult> GetTotalByOrganizationTypeY(

        [FromQuery] string? year,
        [FromQuery] int? sno)
        {
            try
            {
                var result = await _service.GetTotalByOrganizationTypeY(year, sno);
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

        [HttpGet("GetTotalByOrganizationNameYear")]
        public async Task<IActionResult> GetTotalByOrganizationNameYear()
        {
            try
            {
                var result = await _service.GetTotalByOrganizationNameYear();
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

        [HttpGet("GetTotalByOrganizationNameY")]
        public async Task<IActionResult> GetTotalByOrganizationNameY(

        [FromQuery] string? year,
        [FromQuery] int? sno)
        {
            try
            {
                var result = await _service.GetTotalByOrganizationNameY(year, sno);
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
        // GET: api/YearlyCalculation/GetOrganizationsByType?orgType=School
        [HttpGet("GetOrganizationsByType")]
        public async Task<IActionResult> GetOrganizationsByType([FromQuery] string orgType)
        {
            if (string.IsNullOrEmpty(orgType))
                return BadRequest("Organization type is required");

            var organizations = await _service.GetOrganizationsByTypeAsync(orgType);

            return Ok(organizations);
        }
        [HttpGet("GetAllByOrganizationName")]
        public async Task<IActionResult> GetAllByOrganizationName([FromQuery] string organizationName)
        {
            if (string.IsNullOrEmpty(organizationName))
                return BadRequest("Organization name is required");

            var records = await _service.GetAllByOrganizationNameAsync(organizationName);

            return Ok(records);
        }
    }
}