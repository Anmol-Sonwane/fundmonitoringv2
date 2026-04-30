using Microsoft.AspNetCore.Mvc;
using fundmonitoring.CommandModel;
using fundmonitoring.Interface;

namespace fundmonitoring.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentHealthController : ControllerBase
    {
        private readonly IStudenthealth _service;

        public StudentHealthController(IStudenthealth service)
        {
            _service = service;
        }

        // =========================
        // ADD
        // =========================
        [HttpPost("Add")]
        public async Task<IActionResult> Add([FromBody] StudenthealthCommandModel model)
        {
            var result = await _service.Add(model);
            return Ok(result);
        }

        // =========================
        // UPDATE
        // =========================
        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] StudenthealthCommandModel model)
        {
            var result = await _service.Update(id, model);

            if (result == null)
                return BadRequest(new { message = "Record not found" });

            return Ok(result);
        }

        // =========================
        // DELETE
        // =========================
        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.Delete(id);

            if (!result)
                return BadRequest(new { message = "Record not found" });

            return Ok(new { message = "Deleted successfully" });
        }

        // =========================
        // GET BY ID
        // =========================
        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetById(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        // =========================
        // GET ALL
        // =========================
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAll();
            return Ok(result);
        }
    }
}