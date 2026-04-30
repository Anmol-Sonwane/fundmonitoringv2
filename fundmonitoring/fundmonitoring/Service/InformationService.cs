using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using fundmonitoring.Models;
using fundmonitoring.QueryModel;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
namespace fundmonitoring.Service
{
    public class InformationService : IInformation
    {
        private readonly FundmonitoringnewContext _context;

        public InformationService(FundmonitoringnewContext context)
        {
            _context = context;
        }

        public async Task<List<InformationQueryModel>> GetAllAsync()
        {
            return await _context.Information
                .Include(i => i.SnoNavigation)
                .Select(i => new InformationQueryModel
                {
                    InfoSno = i.InfoSno,
                    Sno = i.Sno,
                    OrganizationType = i.SnoNavigation.OrganizationType,
                    OrganizationName = i.OrganizationName,
                    Block = i.Block,
                    HostelSuperintendent = i.HostelSuperintendent,
                    MobileNo = i.MobileNo,
                    TotalSeat = i.TotalSeat,
                    AdmittedSeat = i.AdmittedSeat,
                    Remark = i.Remark,
                    Remark2 = i.Remark2,

                }).ToListAsync();
        }

        public async Task<InformationQueryModel?> GetByIdAsync(int id)
        {
            return await _context.Information
                .Include(i => i.SnoNavigation)
                .Where(i => i.InfoSno == id)
                .Select(i => new InformationQueryModel
                {
                    InfoSno = i.InfoSno,
                    Sno = i.Sno,
                    OrganizationType = i.SnoNavigation.OrganizationType,
                    OrganizationName = i.OrganizationName,
                    Block = i.Block,
                    HostelSuperintendent = i.HostelSuperintendent,
                    MobileNo = i.MobileNo,
                    TotalSeat = i.TotalSeat,
                    AdmittedSeat = i.AdmittedSeat,
                    Remark = i.Remark,
                    Remark2 = i.Remark2,
                }).FirstOrDefaultAsync();
        }

        public async Task<Information?> AddAsync(InformationCommandModel model)
        {
            // Check if an entry with same Sno and OrganizationName already exists
            bool exists = await _context.Information
                .AnyAsync(i => i.Sno == model.Sno
                            && i.OrganizationName.ToLower() == model.OrganizationName.ToLower());

            if (exists)
                return null; // Skip adding duplicates

            // Calculate next InfoSno manually
            int nextInfoSno = _context.Information.Any()
                ? _context.Information.Max(x => x.InfoSno) + 1
                : 1;

            var info = new Information
            {
                InfoSno = nextInfoSno,
                Sno = model.Sno,
                OrganizationName = model.OrganizationName,
                Block = model.Block,
                HostelSuperintendent = model.HostelSuperintendent,
                MobileNo = model.MobileNo,
                TotalSeat = model.TotalSeat,
                AdmittedSeat = model.AdmittedSeat,
                Remark = model.Remark,
                Remark2 = model.Remark2,
            };

            _context.Information.Add(info);
            await _context.SaveChangesAsync();
            return info;
        }


        public async Task<Information?> UpdateAsync(int id, InformationCommandModel model)
        {
            var info = await _context.Information.FindAsync(id);
            if (info == null) return null;

            // Check for duplicates: another record with same Sno + OrganizationName (case-insensitive)
            bool duplicate = await _context.Information
                .AnyAsync(i => i.InfoSno != id // exclude current record
                            && i.Sno == model.Sno
                            && EF.Functions.Like(i.OrganizationName.ToLower(), model.OrganizationName.ToLower()));

            if (duplicate)
                return null; // Cannot update, duplicate exists

            // Update properties
            info.Sno = model.Sno;
            info.OrganizationName = model.OrganizationName;
            info.Block = model.Block;
            info.HostelSuperintendent = model.HostelSuperintendent;
            info.MobileNo = model.MobileNo;
            info.TotalSeat = model.TotalSeat;
            info.AdmittedSeat = model.AdmittedSeat;
            info.Remark = model.Remark;
            info.Remark2 = model.Remark2;

            await _context.SaveChangesAsync();
            return info;
        }



