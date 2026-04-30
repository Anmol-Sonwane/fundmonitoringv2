using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using fundmonitoring.Service;
using Microsoft.AspNetCore.Mvc;

namespace fundmonitoring.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrganizationController : ControllerBase
    {
        private readonly IOrganization _service;

        public OrganizationController(IOrganization service)
        {
            _service = service;
        }

        [HttpPost("add")]
        public IActionResult Add(OrganizationCommandModel model)
        {
            try
            {
                _service.Add(model);
                return Ok("Organization Added Successfully");
            }
            catch (Exception ex)
            {
                // Handles duplicate or other exceptions
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("update")]
        public IActionResult Update(OrganizationCommandModel model)
        {
            try
            {
                _service.Update(model);
                return Ok("Organization Updated Successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("delete/{sno}")]
        public IActionResult Delete(int sno)
        {
            try
            {
                _service.Delete(sno);
                return Ok("Organization Deleted Successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("getall")]
        public IActionResult GetAll()
        {
            try
            {
                return Ok(_service.GetAll());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("import-excel")]
        public IActionResult ImportExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Please upload an Excel file.");

            try
            {
                _service.ImportFromExcel(file);
                return Ok("Excel data imported successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // not in use below now 

        // GET: api/Organization/TypesWithMonth
        [HttpGet("TypesWithMonth")]
        public async Task<ActionResult<List<string>>> GetOrganizationTypesWithMonth()
        {
            var types = await _service.GetOrganizationTypesWithMonthAsync();
            return Ok(types);
        }

        [HttpGet("TypesWithYear")] // NEW
        public async Task<ActionResult<List<string>>> GetOrganizationTypesWithYear()
        {
            var types = await _service.GetOrganizationTypesWithYearAsync();
            return Ok(types);
        }

        
    }
}
