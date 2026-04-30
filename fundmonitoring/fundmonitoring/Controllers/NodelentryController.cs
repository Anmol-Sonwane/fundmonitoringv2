using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using Microsoft.AspNetCore.Mvc;

namespace fundmonitoring.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NodelentryController : ControllerBase
    {
        private readonly INodelentry _service;

        public NodelentryController(INodelentry service)
        {
            _service = service;
        }

        // ======================
        // ADD
        // ======================
        [HttpPost("Add")]
        public async Task<IActionResult> Add(
      [FromForm] NodelentryCommandModel model,
      IFormFile? photo1,
      IFormFile? photo2)
        {
            var result = await _service.Add(model, photo1, photo2);

            if (result)
                return Ok("Data Added Successfully");

            return BadRequest("Insert Failed");
        }

        // ======================
        // UPDATE
        // ======================
        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] NodelentryCommandModel model)
        {
            var result = await _service.Update(id, model, model.Photo1, model.Photo2);

            if (result)
                return Ok("Data Updated Successfully");

            return NotFound("Record Not Found");
        }

        // ======================
        // DELETE
        // ======================
        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.Delete(id);

            if (result)
                return Ok("Deleted Successfully");

            return NotFound("Record Not Found");
        }

        // ======================
        // VIEW ALL
        // ======================
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAll();

            return Ok(data);
        }

        [HttpGet("GetByMonthYear")]
        public async Task<IActionResult> GetByMonthYear(int month, int year)
        {
            var data = await _service.GetByMonthYear(month, year);

            if (data == null || data.Count == 0)
                return NotFound("No data found for this month and year");

            return Ok(data);
        }
    }
}