namespace fundmonitoring.QueryModel
{
    public class StudenthealthQueryModel
    {
        public int Shsno { get; set; }

        public string? StudentName { get; set; }
        public DateTime? Dob { get; set; }

        public string? OrganizationType { get; set; }
        public string? OrganizationName { get; set; }
        public string? Block { get; set; }

        public string? Month { get; set; }
        public string? Year { get; set; }
        public int? Age { get; set; }
        public decimal? Height { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Bmi { get; set; }

        public string? Remark { get; set; }
    }
}
