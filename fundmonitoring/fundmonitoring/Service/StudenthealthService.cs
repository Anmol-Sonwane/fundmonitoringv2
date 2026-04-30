using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using fundmonitoring.Models;
using fundmonitoring.QueryModel;
using Microsoft.EntityFrameworkCore;

namespace fundmonitoring.Services
{
    public class StudentHealthService : IStudenthealth
    {
        private readonly FundmonitoringnewContext _context;

        public StudentHealthService(FundmonitoringnewContext context)
        {
            _context = context;
        }

        // =========================
        // ADD
        // =========================
        public async Task<Studenthealth> Add(StudenthealthCommandModel model)
        {
            try
            {
                // Validate student (FK)
                if (model.Sissno != null)
                {
                    var exists = await _context.Studentinformations
                        .AnyAsync(x => x.Sissno == model.Sissno);

                    if (!exists)
                        throw new ApplicationException("Invalid Student ID");
                }
                 

                
                int nextId = await _context.Studenthealths
                .Select(x => (int?)x.Shsno)
                .MaxAsync() ?? 0;

                nextId++;

                var entity = new Studenthealth
                {
                    Shsno = nextId,
                    Sissno = model.Sissno, // ✅ FIXED
                    Month = model.Month,
                    Year = model.Year,
                    Age = model.Age,
                    Weight = model.Weight,
                    Height = model.Height,

                    // BMI calculation
                    Bmi = (model.Height != null && model.Weight != null && model.Height != 0)
                        ? Math.Round((decimal)(model.Weight / (model.Height * model.Height)), 2)
                        : model.Bmi,

                    Remark = model.Remark
                };

                _context.Studenthealths.Add(entity);
                await _context.SaveChangesAsync();
                
                return entity;
            }
            catch (Exception ex)
            {
                throw new ApplicationException(ex.InnerException?.Message ?? ex.Message);
            }
        }

        // =========================
        // UPDATE
        // =========================
        public async Task<Studenthealth?> Update(int id, StudenthealthCommandModel model)
        {
            try
            {
                var entity = await _context.Studenthealths.FindAsync(id);

                if (entity == null)
                    return null;

                
                entity.Month = model.Month;
                entity.Year = model.Year;
                entity.Age = model.Age;
                entity.Weight = model.Weight;
                entity.Height = model.Height;

                entity.Bmi = (model.Height != null && model.Weight != null && model.Height != 0)
                    ? Math.Round((decimal)(model.Weight / (model.Height * model.Height)), 2)
                    : model.Bmi;

                entity.Remark = model.Remark;

                await _context.SaveChangesAsync();
                return entity;
            }
            catch (Exception ex)
            {
                throw new ApplicationException(ex.InnerException?.Message ?? ex.Message);
            }
        }

        // =========================
        // DELETE
        // =========================
        public async Task<bool> Delete(int id)
        {
            try
            {
                var entity = await _context.Studenthealths.FindAsync(id);

                if (entity == null)
                    return false;

                _context.Studenthealths.Remove(entity);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new ApplicationException(ex.InnerException?.Message ?? ex.Message);
            }
        }

        // =========================
        // GET BY ID
        // =========================
        public async Task<StudenthealthQueryModel?> GetById(int id)
        {
            return await _context.Studenthealths
                .Where(x => x.Shsno == id)
                .Select(x => new StudenthealthQueryModel
                {
                    Shsno = x.Shsno,

                    StudentName = x.SissnoNavigation.StudentName,
                    Dob = x.SissnoNavigation.Dob.HasValue
                    ? x.SissnoNavigation.Dob.Value.ToDateTime(TimeOnly.MinValue)
                    : null,

                    OrganizationType = x.SissnoNavigation.SnoNavigation.OrganizationType,
                    OrganizationName = x.SissnoNavigation.OrganizationName,
                    Block = x.SissnoNavigation.Block,

                    Month = x.Month,
                    Year = x.Year,
                    Age = x.Age,
                    Height = x.Height,
                    Weight = x.Weight,
                    Bmi = x.Bmi,
                    Remark = x.Remark
                })
                .FirstOrDefaultAsync();
        }

        // =========================
        // GET ALL
        // =========================
        public async Task<List<StudenthealthQueryModel>> GetAll()
        {
            return await _context.Studenthealths
                .OrderByDescending(x => x.Shsno)
                .Select(x => new StudenthealthQueryModel
                {
                    Shsno = x.Shsno,

                    StudentName = x.SissnoNavigation.StudentName,
                    Dob = x.SissnoNavigation.Dob.HasValue
                    ? x.SissnoNavigation.Dob.Value.ToDateTime(TimeOnly.MinValue)
                    : null,

                    OrganizationType = x.SissnoNavigation.SnoNavigation.OrganizationType,
                    OrganizationName = x.SissnoNavigation.OrganizationName,
                    Block = x.SissnoNavigation.Block,

                    Month = x.Month,
                    Year = x.Year,
                    Age = x.Age,
                    Height = x.Height,
                    Weight = x.Weight,
                    Bmi = x.Bmi,
                    Remark = x.Remark
                })
                .ToListAsync();
        }
    }
}