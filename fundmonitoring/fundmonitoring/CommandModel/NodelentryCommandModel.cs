namespace fundmonitoring.CommandModel
{
    public class NodelentryCommandModel
    {
        public int IdNodelEntry { get; set; }

        public int? IdNodel { get; set; }

        public int? AdmittedSeat { get; set; }

        public int? Month { get; set; }

        public int? Year { get; set; }

        public string? Remark { get; set; }

        public IFormFile? Photo1 { get; set; }

        public IFormFile? Photo2 { get; set; }

        public string? Remark1 { get; set; }

        public string? Remark2 { get; set; }
        public int? HeadCount1 { get; set; }

        public int? HeadCount2 { get; set; }
    }
}