        public async Task<bool> DeleteAsync(int id)
        {
            var info = await _context.Information.FindAsync(id);
            if (info == null) return false;

            _context.Information.Remove(info);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> ImportFromExcelAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return 0;

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            var infosToAdd = new List<Information>();

            // Get existing InfoSno max
            int nextInfoSno = _context.Information.Any()
                ? _context.Information.Max(x => x.InfoSno) + 1
                : 1;

            // Get existing Org types and Sno
            var orgDict = await _context.Organizations
                .ToDictionaryAsync(o => o.OrganizationType, o => o.Sno, StringComparer.OrdinalIgnoreCase);

            // Get existing Information entries to prevent duplicates
            var existingInfoSet = await _context.Information
                .Select(i => new { i.Sno, i.OrganizationName })
                .ToListAsync();

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            using var package = new ExcelPackage(stream);

            var worksheet = package.Workbook.Worksheets[0];
            var rowCount = worksheet.Dimension.Rows;

            for (int row = 2; row <= rowCount; row++)
            {
                var orgType = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                var orgName = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                var block = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                var superintendent = worksheet.Cells[row, 4].Value?.ToString()?.Trim();
                var mobile = worksheet.Cells[row, 5].Value?.ToString()?.Trim();
                var totalSeat = int.TryParse(worksheet.Cells[row, 4].Value?.ToString(), out int ts) ? ts : (int?)null;
                var admittedSeat = int.TryParse(worksheet.Cells[row, 5].Value?.ToString(), out int asd) ? asd : (int?)null;
                var remark = worksheet.Cells[row, 8].Value?.ToString()?.Trim();
                var remark2 = worksheet.Cells[row, 9].Value?.ToString()?.Trim();

                if (string.IsNullOrWhiteSpace(orgType) || string.IsNullOrWhiteSpace(orgName))
                    continue;

                if (!orgDict.TryGetValue(orgType, out int orgSno))
                    continue; // Skip if OrgType does not exist

                // Check for duplicates
                bool duplicate = existingInfoSet.Any(e =>
                    e.Sno == orgSno && e.OrganizationName.Equals(orgName, StringComparison.OrdinalIgnoreCase));

                if (duplicate)
                    continue;

                infosToAdd.Add(new Information
                {
                    InfoSno = nextInfoSno++,
                    Sno = orgSno,
                    OrganizationName = orgName,
                    Block = block,
                    HostelSuperintendent = superintendent,
                    MobileNo = mobile,
                    TotalSeat = totalSeat,
                    AdmittedSeat = admittedSeat,
                    Remark = remark,
                    Remark2 = remark2,

                });

                // Add to existing set to prevent duplicates in same file
                existingInfoSet.Add(new { Sno = orgSno, OrganizationName = orgName });
            }

            if (infosToAdd.Any())
            {
                _context.Information.AddRange(infosToAdd);
                await _context.SaveChangesAsync();
            }

            return infosToAdd.Count;
        }


        public async Task<List<OrganizationDropdownModel>> GetOrganizationDropdownAsync()
        {
            return await _context.Organizations
                .Select(o => new OrganizationDropdownModel
                {
                    Sno = o.Sno,
                    OrganizationType = o.OrganizationType
                }).ToListAsync();
        }
        public async Task<InformationQueryModel?> GetByOrganizationAsync(string organizationName)
        {
            return await _context.Information
                .Where(i => i.OrganizationName.ToLower() == organizationName.ToLower())
                .Select(i => new InformationQueryModel
                {

                    OrganizationName = i.OrganizationName,
                    Block = i.Block,
                    HostelSuperintendent = i.HostelSuperintendent,
                    MobileNo = i.MobileNo,
                    TotalSeat = i.TotalSeat,
                    AdmittedSeat = i.AdmittedSeat,
                    Remark = i.Remark,
                    Remark2 = i.Remark2
                })
                .FirstOrDefaultAsync();
        }
        public List<string> GetOrganizationNamesByType(string organizationType)
        {
            return _context.Information
                .Include(i => i.SnoNavigation)               // JOIN Organization
                .Where(i => i.SnoNavigation.OrganizationType == organizationType)
                .Select(i => i.OrganizationName)
                .Distinct()
                .ToList();
        }
    }
}