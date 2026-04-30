using fundmonitoring.Interface;
using fundmonitoring.Models;
using fundmonitoring.CommandModel;
using fundmonitoring.QueryModel;
using Microsoft.EntityFrameworkCore;

namespace fundmonitoring.Services
{
    public class MonthlyInfrastructureService : IMonthlyinfrastructure
    {
        private readonly FundmonitoringnewContext _context;
        private readonly IWebHostEnvironment _env;

        public MonthlyInfrastructureService(FundmonitoringnewContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // =========================
        // SAVE PHOTO
        // =========================
        private async Task<string?> SavePhoto(IFormFile? file)
        {
            if (file == null) return null;

            var webRoot = _env.WebRootPath;
            if (string.IsNullOrEmpty(webRoot))
                webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

            var uploadPath = Path.Combine(webRoot, "uploads");

            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return "/uploads/" + fileName;
        }

        // =========================
        // ADD
        // =========================
        public async Task<MonthlyinfrastructureQueryModel> Add(MonthlyinfrastructureCommandModel model)
        {
            var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.OrganizationType == model.OrganizationType);

            if (organization == null)
                throw new ApplicationException($"Organization type '{model.OrganizationType}' not found.");

            int nextId = _context.Monthlyinfrastructures.Any()
                ? _context.Monthlyinfrastructures.Max(x => x.Misno) + 1
                : 1;

            var entity = new Monthlyinfrastructure
            {
                Misno = nextId,
                Sno = organization.Sno,
                OrganizationName = model.OrganizationName,
                Block = model.Block,
                Month = model.Month,
                Year = model.Year,
                Total = model.Total,
                Remark = model.Remark,

                Photo1 = await SavePhoto(model.Photo1),
                Photo2 = await SavePhoto(model.Photo2),
                Photo3 = await SavePhoto(model.Photo3),
                Photo4 = await SavePhoto(model.Photo4),
                Photo5 = await SavePhoto(model.Photo5),
                Photo6 = await SavePhoto(model.Photo6),
                Photo7 = await SavePhoto(model.Photo7),
                Photo8 = await SavePhoto(model.Photo8),
                Photo9 = await SavePhoto(model.Photo9),
                Photo10 = await SavePhoto(model.Photo10),

                Remark1 = model.Remark1,
                Remark2 = model.Remark2,
                Remark3 = model.Remark3,
                Remark4 = model.Remark4,
                Remark5 = model.Remark5,
                Remark6 = model.Remark6,
                Remark7 = model.Remark7,
                Remark8 = model.Remark8,
                Remark9 = model.Remark9,
                Remark10 = model.Remark10
            };

            _context.Monthlyinfrastructures.Add(entity);
            await _context.SaveChangesAsync();

            return MapToQuery(entity);
        }

        // =========================
        // DELETE
        // =========================
        public async Task<bool> Delete(int misno)
        {
            var entity = await _context.Monthlyinfrastructures.FindAsync(misno);
            if (entity == null) return false;

            _context.Monthlyinfrastructures.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // GET ALL
        // =========================
        public async Task<List<MonthlyinfrastructureQueryModel>> GetAll()
        {
            return await _context.Monthlyinfrastructures
                .Include(m => m.SnoNavigation)
                .Select(m => MapToQuery(m))
                .ToListAsync();
        }

        // =========================
        // GET BY ID
        // =========================
        public async Task<MonthlyinfrastructureQueryModel?> GetById(int misno)
        {
            var entity = await _context.Monthlyinfrastructures.FindAsync(misno);
            return entity == null ? null : MapToQuery(entity);
        }

        // =========================
        // UPDATE
        // =========================
        public async Task<MonthlyinfrastructureQueryModel?> Update(MonthlyinfrastructureCommandModel model)
        {
            var entity = await _context.Monthlyinfrastructures.FindAsync(model.Misno);
            if (entity == null) return null;

            var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.OrganizationType == model.OrganizationType);

            if (organization == null)
                throw new ApplicationException($"Organization type '{model.OrganizationType}' not found.");

            entity.Sno = organization.Sno;
            entity.OrganizationName = model.OrganizationName;
            entity.Block = model.Block;
            entity.Month = model.Month;
            entity.Year = model.Year;
            entity.Total = model.Total;
            entity.Remark = model.Remark;

            if (model.Photo1 != null)
                entity.Photo1 = await SavePhoto(model.Photo1);

            if (model.Photo2 != null)
                entity.Photo2 = await SavePhoto(model.Photo2);

            if (model.Photo3 != null)
                entity.Photo3 = await SavePhoto(model.Photo3);
            if (model.Photo4 != null)
                entity.Photo4 = await SavePhoto(model.Photo4);
            if (model.Photo5 != null)
                entity.Photo5 = await SavePhoto(model.Photo5);
            if (model.Photo6 != null)
                entity.Photo6 = await SavePhoto(model.Photo6);
            if (model.Photo7 != null)
                entity.Photo7 = await SavePhoto(model.Photo7);
            if (model.Photo8 != null)
                entity.Photo8 = await SavePhoto(model.Photo8);
            if (model.Photo9 != null)
                entity.Photo9 = await SavePhoto(model.Photo9);
            if (model.Photo10 != null)
                entity.Photo10 = await SavePhoto(model.Photo10);

            entity.Remark1 = model.Remark1;
            entity.Remark2 = model.Remark2;
            entity.Remark3 = model.Remark3;
            entity.Remark4 = model.Remark4;
            entity.Remark5 = model.Remark5;
            entity.Remark6 = model.Remark6;
            entity.Remark7 = model.Remark7;
            entity.Remark8 = model.Remark8;
            entity.Remark9 = model.Remark9;
            entity.Remark10 = model.Remark10;


            await _context.SaveChangesAsync();

            return MapToQuery(entity);
        }

