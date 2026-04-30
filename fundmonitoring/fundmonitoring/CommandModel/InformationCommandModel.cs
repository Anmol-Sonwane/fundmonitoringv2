namespace fundmonitoring.CommandModel
{
    public class InformationCommandModel
    {
        public int InfoSno { get; set; }

        public int Sno { get; set; }   // FK to Organization

        public string OrganizationName { get; set; } = null!;

        public string? Block { get; set; }

        public string? HostelSuperintendent { get; set; }

        public string? MobileNo { get; set; }

        public int? TotalSeat { get; set; }

        public int? AdmittedSeat { get; set; }

        public string? Remark { get; set; }

        public string? Remark2 { get; set; }
    }
}
