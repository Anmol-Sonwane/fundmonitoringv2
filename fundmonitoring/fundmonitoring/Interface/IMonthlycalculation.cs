using fundmonitoring.CommandModel;
using fundmonitoring.Models;
using fundmonitoring.QueryModel;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace fundmonitoring.Interface
{
    public interface IMonthlyCalculation
    {
        Task<MonthlycalculationQueryModel> Add(MonthlycalculationCommandModel model);
        Task<MonthlycalculationQueryModel> Update(MonthlycalculationCommandModel model);
        Task<bool> Delete(int monSno);
        Task<MonthlycalculationQueryModel> GetById(int monSno);
        Task<List<MonthlycalculationQueryModel>> GetAll();

        Task<List<MonthlyCalculationSummaryQueryModel>> GetTotalByOrganizationType();

        Task<List<MonthlyCalculationSummaryQueryModel>> GetTotalByOrganizationType(
          string? month = null,
          string? year = null,
          int? sno = null);

        Task<List<MonthlyCalculationByOrganizationQueryModel>> GetTotalByOrganizationName();

        Task<List<MonthlyCalculationByOrganizationQueryModel>> GetTotalByOrganizationName(
        string? month = null,
        string? year = null,
        int? sno = null);

        Task<List<OrganizationResultModel>> GetOrganizationsByTypeAsync(string orgType);
        Task<List<MonthlycalculationQueryModel>> GetAllByOrganizationNameAsync(string organizationName);

    }
    public class OrganizationResultModel
    {
        public int OrganizationId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }
}
