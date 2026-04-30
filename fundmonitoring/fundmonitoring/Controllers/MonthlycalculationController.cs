using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class MonthlyCalculationController : ControllerBase
{
    private readonly IMonthlyCalculation _service;

    public MonthlyCalculationController(IMonthlyCalculation service)
    {
        _service = service;
    }

    [HttpPost("Add")]
    public async Task<IActionResult> Add([FromForm] MonthlycalculationCommandModel model)
    {
        try
        {
            var result = await _service.Add(model);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Failed to add record",
                error = ex.InnerException?.Message ?? ex.Message
            });
        }
    }


    [HttpPut("Update")]
    public async Task<IActionResult> Update([FromForm] MonthlycalculationCommandModel model)
    {
        try
        {
            var result = await _service.Update(model);
            if (result == null)
                return NotFound("Record not found");

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Failed to update record",
                error = ex.Message
            });
        }
    }

    [HttpDelete("Delete/{monSno}")]
    public async Task<IActionResult> Delete(int monSno)
    {
        try
        {
            var result = await _service.Delete(monSno);
            if (!result)
                return NotFound("Record not found");

            return Ok("Deleted Successfully");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Failed to delete record",
                error = ex.Message
            });
        }
    }

    [HttpGet("{monSno}")]
    public async Task<IActionResult> GetById(int monSno)
    {
        try
        {
            var result = await _service.GetById(monSno);
            if (result == null)
                return NotFound("Record not found");

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Failed to fetch record",
                error = ex.Message
            });
        }
    }

    [HttpGet("GetAll")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var result = await _service.GetAll();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Failed to fetch records",
                error = ex.Message
            });
        }
    }

    [HttpGet("GetTotalByOrganizationType")]
    public async Task<IActionResult> GetTotalByOrganizationType()
    {
        try
        {
            var result = await _service.GetTotalByOrganizationType();
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

    [HttpGet("GetTotalByOrganizationTypeMY")]
    public async Task<IActionResult> GetTotalByOrganizationType(
    [FromQuery] string? month,
    [FromQuery] string? year,
    [FromQuery] int? sno)
    {
        try
        {
            var result = await _service.GetTotalByOrganizationType(month, year, sno);
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

    [HttpGet("GetTotalByOrganizationName")]
    public async Task<IActionResult> GetTotalByOrganizationName()
    {
        try
        {
            var result = await _service.GetTotalByOrganizationName();
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

    [HttpGet("GetTotalByOrganizationNameMY")]
    public async Task<IActionResult> GetTotalByOrganizationName(
    [FromQuery] string? month,
    [FromQuery] string? year,
    [FromQuery] int? sno)
    {
        try
        {
            var result = await _service.GetTotalByOrganizationName(month, year, sno);
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