        // =========================
        // FILTER BY ORGANIZATION NAME
        // =========================
        public async Task<List<MonthlyinfrastructureQueryModel>> GetByOrganizationName(string organizationName)
        {
            return await _context.Monthlyinfrastructures
                .Include(m => m.SnoNavigation)
                .Where(m => m.OrganizationName == organizationName)
                .Select(m => MapToQuery(m))
                .ToListAsync();
        }

        // =========================
        // FILTER BY MONTH & YEAR
        // =========================
        public async Task<List<MonthlyinfrastructureQueryModel>> GetByMonthYear(string? month = null, string? year = null)
        {
            var query = _context.Monthlyinfrastructures
                .Include(m => m.SnoNavigation)
                .AsQueryable();

            if (!string.IsNullOrEmpty(month))
                query = query.Where(m => m.Month == month);

            if (!string.IsNullOrEmpty(year))
                query = query.Where(m => m.Year == year);

            return await query
                .Select(m => MapToQuery(m))
                .ToListAsync();
        }

        // =========================
        // TOTAL BY ORGANIZATION TYPE
        // =========================
        public async Task<List<MonthlyinfrastructureSummaryQueryModel>> GetTotalByOrganizationType(string? month = null, string? year = null)
        {
            var query = _context.Monthlyinfrastructures
                .Include(m => m.SnoNavigation)
                .AsQueryable();

            if (!string.IsNullOrEmpty(month))
                query = query.Where(m => m.Month == month);

            if (!string.IsNullOrEmpty(year))
                query = query.Where(m => m.Year == year);

            return await query
                .GroupBy(m => m.SnoNavigation!.OrganizationType)
                .Select(g => new MonthlyinfrastructureSummaryQueryModel
                {
                    OrganizationType = g.Key,
                    TotalAmount = g.Sum(x => x.Total ?? 0)
                })
                .ToListAsync();
        }


        // =========================
        // MAP METHOD
        // =========================
        private static MonthlyinfrastructureQueryModel MapToQuery(Monthlyinfrastructure m)
        {
            return new MonthlyinfrastructureQueryModel
            {
                Misno = m.Misno,
                Sno = m.Sno,
                OrganizationType = m.SnoNavigation?.OrganizationType,
                OrganizationName = m.OrganizationName,
                Block = m.Block,
                Month = m.Month,
                Year = m.Year,
                Total = m.Total,
                Remark = m.Remark,

                Photo1 = m.Photo1,
                Photo2 = m.Photo2,
                Photo3 = m.Photo3,
                Photo4 = m.Photo4,
                Photo5 = m.Photo5,
                Photo6 = m.Photo6,
                Photo7 = m.Photo7,
                Photo8 = m.Photo8,
                Photo9 = m.Photo9,
                Photo10 = m.Photo10,

                Remark1 = m.Remark1,
                Remark2 = m.Remark2,
                Remark3 = m.Remark3,
                Remark4 = m.Remark4,
                Remark5 = m.Remark5,
                Remark6 = m.Remark6,
                Remark7 = m.Remark7,
                Remark8 = m.Remark8,
                Remark9 = m.Remark9,
                Remark10 = m.Remark10
            };
        }
    }
}