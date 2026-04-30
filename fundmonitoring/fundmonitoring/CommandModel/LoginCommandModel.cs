namespace fundmonitoring.CommandModel
{
    public class LoginCommandModel
    {
        public int Id { get; set; } 
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? LoginRole { get; set; }  // ✅ Nullable
    }

}
