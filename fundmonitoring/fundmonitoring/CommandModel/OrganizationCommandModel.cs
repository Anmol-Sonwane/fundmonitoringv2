namespace fundmonitoring.CommandModel
{
    public class OrganizationCommandModel
    {
        public int Sno { get; set; }

        public string OrganizationType { get; set; } = null!;

        public string? Remark { get; set; }
    }
}
