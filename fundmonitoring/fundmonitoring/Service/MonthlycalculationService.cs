using fundmonitoring.Interface;
using fundmonitoring.Models;
using fundmonitoring.CommandModel;
using fundmonitoring.QueryModel;
using Microsoft.EntityFrameworkCore;

namespace fundmonitoring.Services
{
    public class MonthlyCalculationService : IMonthlyCalculation
    {
        private readonly FundmonitoringnewContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IHeadcountDetector _headcount; // ← ADDED

        public MonthlyCalculationService(FundmonitoringnewContext context, IWebHostEnvironment env, IHeadcountDetector headcount)
        {
            _context = context;
            _env = env;
            _headcount = headcount;
        }

        // =========================
        // SAVE PHOTO METHOD
        // =========================
        private async Task<string?> SavePhoto(IFormFile? file)
        {
            if (file == null) return null;

            // Use WebRootPath if available, otherwise fallback to current directory + wwwroot
            var webRoot = _env.WebRootPath;
            if (string.IsNullOrEmpty(webRoot))
            {
                webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            var uploadPath = Path.Combine(webRoot, "uploads");

            // Create folder if it doesn't exist
            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            // Create unique file name
            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadPath, fileName);

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return relative URL to use in frontend
            return "/uploads/" + fileName;
        }


        // =========================
        // ADD
        // =========================
        public async Task<MonthlycalculationQueryModel> Add(MonthlycalculationCommandModel model)
        {
            try
            {
                var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.OrganizationType == model.OrganizationType);
                if (organization == null)
                    throw new ApplicationException($"Organization type '{model.OrganizationType}' not found.");


                int nextMonSno = _context.Monthlycalculations.Any()
                ? _context.Monthlycalculations.Max(h => h.MonSno) + 1
            :   1;

                // ✅ HEADCOUNT DETECTION
                int? hc1 = model.Photo1 != null ? await _headcount.DetectAsync(model.Photo1) : null;
                int? hc2 = model.Photo2 != null ? await _headcount.DetectAsync(model.Photo2) : null;
                int? hc3 = model.Photo3 != null ? await _headcount.DetectAsync(model.Photo3) : null;
                int? hc4 = model.Photo4 != null ? await _headcount.DetectAsync(model.Photo4) : null;
                int? hc5 = model.Photo5 != null ? await _headcount.DetectAsync(model.Photo5) : null;
                int? hc6 = model.Photo6 != null ? await _headcount.DetectAsync(model.Photo6) : null;
                int? hc7 = model.Photo7 != null ? await _headcount.DetectAsync(model.Photo7) : null;
                int? hc8 = model.Photo8 != null ? await _headcount.DetectAsync(model.Photo8) : null;
                int? hc9 = model.Photo9 != null ? await _headcount.DetectAsync(model.Photo9) : null;
                int? hc10 = model.Photo10 != null ? await _headcount.DetectAsync(model.Photo10) : null;


                var entity = new Monthlycalculation
                {
                    MonSno= nextMonSno,
                    Sno = organization.Sno,
                    OrganizationName = model.OrganizationName,
                    Block = model.Block,
                    AdmittedSeat = model.AdmittedSeat,
                    Month = model.Month,
                    Year = model.Year,
                    Amount = model.Amount,
                    Total = (model.AdmittedSeat ?? 0) * (model.Amount ?? 0),
                    Remark = model.Remark,

                    Photo1 = await SavePhoto(model.Photo1),
                    Photo2 = await SavePhoto(model.Photo2),
                    Photo3 = await SavePhoto(model.Photo3),
                    Photo4 = await SavePhoto(model.Photo4),
                    Photo5  = await SavePhoto(model.Photo5),
                    Photo6 = await SavePhoto(model.Photo6),
                    Photo7 = await SavePhoto(model.Photo7),
                    Photo8  = await SavePhoto(model.Photo8),
                    Photo9  = await SavePhoto(model.Photo9),
                    Photo10 = await SavePhoto(model.Photo10),

                    // ✅ HeadCounts
                    HeadCount1 = hc1,
                    HeadCount2 = hc2,
                    HeadCount3 = hc3,
                    HeadCount4 = hc4,
                    HeadCount5 = hc5,
                    HeadCount6 = hc6,
                    HeadCount7 = hc7,
                    HeadCount8 = hc8,
                    HeadCount9 = hc9,
                    HeadCount10 = hc10,

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

                _context.Monthlycalculations.Add(entity);
                await _context.SaveChangesAsync();

                return MapToQuery(entity);
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error while adding monthly calculation", ex);
            }
        }

