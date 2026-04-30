using fundmonitoring.Interface;
using fundmonitoring.Models;
using fundmonitoring.QueryModel;
using Microsoft.EntityFrameworkCore;

namespace fundmonitoring.Services
{
    public class CalculationService :ICalculationService
    {
        private readonly FundmonitoringnewContext _context;

        public CalculationService(FundmonitoringnewContext context)
        {
            _context = context;
        }

        // =========================
        // Get combined total of Monthly + Yearly
        // =========================
        public async Task<TotalSummaryQueryModel> GetCombinedTotal()
        {
            decimal monthlyTotal = await _context.Monthlycalculations
                .SumAsync(m => m.Total ?? 0);

            decimal yearlyTotal = await _context.Yearlycalculations
                .SumAsync(y => y.Total ?? 0);

            decimal monthlyinfraTotal = await _context.Monthlyinfrastructures
                .SumAsync(m => m.Total ?? 0);

            return new TotalSummaryQueryModel
            {
                MonthlyTotal = monthlyTotal,
                YearlyTotal = yearlyTotal,
                MonthlyInfraTotal=monthlyinfraTotal

            };
        }
    }
}
