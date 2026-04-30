using fundmonitoring.CommandModel;
using fundmonitoring.Interface;
using fundmonitoring.Models;
using fundmonitoring.QueryModel;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;

namespace fundmonitoring.Services
{
    public class StudentInformationService : IStudentInformation
    {
        private readonly FundmonitoringnewContext _context;
        private readonly IWebHostEnvironment _env;

        public StudentInformationService(FundmonitoringnewContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // =========================
        // SAVE PHOTO METHOD
        // =========================
        private async Task<string?> SavePhoto(IFormFile? file)
        {
            if (file == null) return null;

            var webRoot = _env.WebRootPath;

            if (string.IsNullOrEmpty(webRoot))
            {
                webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

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
        public async Task<StudentinformationQueryModel> Add(StudentinformationCommandModel model)
        {
            try
            {
                // Optional: fetch organization using Sno
                if (model.Sno != null)
                {
                    var exists = await _context.Organizations
                        .AnyAsync(o => o.Sno == model.Sno);

                    if (!exists)
                        throw new ApplicationException("Invalid Sno (Organization not found)");
                }

                using var transaction = await _context.Database.BeginTransactionAsync();

                int nextInfoSno = await _context.Studentinformations
                    .Select(x => (int?)x.Sissno)
                    .MaxAsync() ?? 0;

                nextInfoSno++;


                var entity = new Studentinformation
                {
                    Sissno = nextInfoSno,
                    Sno = model.Sno,
                    OrganizationName = model.OrganizationName,
                    Block = model.Block,
                    StudentName = model.StudentName,
                    Dob = model.Dob,

                    // 🔥 PHOTO SAVE HERE
                    Photo = await SavePhoto(model.PhotoFile),

                    Remark = model.Remark
                };

                _context.Studentinformations.Add(entity);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return MapToQuery(entity);
            }
            catch (Exception ex)
            {   

                throw new ApplicationException("Error while adding student information", ex);
            }
        }

        // =========================
        // MAP TO QUERY
        // =========================
        private StudentinformationQueryModel MapToQuery(Studentinformation entity)
        {
            return new StudentinformationQueryModel
            {
                Sissno = entity.Sissno,
                Sno = entity.Sno,
                OrganizationType = entity.SnoNavigation?.OrganizationType,
                OrganizationName = entity.OrganizationName,
                Block = entity.Block,
                StudentName = entity.StudentName,
                Dob = entity.Dob,
                Photo = entity.Photo,
                Remark = entity.Remark
            };
        }

        public async Task<StudentinformationQueryModel?> Update(int id, StudentinformationCommandModel model)
        {
            try
            {
                var entity = await _context.Studentinformations
                    .Include(x => x.SnoNavigation)
                    .FirstOrDefaultAsync(x => x.Sissno == id);

                if (entity == null)
                    return null;

                // 🔥 Optional: check Sno exists
                if (model.Sno != null)
                {
                    var exists = await _context.Organizations
                        .AnyAsync(o => o.Sno == model.Sno);

                    if (!exists)
                        throw new ApplicationException("Invalid Sno (Organization not found)");
                }

                // 🔥 Duplicate check (exclude current record)
                                bool duplicate = await _context.Studentinformations.AnyAsync(x =>
                     x.Sissno != id &&
                     x.StudentName != null &&
                     x.StudentName.ToLower() == model.StudentName.ToLower() &&
                     x.Sno == model.Sno
                 );

                if (duplicate)
                    throw new ApplicationException("Duplicate entry found");

                // =========================
                // UPDATE FIELDS
                // =========================
                entity.Sno = model.Sno;
                entity.OrganizationName = model.OrganizationName;
                entity.Block = model.Block;
                entity.StudentName = model.StudentName;
                entity.Dob = model.Dob;
                entity.Remark = model.Remark;

                // =========================
                // PHOTO UPDATE (optional)
                // =========================
                if (model.PhotoFile != null)
                {
                    entity.Photo = await SavePhoto(model.PhotoFile);
                }

                await _context.SaveChangesAsync();

                return MapToQuery(entity);
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error while updating student information", ex);
            }
        }
        public async Task<bool> Delete(int id)
        {
            try
            {
                var entity = await _context.Studentinformations
                    .FirstOrDefaultAsync(x => x.Sissno == id);

                if (entity == null)
                    throw new ApplicationException("Student not found");

                // 🔥 delete photo from folder
                DeletePhoto(entity.Photo);

                _context.Studentinformations.Remove(entity);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error while deleting student", ex);
            }
        }
        private void DeletePhoto(string? photoPath)
        {
            if (string.IsNullOrEmpty(photoPath)) return;

            var fullPath = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                                        photoPath.TrimStart('/'));

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
        public async Task<string> ImportStudents(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ApplicationException("File not selected");

            if (!file.FileName.EndsWith(".xlsx"))
                throw new ApplicationException("Only Excel (.xlsx) files allowed");

            try
            {
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);

                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using var package = new ExcelPackage(stream);
                var worksheet = package.Workbook.Worksheets[0];

                if (worksheet == null)
                    throw new ApplicationException("Excel sheet not found");

                int rowCount = worksheet.Dimension.Rows;

                // ✅ Load OrganizationType → Sno mapping
                var orgDict = _context.Organizations
                    .ToDictionary(x => x.OrganizationType.Trim().ToLower(), x => x.Sno);

                // ✅ Generate Sissno once
                int nextSissno = _context.Studentinformations.Any()
                    ? _context.Studentinformations.Max(x => x.Sissno) + 1
                    : 1;

                var studentList = new List<Studentinformation>();
                var errorList = new List<string>();
                int successCount = 0;

                // ✅ Skip header (row 1)
                for (int row = 2; row <= rowCount; row++)
                {
                    try
                    {
                        // Skip empty student rows
                        if (string.IsNullOrWhiteSpace(worksheet.Cells[row, 4].Text))
                            continue;

                        // ✅ Column 1 → OrganizationType
                        var orgType = worksheet.Cells[row, 1].Text?.Trim().ToLower();

                        if (string.IsNullOrWhiteSpace(orgType))
                            throw new Exception("Organization type missing");

                        if (!orgDict.ContainsKey(orgType))
                            throw new Exception($"Organization type '{orgType}' not found");

                        int orgSno = orgDict[orgType];

                        // ✅ Sno (optional numeric)
                        int? sno = int.TryParse(worksheet.Cells[row, 1].Text, out var tempSno)
                            ? tempSno
                            : null;

                        // ✅ Date parsing
                        DateOnly? dob = null;
                        var cellValue = worksheet.Cells[row, 5].Value;

                        if (cellValue != null && DateTime.TryParse(cellValue.ToString(), out var dt))
                            dob = DateOnly.FromDateTime(dt);

                        var student = new Studentinformation
                        {
                            Sissno = nextSissno++,

                            Sno = orgSno, // ✅ FK from OrganizationType

                            OrganizationName = worksheet.Cells[row, 2].Text,
                            Block = worksheet.Cells[row, 3].Text,
                            StudentName = worksheet.Cells[row, 4].Text,
                            Dob = dob,
                            Photo = worksheet.Cells[row, 6].Text,
                            Remark = worksheet.Cells[row, 7].Text
                        };

                        studentList.Add(student);
                        successCount++;
                    }
                    catch (Exception exRow)
                    {
                        errorList.Add($"Row {row}: {exRow.Message}");
                    }
                }

                // ✅ Save valid records
                if (studentList.Count > 0)
                {
                    await _context.Studentinformations.AddRangeAsync(studentList);
                    await _context.SaveChangesAsync();
                }

                // ✅ Final response
                string result = $"✅ Successfully imported: {successCount} students";

                if (errorList.Any())
                {
                    result += $"\n❌ Failed Rows: {errorList.Count}\n";
                    result += string.Join("\n", errorList);
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error while importing data", ex);
            }
        }
        public async Task<StudentinformationQueryModel> GetById(int id)
        {
            try
            {
                var entity = await _context.Studentinformations
                    .Include(x => x.SnoNavigation)   // 🔥 ADD THIS
                    .FirstOrDefaultAsync(x => x.Sissno == id);

                if (entity == null)
                    throw new ApplicationException("Student not found");

                return MapToQuery(entity);
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error while fetching student", ex);
            }
        }
        public async Task<List<StudentinformationQueryModel>> GetAll()
        {
            try
            {
                var list = await _context.Studentinformations
                    .Include(x => x.SnoNavigation)   // 🔥 ADD THIS
                    .OrderByDescending(x => x.Sissno)
                    .ToListAsync();

                return list.Select(x => MapToQuery(x)).ToList();
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Error while fetching students", ex);
            }
        }
          
       public List<string?> GetStudentNames(string orgType, string orgName)
        {
            orgType = orgType.Replace("-", "").Replace(" ", "").ToLower();
            orgName = orgName.Replace("-", "").Replace(" ", "").ToLower();

            return _context.Studentinformations
                .Where(x => x.SnoNavigation != null &&
                            x.SnoNavigation.OrganizationType != null &&
                            x.OrganizationName != null &&
                            x.SnoNavigation.OrganizationType.Replace("-", "").Replace(" ", "").ToLower().Contains(orgType) &&
                            x.OrganizationName.Replace("-", "").Replace(" ", "").ToLower().Contains(orgName))
                .Select(x => x.StudentName)
                .ToList();
        }
        public StudentBasicInfo? GetStudentDetails(string orgType, string orgName, string studentName)
        {
            return _context.Studentinformations
                .Where(x => x.SnoNavigation != null &&
                            x.SnoNavigation.OrganizationType == orgType &&
                            x.OrganizationName == orgName &&
                            x.StudentName == studentName)
                .Select(x => new StudentBasicInfo
                {
                    Block = x.Block,
                    Dob = x.Dob
                })
                .FirstOrDefault();
        }
        public async Task<StudentIdResponse?> GetStudentByName(string orgType, string orgName, string studentName)
        {
            return await _context.Studentinformations
                .Where(x => x.SnoNavigation != null &&
                            x.SnoNavigation.OrganizationType != null &&
                            x.OrganizationName != null &&
                            x.StudentName != null &&
                            x.SnoNavigation.OrganizationType.ToLower().Contains(orgType.ToLower()) &&
                            x.OrganizationName.ToLower().Contains(orgName.ToLower()) &&
                            x.StudentName.ToLower().Contains(studentName.ToLower()))
                .Select(x => new StudentIdResponse
                {
                    Sissno = x.Sissno
                })
                .FirstOrDefaultAsync();
        }

        public async Task<int> GetStudentCount()
        {
            return await _context.Studentinformations.CountAsync();
        }
    }
}