using fundmonitoring.CommandModel;
using fundmonitoring.Models;
using fundmonitoring.QueryModel;

namespace fundmonitoring.Interface
{
    public interface IOrganization
    {
        void Add(OrganizationCommandModel model);
        void Update(OrganizationCommandModel model);
        void Delete(int sno);
        List<OrganizationQueryModel> GetAll();
        void ImportFromExcel(IFormFile file);

        // not in use below now 
        Task<List<string>> GetOrganizationTypesWithMonthAsync();

        Task<List<string>> GetOrganizationTypesWithYearAsync();

       
    }
   

}
