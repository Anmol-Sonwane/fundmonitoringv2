using System;
using System.Collections.Generic;

namespace fundmonitoring.Models;

public partial class Login
{
    public int Id { get; set; }

    public string? Username { get; set; }

    public string? Password { get; set; }

    public string? LoginRole { get; set; }
}
