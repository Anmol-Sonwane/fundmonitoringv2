using System;
using System.Collections.Generic;

namespace fundmonitoring.Models;

public partial class Monthlycalculation
{
    public int MonSno { get; set; }

    public int Sno { get; set; }

    public string? OrganizationName { get; set; }

    public string? Block { get; set; }

    public int? AdmittedSeat { get; set; }

    public string? Month { get; set; }

    public string? Year { get; set; }

    public decimal? Amount { get; set; }

    public decimal? Total { get; set; }

    public string? Remark { get; set; }

    public string? Photo1 { get; set; }

    public string? Photo2 { get; set; }

    public string? Photo3 { get; set; }

    public string? Photo4 { get; set; }

    public string? Photo5 { get; set; }

    public string? Photo6 { get; set; }

    public string? Photo7 { get; set; }

    public string? Photo8 { get; set; }

    public string? Photo9 { get; set; }

    public string? Photo10 { get; set; }

    public string? Remark1 { get; set; }

    public string? Remark2 { get; set; }

    public string? Remark3 { get; set; }

    public string? Remark4 { get; set; }

    public string? Remark5 { get; set; }

    public string? Remark6 { get; set; }

    public string? Remark7 { get; set; }

    public string? Remark8 { get; set; }

    public string? Remark9 { get; set; }

    public string? Remark10 { get; set; }

    public int? HeadCount1 { get; set; }

    public int? HeadCount2 { get; set; }

    public int? HeadCount3 { get; set; }

    public int? HeadCount4 { get; set; }

    public int? HeadCount5 { get; set; }

    public int? HeadCount6 { get; set; }

    public int? HeadCount7 { get; set; }

    public int? HeadCount8 { get; set; }

    public int? HeadCount9 { get; set; }

    public int? HeadCount10 { get; set; }

    public virtual Organization SnoNavigation { get; set; } = null!;
}
