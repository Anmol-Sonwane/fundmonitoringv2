using fundmonitoring.Interface;
using System.Net.Http.Headers;
using System.Text.Json;

namespace fundmonitoring.Services
{
    public class HeadcountDetectorService : IHeadcountDetector
    {
        private readonly HttpClient _http;
        private readonly string _url;

        public HeadcountDetectorService(HttpClient http, IConfiguration config)
        {
            _http = http;
            _url = config["HeadcountService:Url"]!; // reads http://localhost:5050/count
        }

        public async Task<int> DetectAsync(IFormFile photo)
        {
            try
            {
                using var content = new MultipartFormDataContent();
                using var stream = photo.OpenReadStream();

                var fileContent = new StreamContent(stream);
                fileContent.Headers.ContentType =
                    new MediaTypeHeaderValue(photo.ContentType ?? "image/jpeg");

                content.Add(fileContent, "image", photo.FileName);

                var response = await _http.PostAsync(_url, content);

                if (!response.IsSuccessStatusCode)
                    return 0;

                var json = await response.Content.ReadAsStringAsync();
                Console.WriteLine("RAW PYTHON RESPONSE: " + json);

                using var doc = JsonDocument.Parse(json);

                if (doc.RootElement.TryGetProperty("count", out var countProp))
                {
                    return countProp.GetInt32();
                }

                return 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("ERROR: " + ex.Message);
                return 0;
            }
        }

        private class HeadcountResult
        {
            public int Count { get; set; }
        }
    }
}