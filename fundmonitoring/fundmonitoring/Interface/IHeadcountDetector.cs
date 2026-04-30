namespace fundmonitoring.Interface
{
    public interface IHeadcountDetector
    {
        Task<int> DetectAsync(IFormFile photo);
    }
}
