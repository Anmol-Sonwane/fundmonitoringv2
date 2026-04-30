using fundmonitoring.CommandModel;
using fundmonitoring.QueryModel;

namespace fundmonitoring.Interface
{
    public interface IMonthlyinfrastructure
    {
        // =========================
        // BASIC CRUD
        // =========================

        Task<MonthlyinfrastructureQueryModel> Add(MonthlyinfrastructureCommandModel model);

        Task<MonthlyinfrastructureQueryModel?> Update(MonthlyinfrastructureCommandModel model);

        Task<bool> Delete(int misno);

        Task<List<MonthlyinfrastructureQueryModel>> GetAll();

        Task<MonthlyinfrastructureQueryModel?> GetById(int misno);


        // =========================
        // OPTIONAL FILTER METHODS
        // =========================

        Task<List<MonthlyinfrastructureQueryModel>> GetByOrganizationName(string organizationName);

        Task<List<MonthlyinfrastructureQueryModel>> GetByMonthYear(string? month = null, string? year = null);

        Task<List<MonthlyinfrastructureSummaryQueryModel>> GetTotalByOrganizationType(string? month = null, string? year = null);
    }
}