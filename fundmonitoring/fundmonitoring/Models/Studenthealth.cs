using System;
using System.Collections.Generic;

namespace fundmonitoring.Models;

public partial class Studenthealth
{
    public int Shsno { get; set; }

    public int? Sissno { get; set; }

    public string? Month { get; set; }

    public string? Year { get; set; }

    public int? Age { get; set; }

    public decimal? Weight { get; set; }

    public decimal? Height { get; set; }

    public decimal? Bmi { get; set; }

    public string? Remark { get; set; }

    public virtual Studentinformation? SissnoNavigation { get; set; }
}
