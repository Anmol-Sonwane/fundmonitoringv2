using fundmonitoring.QueryModel;
using System.Threading.Tasks;

namespace fundmonitoring.Interface
{
    public interface ICalculationService
    {
        Task<TotalSummaryQueryModel> GetCombinedTotal();
    }
}
