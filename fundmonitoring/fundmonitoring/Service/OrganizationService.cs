using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using fundmonitoring.Models;
using fundmonitoring.QueryModel;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;

namespace fundmonitoring.Service
{
    public class OrganizationService : IOrganization
    {
        private readonly FundmonitoringnewContext _context;

        public OrganizationService(FundmonitoringnewContext context)
        {
            _context = context;
        }
        public void Add(OrganizationCommandModel model)
        {
            // Check if OrganizationType already exists
            if (_context.Organizations.Any(x => x.OrganizationType == model.OrganizationType))
                throw new Exception($"Organization '{model.OrganizationType}' already exists.");

            int nextSno = _context.Organizations.Any()
            ? _context.Organizations.Max(x => x.Sno) + 1
            : 1;
            var org = new Organization
            {
                Sno = nextSno,
                OrganizationType = model.OrganizationType,
                Remark = model.Remark
            };

            _context.Organizations.Add(org);
            _context.SaveChanges();
        }

        public void Update(OrganizationCommandModel model)
        {
            var org = _context.Organizations.FirstOrDefault(x => x.Sno == model.Sno);
            if (org == null)
                throw new Exception($"Organization with Sno {model.Sno} not found.");

            // Prevent duplicate OrganizationType for other records
            if (_context.Organizations.Any(x => x.OrganizationType == model.OrganizationType && x.Sno != model.Sno))
                throw new Exception($"Organization '{model.OrganizationType}' already exists.");

            org.OrganizationType = model.OrganizationType;
            org.Remark = model.Remark;

            _context.SaveChanges();
        }

        public void Delete(int sno)
        {
            var org = _context.Organizations.FirstOrDefault(x => x.Sno == sno);
            if (org == null) return;

            _context.Organizations.Remove(org);
            _context.SaveChanges();
        }

        public List<OrganizationQueryModel> GetAll()
        {
            return _context.Organizations
                .Select(x => new OrganizationQueryModel
                {
                    Sno = x.Sno,
                    OrganizationType = x.OrganizationType,
                    Remark = x.Remark
                }).ToList();
        }

        public void ImportFromExcel(IFormFile file)
        {
            // Get existing organization types and max SNo from DB
            var existingTypes = _context.Organizations
                .Select(x => x.OrganizationType)
                .ToHashSet(StringComparer.OrdinalIgnoreCase); // Case-insensitive check

            int nextSno = _context.Organizations.Any()
            ? _context.Organizations.Max(x => x.Sno) + 1
            : 1;

            var organizations = new List<Organization>();

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var stream = new MemoryStream())
            {
                file.CopyTo(stream);

                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    var rowCount = worksheet.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++) // Skip header
                    {
                        var organizationType = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                        var remark = worksheet.Cells[row, 2].Value?.ToString()?.Trim();

                        if (string.IsNullOrWhiteSpace(organizationType))
                            continue;

                        // Skip duplicates
                        if (existingTypes.Contains(organizationType))
                            continue;

                        nextSno++; // Assign next SNo

                        organizations.Add(new Organization
                        {
                            Sno = nextSno, // Important if SQL is not AUTO_INCREMENT
                            OrganizationType = organizationType,
                            Remark = remark
                        });

                        existingTypes.Add(organizationType); // Prevent duplicates in same file
                    }
                }
            }

            if (organizations.Any())
            {
                _context.Organizations.AddRange(organizations);
                _context.SaveChanges();
            }
        }
        // not in use below now 
        public async Task<List<string>> GetOrganizationTypesWithMonthAsync()
        {
            // Case-insensitive search for "month" in Remark
            return await _context.Organizations
                .Where(o => o.Remark != null && EF.Functions.Like(o.Remark.ToLower(), "%month%"))
                .Select(o => o.OrganizationType)
                .ToListAsync();
        }

        public async Task<List<string>> GetOrganizationTypesWithYearAsync() // NEW
        {
            return await _context.Organizations
                .Where(o => o.Remark != null && EF.Functions.Like(o.Remark.ToLower(), "%year%"))
                .Select(o => o.OrganizationType)
                .ToListAsync();
        }

       
    }
}