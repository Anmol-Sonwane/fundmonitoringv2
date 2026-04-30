using fundmonitoring.CommandModel;
using fundmonitoring.QueryModel;

namespace fundmonitoring.Services
{
    public interface IStudentInformation
    {
        Task<StudentinformationQueryModel> Add(StudentinformationCommandModel model);
        
            Task<StudentinformationQueryModel?> Update(int id, StudentinformationCommandModel model);
        
        Task<bool> Delete(int id);
        Task<string> ImportStudents(IFormFile file);

        Task<StudentinformationQueryModel> GetById(int id);
        Task<List<StudentinformationQueryModel>> GetAll();
        List<string?> GetStudentNames(string orgType, string orgName);
        StudentBasicInfo? GetStudentDetails(string orgType, string orgName, string studentName);
        Task<StudentIdResponse?> GetStudentByName(string orgType, string orgName, string studentName);
        Task<int> GetStudentCount();
    }
}
public class StudentBasicInfo
{
    public string? Block { get; set; }
    public DateOnly? Dob { get; set; }
}
public class StudentIdResponse
{
    public int Sissno { get; set; }
}