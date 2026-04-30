using fundmonitoring.Models;
using Microsoft.AspNetCore.Http;
using fundmonitoring.CommandModel;
using fundmonitoring.QueryModel;

namespace fundmonitoring.Interface
{
    public interface IInformation
    {
        Task<List<InformationQueryModel>> GetAllAsync();
        Task<InformationQueryModel?> GetByIdAsync(int id);
        Task<Information> AddAsync(InformationCommandModel model);
        Task<Information?> UpdateAsync(int id, InformationCommandModel model);
        Task<bool> DeleteAsync(int id);
        Task<int> ImportFromExcelAsync(IFormFile file);
        Task<List<OrganizationDropdownModel>> GetOrganizationDropdownAsync();
        Task<InformationQueryModel?> GetByOrganizationAsync(string organizationName);
        List<string> GetOrganizationNamesByType(string organizationType);
    }

    public class OrganizationDropdownModel
    {
        public int Sno { get; set; }
        public string OrganizationType { get; set; } = null!;
    }
    

}
