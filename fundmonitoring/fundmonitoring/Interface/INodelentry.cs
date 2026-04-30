using fundmonitoring.CommandModel;
using fundmonitoring.QueryModel;

namespace fundmonitoring.Interface
{
    public interface INodelentry
    {
        Task<bool> Add(NodelentryCommandModel model, IFormFile? photo1, IFormFile? photo2);

        Task<bool> Update(int id, NodelentryCommandModel model, IFormFile? photo1, IFormFile? photo2);

        Task<bool> Delete(int id);

        Task<List<NodelentryQueryModel>> GetAll();

        Task<List<NodelentryQueryModel>> GetByMonthYear(int month, int year);
    }
}