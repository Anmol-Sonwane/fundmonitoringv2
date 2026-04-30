using fundmonitoring.Interface;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class HeadcountController : ControllerBase
{
    private readonly IHeadcountDetector _detector;

    public HeadcountController(IHeadcountDetector detector)
    {
        _detector = detector;
    }

    [HttpPost]
    public async Task<IActionResult> Detect(IFormFile image)
    {
        if (image == null)
            return BadRequest("No image");

        var count = await _detector.DetectAsync(image);

        return Ok(new { count });
    }
}