using fundmonitoring.Interface;
using fundmonitoring.Models;
using fundmonitoring.CommandModel;
using fundmonitoring.QueryModel;
using Microsoft.EntityFrameworkCore;

namespace fundmonitoring.Services
{
    public class YearlyCalculationService : IYearlyCalculation
    {
        private readonly FundmonitoringnewContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IHeadcountDetector _headcount; // ← ADDED

        public YearlyCalculationService(FundmonitoringnewContext context, IWebHostEnvironment env , IHeadcountDetector headcount)
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
        public async Task<YearlycalculationQueryModel> Add(YearlycalculationCommandModel model)
        {
            try
            {
                var organization = await _context.Organizations
              .FirstOrDefaultAsync(o => o.OrganizationType == model.OrganizationType);
                if (organization == null)
                    throw new ApplicationException($"Organization type '{model.OrganizationType}' not found.");
                int nextYearSno = _context.Yearlycalculations.Any()
                    ? _context.Yearlycalculations.Max(h => h.YearSno) + 1
                    : 1;

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

                var entity = new Yearlycalculation
                {
                    YearSno = nextYearSno,
                    Sno = organization.Sno,
                    OrganizationName = model.OrganizationName,
                    Block = model.Block,
                    //AdmittedSeat = model.AdmittedSeat,
                    Year = model.Year,
                    //Amount = model.Amount,
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
                    Remark10 = model.Remark10,
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
                };

                _context.Yearlycalculations.Add(entity);
                await _context.SaveChangesAsync();

                return MapToQuery(entity);
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error while adding yearly calculation", ex);
            }
        }

