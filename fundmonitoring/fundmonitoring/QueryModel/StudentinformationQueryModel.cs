namespace fundmonitoring.QueryModel
{
    public class StudentinformationQueryModel
    {
        public int Sissno { get; set; }


        public int? Sno { get; set; }

        public string OrganizationType { get; set; } = null!;

        public string? OrganizationName { get; set; }

        public string? Block { get; set; }

        public string? StudentName { get; set; }

        public DateOnly? Dob { get; set; }

        public string? Photo { get; set; }

        public string? Remark { get; set; }
    }
}
