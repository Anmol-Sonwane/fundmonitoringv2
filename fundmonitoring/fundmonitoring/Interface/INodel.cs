using fundmonitoring.CommandModel;
using fundmonitoring.QueryModel;
using Microsoft.EntityFrameworkCore;

namespace fundmonitoring.Interface
{
    public interface INodel
    {
        Task<bool> Add(NodelCommandModel model);

        Task<bool> Update(int id, NodelCommandModel model);

        Task<bool> Delete(int id);

        Task<List<NodelQueryModel>> GetAll();

        Task<List<string>> GetAllNodelName();

        Task<List<string>> GetHostelNameByNodelName(string nodelName);

        Task<NodelQueryModel?> GetBlockSeatByHostel(string hostelName);

        void ImportFromExcel(IFormFile file);
        Task<int> GetTotalUniqueHostels();
        
    }
}