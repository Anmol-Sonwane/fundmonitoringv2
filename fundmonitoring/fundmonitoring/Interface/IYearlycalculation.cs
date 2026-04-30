using fundmonitoring.CommandModel;
using fundmonitoring.QueryModel;

namespace fundmonitoring.Interface
{
    public interface IYearlyCalculation
    {
        Task<YearlycalculationQueryModel> Add(YearlycalculationCommandModel model);
        Task<YearlycalculationQueryModel?> Update(YearlycalculationCommandModel model);
        Task<bool> Delete(int yearSno);
        Task<YearlycalculationQueryModel?> GetById(int yearSno);
        Task<List<YearlycalculationQueryModel>> GetAll();

        Task<List<YearlyCalculationSummaryQueryModel>> GetTotalByOrganizationTypeYear();
        Task<List<YearlyCalculationSummaryQueryModel>> GetTotalByOrganizationTypeY(string? year = null, int? sno = null);

        Task<List<YearlyCalculationByOrganizationQueryModel>> GetTotalByOrganizationNameYear();
        Task<List<YearlyCalculationByOrganizationQueryModel>> GetTotalByOrganizationNameY(string? year = null, int? sno = null);

        Task<List<OrganizationResultModelY>> GetOrganizationsByTypeAsync(string orgType);

        Task<List<YearlycalculationQueryModel>> GetAllByOrganizationNameAsync(string organizationName);
    }


    public class OrganizationResultModelY
    {
        public int OrganizationId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public decimal Total { get; set; }
    }
}