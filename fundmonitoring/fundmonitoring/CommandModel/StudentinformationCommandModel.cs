namespace fundmonitoring.CommandModel
{
    public class StudentinformationCommandModel
    {
        public int Sissno { get; set; }

        public int? Sno { get; set; }

        public string? OrganizationName { get; set; }

        public string? Block { get; set; }

        public string? StudentName { get; set; }

        public DateOnly? Dob { get; set; }

        public IFormFile? PhotoFile { get; set; } // 🔥 important

        public string? Remark { get; set; }
    }
}
