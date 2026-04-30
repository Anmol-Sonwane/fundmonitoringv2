using System;
using System.Collections.Generic;

namespace fundmonitoring.Models;

public partial class Studentinformation
{
    public int Sissno { get; set; }

    public int? Sno { get; set; }

    public string? OrganizationName { get; set; }

    public string? Block { get; set; }

    public string? StudentName { get; set; }

    public DateOnly? Dob { get; set; }

    public string? Photo { get; set; }

    public string? Remark { get; set; }

    public virtual Organization? SnoNavigation { get; set; }

    public virtual ICollection<Studenthealth> Studenthealths { get; set; } = new List<Studenthealth>();
}
