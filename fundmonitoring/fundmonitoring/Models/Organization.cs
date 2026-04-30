using System;
using System.Collections.Generic;

namespace fundmonitoring.Models;

public partial class Organization
{
    public int Sno { get; set; }

    public string OrganizationType { get; set; } = null!;

    public string? Remark { get; set; }

    public virtual ICollection<Information> Information { get; set; } = new List<Information>();

    public virtual ICollection<Monthlycalculation> Monthlycalculations { get; set; } = new List<Monthlycalculation>();

    public virtual ICollection<Monthlyinfrastructure> Monthlyinfrastructures { get; set; } = new List<Monthlyinfrastructure>();

    public virtual ICollection<Studentinformation> Studentinformations { get; set; } = new List<Studentinformation>();

    public virtual ICollection<Yearlycalculation> Yearlycalculations { get; set; } = new List<Yearlycalculation>();
}
