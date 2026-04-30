using Microsoft.AspNetCore.Mvc;
using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using fundmonitoring.Services;
using Microsoft.EntityFrameworkCore;

namespace fundmonitoring.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentInformationController : ControllerBase
    {
        private readonly IStudentInformation _service;

        public StudentInformationController(IStudentInformation service)
        {
            _service = service;
        }

        // =========================
        // ADD STUDENT (WITH PHOTO)
        // =========================
        [HttpPost("Add")]
        public async Task<IActionResult> Add([FromForm] StudentinformationCommandModel model)
        {
            try
            {
                var result = await _service.Add(model);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }

        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] StudentinformationCommandModel model)
        {
            try
            {
                var result = await _service.Update(id, model);

                if (result == null)
                    return NotFound(new { message = "Record not found" });

                return Ok(new
                {
                    success = true,
                    message = "Updated successfully",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }

        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _service.Delete(id);
                return Ok(new { message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportStudents(IFormFile file)
        {
            try
            {
                var result = await _service.ImportStudents(file);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _service.GetById(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message,
                    inner = ex.InnerException?.Message
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
                return BadRequest(new
                {
                    message = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }
        [HttpGet("GetStudentNames")]
        public IActionResult GetStudentNames(string orgType, string orgName)
        {
            if (string.IsNullOrEmpty(orgType) || string.IsNullOrEmpty(orgName))
                return Ok(new List<string>()); // ❌ don't return BadRequest

            var data = _service.GetStudentNames(orgType, orgName);
            return Ok(data);
        }

        [HttpGet("GetStudentDetails")]
        public IActionResult GetStudentDetails(string orgType, string orgName, string studentName)
        {
            var data = _service.GetStudentDetails(orgType, orgName, studentName);

            if (data == null)
                return NotFound("Student not found");

            return Ok(data);
        }
        [HttpGet("GetStudentByName")]
        public async Task<IActionResult> GetStudentByName(
    [FromQuery] string orgType,
    [FromQuery] string orgName,
    [FromQuery] string studentName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(orgType) ||
                    string.IsNullOrWhiteSpace(orgName) ||
                    string.IsNullOrWhiteSpace(studentName))
                {
                    return BadRequest("Invalid parameters");
                }

                var data = await _service.GetStudentByName(orgType, orgName, studentName);

                if (data == null)
                    return NotFound("Student not found");

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        [HttpGet("GetCount")]
        public async Task<IActionResult> GetCount()
        {
            try
            {
                var count = await _service.GetStudentCount();

                return Ok(new
                {
                    totalStudents = count
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}