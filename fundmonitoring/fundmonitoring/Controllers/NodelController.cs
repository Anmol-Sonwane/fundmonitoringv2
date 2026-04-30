using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using fundmonitoring.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace fundmonitoring.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NodelController : ControllerBase
    {
        private readonly INodel _service;

        public NodelController(INodel service)
        {
            _service = service;
        }

        // ======================
        // ADD
        // ======================
        [HttpPost("Add")]
        public async Task<IActionResult> Add(NodelCommandModel model)
        {
            var result = await _service.Add(model);

            if (result)
                return Ok("Data Added Successfully");

            return BadRequest("Insert Failed");
        }

        // ======================
        // UPDATE
        // ======================
        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update(int id, NodelCommandModel model)
        {
            var result = await _service.Update(id, model);

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
        // GET ALL
        // ======================
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAll();
            return Ok(data);
        }

        // ======================
        // GET ALL NODEL NAME
        // ======================
        [HttpGet("GetAllNodelName")]
        public async Task<IActionResult> GetAllNodelName()
        {
            var data = await _service.GetAllNodelName();
            return Ok(data);
        }

        // ======================
        // GET HOSTEL BY NODEL
        // ======================
        [HttpGet("GetHostelByNodel")]
        public async Task<IActionResult> GetHostelByNodel(string nodelName)
        {
            var data = await _service.GetHostelNameByNodelName(nodelName);
            return Ok(data);
        }

        // ======================
        // GET BLOCK + SEAT
        // ======================
        [HttpGet("GetBlockSeat")]
        public async Task<IActionResult> GetBlockSeat(string hostelName)
        {
            var data = await _service.GetBlockSeatByHostel(hostelName);
            return Ok(data);
        }

        [HttpPost("ImportExcel")]
        public IActionResult ImportExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File not selected");

            _service.ImportFromExcel(file);

            return Ok("Nodel Data Imported Successfully");
        }
        [HttpGet("GetTotalHostelCount")]
        public async Task<IActionResult> GetTotalHostelCount()
        {
            int totalHostels = await _service.GetTotalUniqueHostels();
            return Ok(new { totalHostels }); // returns { "totalHostels": 5 }
        }
    }
}