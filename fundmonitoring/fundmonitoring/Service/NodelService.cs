using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using fundmonitoring.Models;
using fundmonitoring.QueryModel;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;

namespace fundmonitoring.Services
{
    public class NodelService : INodel
    {
        private readonly FundmonitoringnewContext _context;

        public NodelService(FundmonitoringnewContext context)
        {
            _context = context;
        }

        // =========================
        // ADD
        // =========================
        public async Task<bool> Add(NodelCommandModel model)
        {
            int nextId = _context.Nodels.Any()
            ? _context.Nodels.Max(x => x.IdNodel) + 1
             : 1;
            Nodel data = new Nodel
            { 
                IdNodel=nextId,
                NodelName = model.NodelName,
                HostelName = model.HostelName,
                Block = model.Block,
                TotalSeat = model.TotalSeat
            };

            await _context.Nodels.AddAsync(data);
            await _context.SaveChangesAsync();

            return true;
        }

        // =========================
        // UPDATE
        // =========================
        public async Task<bool> Update(int id, NodelCommandModel model)
        {
            var data = await _context.Nodels
                .FirstOrDefaultAsync(x => x.IdNodel == id);

            if (data == null)
                return false;

            data.NodelName = model.NodelName;
            data.HostelName = model.HostelName;
            data.Block = model.Block;
            data.TotalSeat = model.TotalSeat;

            await _context.SaveChangesAsync();

            return true;
        }

        // =========================
        // DELETE
        // =========================
        public async Task<bool> Delete(int id)
        {
            var data = await _context.Nodels
                .FirstOrDefaultAsync(x => x.IdNodel == id);

            if (data == null)
                return false;

            _context.Nodels.Remove(data);

            await _context.SaveChangesAsync();

            return true;
        }

        // =========================
        // GET ALL
        // =========================
        public async Task<List<NodelQueryModel>> GetAll()
        {
            return await _context.Nodels
                .Select(x => new NodelQueryModel
                {
                    IdNodel = x.IdNodel,
                    NodelName = x.NodelName,
                    HostelName = x.HostelName,
                    Block = x.Block,
                    TotalSeat = x.TotalSeat
                })
                .ToListAsync();
        }

        // =========================
        // GET ALL NODEL NAME
        // =========================
        public async Task<List<string>> GetAllNodelName()
        {
            return await _context.Nodels
                .Where(x => x.NodelName != null)
                .Select(x => x.NodelName!)
                .Distinct()
                .ToListAsync();
        }

        // =========================
        // GET HOSTEL BY NODEL
        // =========================
        public async Task<List<string>> GetHostelNameByNodelName(string nodelName)
        {
            return await _context.Nodels
                .Where(x => x.NodelName != null &&
                            x.NodelName.Trim().ToLower() == nodelName.Trim().ToLower())
                .Select(x => x.HostelName!)
                .ToListAsync();
        }

        // =========================
        // GET BLOCK & TOTAL SEAT
        // =========================
        public async Task<NodelQueryModel?> GetBlockSeatByHostel(string hostelName)
        {
            return await _context.Nodels
                .Where(x => x.HostelName == hostelName)
                .Select(x => new NodelQueryModel
                {
                    IdNodel = x.IdNodel,
                    Block = x.Block,
                    TotalSeat = x.TotalSeat
                })
                .FirstOrDefaultAsync();
        }
        public void ImportFromExcel(IFormFile file)
        {
            // Get existing hostel names to avoid duplicates
            var existingHostels = _context.Nodels
                .Select(x => x.HostelName)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            // Get next IdNodel
            int nextId = _context.Nodels.Any()
                ? _context.Nodels.Max(x => x.IdNodel) + 1
                : 1;

            var nodels = new List<Nodel>();

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
                        var nodelName = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                        var hostelName = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                        var block = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                        var totalSeatText = worksheet.Cells[row, 4].Value?.ToString()?.Trim();

                        int.TryParse(totalSeatText, out int totalSeat);

                        if (string.IsNullOrWhiteSpace(hostelName))
                            continue;

                        // Skip duplicate hostel
                        if (existingHostels.Contains(hostelName))
                            continue;

                        nextId++;

                        nodels.Add(new Nodel
                        {
                            IdNodel = nextId,
                            NodelName = nodelName,
                            HostelName = hostelName,
                            Block = block,
                            TotalSeat = totalSeat
                        });

                        existingHostels.Add(hostelName);
                    }
                }
            }

            _context.Nodels.AddRange(nodels);
            _context.SaveChanges();
        }
        public async Task<int> GetTotalUniqueHostels()
        {
            return await _context.Nodels
                .Select(x => x.HostelName)
                .Distinct()
                .CountAsync();
        }
    }
}