using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using Microsoft.AspNetCore.Mvc;
namespace fundmonitoring.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InformationController : ControllerBase
    {
        private readonly IInformation _service;

        public InformationController(IInformation service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var data = await _service.GetAllAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while fetching data.", Details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var data = await _service.GetByIdAsync(id);
                if (data == null) return NotFound(new { Message = $"Information with ID {id} not found." });
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while fetching data.", Details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] InformationCommandModel model)
        {
            try
            {
                var info = await _service.AddAsync(model);
                if (info == null)
                    return BadRequest(new { Message = "Duplicate entry detected. Cannot add record." });

                return Ok(info);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while adding data.", Details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] InformationCommandModel model)
        {
            try
            {
                var info = await _service.UpdateAsync(id, model);
                if (info == null)
                    return BadRequest(new { Message = "Duplicate entry detected or record not found." });

                return Ok(info);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while updating data.", Details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _service.DeleteAsync(id);
                if (!result) return NotFound(new { Message = $"Information with ID {id} not found." });

                return Ok(new { Message = "Record deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while deleting data.", Details = ex.Message });
            }
        }

        [HttpPost("ImportExcel")]
        public async Task<IActionResult> ImportExcel(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { Message = "No file uploaded or file is empty." });

                var count = await _service.ImportFromExcelAsync(file);
                return Ok(new { AddedRecords = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while importing Excel file.", Details = ex.Message });
            }
        }

        [HttpGet("OrganizationDropdown")]
        public async Task<IActionResult> GetOrganizationDropdown()
        {
            try
            {
                var data = await _service.GetOrganizationDropdownAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while fetching organization dropdown.", Details = ex.Message });
            }
        }
        [HttpGet("organization")]
        public async Task<IActionResult> GetByOrganization([FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name))
                return BadRequest("Organization name is required.");

            var result = await _service.GetByOrganizationAsync(name);
            if (result == null)
                return NotFound($"No record found for organization: {name}");

            return Ok(result);
        }


        [HttpGet("organization-names/by-type/{organizationType}")]
        public IActionResult GetOrganizationNamesByType(string organizationType)
        {
            var result = _service.GetOrganizationNamesByType(organizationType);
            return Ok(result);
        }
    }
}