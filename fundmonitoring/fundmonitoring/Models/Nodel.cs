using System;
using System.Collections.Generic;

namespace fundmonitoring.Models;

/// <summary>
/// 
/// 
/// 				
/// </summary>
public partial class Nodel
{
    public int IdNodel { get; set; }

    public string? NodelName { get; set; }

    public string? HostelName { get; set; }

    public string? Block { get; set; }

    public int? TotalSeat { get; set; }

    public virtual ICollection<Nodelentry> Nodelentries { get; set; } = new List<Nodelentry>();
}