        // =========================
        // DELETE
        // =========================
        public async Task<bool> Delete(int monSno)
        {
            var entity = await _context.Monthlycalculations.FindAsync(monSno);
            if (entity == null) return false;

            _context.Monthlycalculations.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // GET ALL
        // =========================
        public async Task<List<MonthlycalculationQueryModel>> GetAll()
        {
            return await _context.Monthlycalculations
                .Include(m => m.SnoNavigation)
                .Select(m => MapToQuery(m)) // now static → EF Core safe
                .ToListAsync();
        }

        // =========================
        // GET BY ID
        // =========================
        public async Task<MonthlycalculationQueryModel?> GetById(int monSno)
        {
            var entity = await _context.Monthlycalculations.FindAsync(monSno);
            if (entity == null) return null;

            return MapToQuery(entity);
        }

        // =========================
        // UPDATE
        // =========================
        public async Task<MonthlycalculationQueryModel?> Update(MonthlycalculationCommandModel model)
        {

            try
            {
                var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.OrganizationType == model.OrganizationType);
                if (organization == null)
                    throw new ApplicationException($"Organization type '{model.OrganizationType}' not found.");
                var entity = await _context.Monthlycalculations.FindAsync(model.MonSno);
                if (entity == null) return null;

                entity.Sno = organization.Sno;
                
                entity.OrganizationName = model.OrganizationName;
                entity.Block = model.Block;
                entity.AdmittedSeat = model.AdmittedSeat;
                entity.Month = model.Month;
                entity.Year = model.Year;
                entity.Amount = model.Amount;
                entity.Total = (model.AdmittedSeat ?? 0) * (model.Amount ?? 0);
                entity.Remark = model.Remark;

                // ✅ PHOTO + HEADCOUNT LOGIC

                if (model.Photo1 != null)
                {
                    entity.Photo1 = await SavePhoto(model.Photo1);
                    entity.HeadCount1 = await _headcount.DetectAsync(model.Photo1);
                }

                if (model.Photo2 != null)
                {
                    entity.Photo2 = await SavePhoto(model.Photo2);
                    entity.HeadCount2 = await _headcount.DetectAsync(model.Photo2);
                }

                if (model.Photo3 != null)
                {
                    entity.Photo3 = await SavePhoto(model.Photo3);
                    entity.HeadCount3 = await _headcount.DetectAsync(model.Photo3);
                }

                if (model.Photo4 != null)
                {
                    entity.Photo4 = await SavePhoto(model.Photo4);
                    entity.HeadCount4 = await _headcount.DetectAsync(model.Photo4);
                }

                if (model.Photo5 != null)
                {
                    entity.Photo5 = await SavePhoto(model.Photo5);
                    entity.HeadCount5 = await _headcount.DetectAsync(model.Photo5);
                }

                if (model.Photo6 != null)
                {
                    entity.Photo6 = await SavePhoto(model.Photo6);
                    entity.HeadCount6 = await _headcount.DetectAsync(model.Photo6);
                }

                if (model.Photo7 != null)
                {
                    entity.Photo7 = await SavePhoto(model.Photo7);
                    entity.HeadCount7 = await _headcount.DetectAsync(model.Photo7);
                }

                if (model.Photo8 != null)
                {
                    entity.Photo8 = await SavePhoto(model.Photo8);
                    entity.HeadCount8 = await _headcount.DetectAsync(model.Photo8);
                }

                if (model.Photo9 != null)
                {
                    entity.Photo9 = await SavePhoto(model.Photo9);
                    entity.HeadCount9 = await _headcount.DetectAsync(model.Photo9);
                }

                if (model.Photo10 != null)
                {
                    entity.Photo10 = await SavePhoto(model.Photo10);
                    entity.HeadCount10 = await _headcount.DetectAsync(model.Photo10);
                }

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
            catch (Exception ex)
            {
                throw new ApplicationException("Error while updating monthly calculation", ex);
            }
        }

        // =========================
        // MAP METHOD
        // =========================
        private static MonthlycalculationQueryModel MapToQuery(Monthlycalculation m)
        {
            return new MonthlycalculationQueryModel
            {
                MonSno = m.MonSno,
                Sno = m.Sno,
                OrganizationType = m.SnoNavigation?.OrganizationType, // 
                OrganizationName = m.OrganizationName,
                Block = m.Block,
                AdmittedSeat = m.AdmittedSeat,
                Month = m.Month,
                Year = m.Year,
                Amount = m.Amount,
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
                Remark10 = m.Remark10,
                HeadCount1 = m.HeadCount1,
                HeadCount2 = m.HeadCount2,
                HeadCount3 = m.HeadCount3,
                HeadCount4 = m.HeadCount4,
                HeadCount5 = m.HeadCount5,
                HeadCount6 = m.HeadCount6,
                HeadCount7 = m.HeadCount7,
                HeadCount8 = m.HeadCount8,
                HeadCount9 = m.HeadCount9,
                HeadCount10 = m.HeadCount10,


            };
        }

        public async Task<List<MonthlyCalculationSummaryQueryModel>> GetTotalByOrganizationType()
        {
            return await _context.Monthlycalculations
                .Include(m => m.SnoNavigation)
                .GroupBy(m => m.SnoNavigation!.OrganizationType)
                .Select(g => new MonthlyCalculationSummaryQueryModel
                {
                    OrganizationType = g.Key,
                    TotalAmount = g.Sum(x => x.Total ?? 0) // null-safe
                })
                .ToListAsync();
        }

        public async Task<List<MonthlyCalculationSummaryQueryModel>> GetTotalByOrganizationType(
            string? month = null,
            string? year = null,
            int? sno = null)
        {
            // Get base query including organization navigation
            var query = _context.Monthlycalculations
                .Include(m => m.SnoNavigation)
                .AsQueryable();

            // Apply filters if provided
            if (!string.IsNullOrEmpty(month))
                query = query.Where(m => m.Month == month);

            if (!string.IsNullOrEmpty(year))
                query = query.Where(m => m.Year == year);

            if (sno.HasValue)
                query = query.Where(m => m.Sno == sno.Value);

            // Group by organization type and sum total
            var result = await query
                .GroupBy(m => m.SnoNavigation!.OrganizationType)
                .Select(g => new MonthlyCalculationSummaryQueryModel
                {
                    OrganizationType = g.Key,
                    TotalAmount = g.Sum(x => x.Total ?? 0)
                })
                .ToListAsync();

            return result;
        }

        public async Task<List<MonthlyCalculationByOrganizationQueryModel>> GetTotalByOrganizationName()
        {
            var result = await _context.Monthlycalculations
                .Include(m => m.SnoNavigation) // fetch organization details
                .GroupBy(m => m.OrganizationName) // group by organization name
                .Select(g => new MonthlyCalculationByOrganizationQueryModel
                {
                    OrganizationName = g.Key,
                    TotalAmount = g.Sum(x => x.Total ?? 0) // sum safely
                })
                .ToListAsync();

            return result;
        }

        public async Task<List<MonthlyCalculationByOrganizationQueryModel>> GetTotalByOrganizationName(
        string? month = null,
        string? year = null,
        int? sno = null)
        {
            // Base query including organization navigation
            var query = _context.Monthlycalculations
                .Include(m => m.SnoNavigation)
                .AsQueryable();

            // Apply optional filters
            if (!string.IsNullOrEmpty(month))
                query = query.Where(m => m.Month == month);

            if (!string.IsNullOrEmpty(year))
                query = query.Where(m => m.Year == year);

            if (sno.HasValue)
                query = query.Where(m => m.Sno == sno.Value);

            // Group by Organization Name and sum Total
            var result = await query
                .GroupBy(m => m.OrganizationName)
                .Select(g => new MonthlyCalculationByOrganizationQueryModel
                {
                    OrganizationName = g.Key,
                    TotalAmount = g.Sum(x => x.Total ?? 0)
                })
                .ToListAsync();

            return result;
        }

        public async Task<List<OrganizationResultModel>> GetOrganizationsByTypeAsync(string orgType)
        {
            if (string.IsNullOrEmpty(orgType))
                return new List<OrganizationResultModel>();

            var result = await _context.Monthlycalculations
                .Include(m => m.SnoNavigation) // assuming navigation property to Organization
                .Where(m => m.SnoNavigation.OrganizationType == orgType)
                .GroupBy(m => new { m.Sno, m.OrganizationName})
                .Select(g => new OrganizationResultModel
                {
                    OrganizationId = g.Key.Sno,
                    OrganizationName = g.Key.OrganizationName,
                    Total = g.Sum(x => x.Total ?? 0)
                })
                .ToListAsync();

            return result;
        }
        public async Task<List<MonthlycalculationQueryModel>> GetAllByOrganizationNameAsync(string organizationName)
        {
            if (string.IsNullOrEmpty(organizationName))
                return new List<MonthlycalculationQueryModel>();

            var result = await _context.Monthlycalculations
                .Include(m => m.SnoNavigation) // Assuming navigation property to Organization
                .Where(m => m.OrganizationName == organizationName)
                .Select(m => new MonthlycalculationQueryModel
                {
                    OrganizationType = m.SnoNavigation.OrganizationType,
                    OrganizationName = m.OrganizationName,
                    Block = m.Block,
                    AdmittedSeat = m.AdmittedSeat,
                    Month = m.Month,
                    Year = m.Year,
                    Amount = m.Amount,
                    Total = m.Total,
                    Remark = m.Remark,
                    Photo1 = m.Photo1,
                    Photo2 = m.Photo2,
                    Photo3 = m.Photo3,
                    Photo4 = m.Photo4,
                    Photo5 = m.Photo5,
                    Photo6 = m.Photo6,
                    Photo7 = m.Photo7,
                    Photo8= m.Photo8,
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
                    Remark10 = m.Remark10,
                    HeadCount1 = m.HeadCount1,
                    HeadCount2 = m.HeadCount2,
                    HeadCount3 = m.HeadCount3,
                    HeadCount4 = m.HeadCount4,
                    HeadCount5 = m.HeadCount5,
                    HeadCount6 = m.HeadCount6,
                    HeadCount7 = m.HeadCount7,
                    HeadCount8 = m.HeadCount8,
                    HeadCount9 = m.HeadCount9,
                    HeadCount10 = m.HeadCount10,
                })
                .ToListAsync();

            return result;
        }
    }
}
