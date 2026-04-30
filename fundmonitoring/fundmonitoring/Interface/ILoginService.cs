using fundmonitoring.CommandModel;
using fundmonitoring.QueryModel;

namespace fundmonitoring.Interface
{
    public interface ILoginService
    {
        LoginResponseModel Login(LoginCommandModel model);
    }
}
