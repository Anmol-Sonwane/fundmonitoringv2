namespace fundmonitoring.QueryModel
{
    public class TotalSummaryQueryModel
    {
        public decimal MonthlyTotal { get; set; }
        public decimal YearlyTotal { get; set; }

        public decimal MonthlyInfraTotal { get; set; }
        public decimal GrandTotal => MonthlyTotal + YearlyTotal + MonthlyInfraTotal;
    }
}