        // =========================
        // DELETE
        // =========================
        public async Task<bool> Delete(int yearSno)
        {
            var entity = await _context.Yearlycalculations.FindAsync(yearSno);
            if (entity == null) return false;

            _context.Yearlycalculations.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // GET ALL
        // =========================
        public async Task<List<YearlycalculationQueryModel>> GetAll()
        {
            return await _context.Yearlycalculations
                .Include(m => m.SnoNavigation)
                .Select(m => MapToQuery(m))
                .ToListAsync();
        }

        // =========================
        // GET BY ID
        // =========================
        public async Task<YearlycalculationQueryModel?> GetById(int yearSno)
        {
            var entity = await _context.Yearlycalculations.FindAsync(yearSno);
            return entity == null ? null : MapToQuery(entity);
        }

        // =========================
        // UPDATE
        // =========================
        public async Task<YearlycalculationQueryModel?> Update(YearlycalculationCommandModel model)
        {
            var organization = await _context.Organizations
                    .FirstOrDefaultAsync(o => o.OrganizationType == model.OrganizationType);
            if (organization == null)
                throw new ApplicationException($"Organization type '{model.OrganizationType}' not found.");
            var entity = await _context.Yearlycalculations.FindAsync(model.YearSno);
            if (entity == null) return null;

            entity.Sno = organization.Sno;
            entity.OrganizationName = model.OrganizationName;
            entity.Block = model.Block;
            //entity.AdmittedSeat = model.AdmittedSeat;
            entity.Year = model.Year;
            //entity.Amount = model.Amount;
            entity.Total = model.Total;
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

        // =========================
        // MAP METHOD
        // =========================
        private static YearlycalculationQueryModel MapToQuery(Yearlycalculation y)
        {
            return new YearlycalculationQueryModel
            {
                YearSno = y.YearSno,
                Sno = y.Sno,
                OrganizationType = y.SnoNavigation?.OrganizationType,
                OrganizationName = y.OrganizationName,
                Block = y.Block,
                //AdmittedSeat = y.AdmittedSeat,
                Year = y.Year,
                //Amount = y.Amount,
                Total = y.Total,
                Remark = y.Remark,
                Photo1 = y.Photo1,
                Photo2 = y.Photo2,
                Photo3 = y.Photo3,
                Photo4 = y.Photo4,
                Photo5 = y.Photo5,
                Photo6 = y.Photo6,
                Photo7  = y.Photo7,
                Photo8 = y.Photo8,
                Photo9 = y.Photo9,
                Photo10 = y.Photo10,
                Remark1 = y.Remark1,
                Remark2 = y.Remark2,
                Remark3 = y.Remark3,
                Remark4 = y.Remark4,
                Remark5 = y.Remark5,
                Remark6 = y.Remark6,
                Remark7 = y.Remark7,
                Remark8 = y.Remark8,
                Remark9 = y.Remark9,
                Remark10 = y.Remark10,
                HeadCount1 = y.HeadCount1,
                HeadCount2 = y.HeadCount2,
                HeadCount3 = y.HeadCount3,
                HeadCount4 = y.HeadCount4,
                HeadCount5 = y.HeadCount5,
                HeadCount6 = y.HeadCount6,
                HeadCount7 = y.HeadCount7,
                HeadCount8 = y.HeadCount8,
                HeadCount9 = y.HeadCount9,
                HeadCount10 = y.HeadCount10,
            };
        }

        // =========================
        // TOTAL BY ORGANIZATION TYPE
        // =========================
        public async Task<List<YearlyCalculationSummaryQueryModel>> GetTotalByOrganizationTypeYear()
        {
            return await _context.Yearlycalculations
                .Include(m => m.SnoNavigation)
                .GroupBy(m => m.SnoNavigation!.OrganizationType)
                .Select(g => new YearlyCalculationSummaryQueryModel
                {
                    OrganizationType = g.Key,
                    TotalAmount = g.Sum(x => x.Total ?? 0)
                })
                .ToListAsync();
        }

        public async Task<List<YearlyCalculationSummaryQueryModel>> GetTotalByOrganizationTypeY(string? year = null, int? sno = null)
        {
            var query = _context.Yearlycalculations
                .Include(m => m.SnoNavigation)
                .AsQueryable();

            if (!string.IsNullOrEmpty(year))
                query = query.Where(m => m.Year == year);

            if (sno.HasValue)
                query = query.Where(m => m.Sno == sno.Value);

            return await query
                .GroupBy(m => m.SnoNavigation!.OrganizationType)
                .Select(g => new YearlyCalculationSummaryQueryModel
                {
                    OrganizationType = g.Key,
                    TotalAmount = g.Sum(x => x.Total ?? 0)
                })
                .ToListAsync();
        }

        // =========================
        // TOTAL BY ORGANIZATION NAME
        // =========================
        public async Task<List<YearlyCalculationByOrganizationQueryModel>> GetTotalByOrganizationNameYear()
        {
            return await _context.Yearlycalculations
                .Include(m => m.SnoNavigation)
                .GroupBy(m => m.OrganizationName)
                .Select(g => new YearlyCalculationByOrganizationQueryModel
                {
                    OrganizationName = g.Key,
                    TotalAmount = g.Sum(x => x.Total ?? 0)
                })
                .ToListAsync();
        }

        public async Task<List<YearlyCalculationByOrganizationQueryModel>> GetTotalByOrganizationNameY(string? year = null, int? sno = null)
        {
            var query = _context.Yearlycalculations
                .Include(m => m.SnoNavigation)
                .AsQueryable();

            if (!string.IsNullOrEmpty(year))
                query = query.Where(m => m.Year == year);

            if (sno.HasValue)
                query = query.Where(m => m.Sno == sno.Value);

            return await query
                .GroupBy(m => m.OrganizationName)
                .Select(g => new YearlyCalculationByOrganizationQueryModel
                {
                    OrganizationName = g.Key,
                    TotalAmount = g.Sum(x => x.Total ?? 0)
                })
                .ToListAsync();
        }
        public async Task<List<OrganizationResultModelY>> GetOrganizationsByTypeAsync(string orgType)
        {
            if (string.IsNullOrEmpty(orgType))
                return new List<OrganizationResultModelY>();

            var result = await _context.Yearlycalculations
                .Include(y => y.SnoNavigation) // Ensure navigation property exists
                .Where(y => y.SnoNavigation.OrganizationType == orgType)
                .GroupBy(y => new { y.Sno, y.OrganizationName })
                .Select(g => new OrganizationResultModelY
                {
                    OrganizationId = g.Key.Sno,
                    OrganizationName = g.Key.OrganizationName ?? "",
                    Total = g.Sum(x => x.Total ?? 0)
                })
                .ToListAsync();

            return result;
        }
        public async Task<List<YearlycalculationQueryModel>> GetAllByOrganizationNameAsync(string organizationName)
        {
            if (string.IsNullOrEmpty(organizationName))
                return new List<YearlycalculationQueryModel>();

            var result = await _context.Yearlycalculations
                .Include(y => y.SnoNavigation) // Navigation property to Organization
                .Where(y => y.OrganizationName == organizationName)
                .Select(y => new YearlycalculationQueryModel
                {
                    OrganizationType = y.SnoNavigation.OrganizationType,
                    OrganizationName = y.OrganizationName,
                    Block = y.Block,
                    Year = y.Year,
                    Total = y.Total,
                    Remark = y.Remark,
                    Photo1 = y.Photo1,
                    Photo2 = y.Photo2,
                    Photo3 = y.Photo3,
                    Photo4 = y.Photo4,
                    Photo5 = y.Photo5,
                    Photo6 = y.Photo6,
                    Photo7 = y.Photo7,
                    Photo8 = y.Photo8,
                    Photo9 = y.Photo9,
                    Photo10 = y.Photo10,
                    Remark1 = y.Remark1,
                    Remark2 = y.Remark2,
                    Remark3 = y.Remark3,
                    Remark4 = y.Remark4,
                    Remark5 = y.Remark5,
                    Remark6 = y.Remark6,
                    Remark7 = y.Remark7,
                    Remark8 = y.Remark8,
                    Remark9 = y.Remark9,
                    Remark10 = y.Remark10,
                    HeadCount1 = y.HeadCount1,
                    HeadCount2 = y.HeadCount2,
                    HeadCount3 = y.HeadCount3,
                    HeadCount4 = y.HeadCount4,
                    HeadCount5 = y.HeadCount5,
                    HeadCount6 = y.HeadCount6,
                    HeadCount7 = y.HeadCount7,
                    HeadCount8 = y.HeadCount8,
                    HeadCount9 = y.HeadCount9,
                    HeadCount10 = y.HeadCount10,

                })
                .ToListAsync();

            return result;
        }
    }
}