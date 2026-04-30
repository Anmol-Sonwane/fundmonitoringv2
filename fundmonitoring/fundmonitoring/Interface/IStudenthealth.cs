using fundmonitoring.CommandModel;
using fundmonitoring.Models;
using fundmonitoring.QueryModel;

namespace fundmonitoring.Interface
{
    public interface IStudenthealth
    {
        Task<Studenthealth> Add(StudenthealthCommandModel model);
        Task<Studenthealth?> Update(int id, StudenthealthCommandModel model);
        Task<bool> Delete(int id);
        Task<StudenthealthQueryModel?> GetById(int id);
       Task<List<StudenthealthQueryModel>> GetAll();
    }
}