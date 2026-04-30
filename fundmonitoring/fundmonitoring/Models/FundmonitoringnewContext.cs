using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace fundmonitoring.Models;

public partial class FundmonitoringnewContext : DbContext
{
    public FundmonitoringnewContext()
    {
    }

    public FundmonitoringnewContext(DbContextOptions<FundmonitoringnewContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Information> Information { get; set; }

    public virtual DbSet<Login> Logins { get; set; }

    public virtual DbSet<Monthlycalculation> Monthlycalculations { get; set; }

    public virtual DbSet<Monthlyinfrastructure> Monthlyinfrastructures { get; set; }

    public virtual DbSet<Nodel> Nodels { get; set; }

    public virtual DbSet<Nodelentry> Nodelentries { get; set; }

    public virtual DbSet<Organization> Organizations { get; set; }

    public virtual DbSet<Studenthealth> Studenthealths { get; set; }

    public virtual DbSet<Studentinformation> Studentinformations { get; set; }

    public virtual DbSet<Yearlycalculation> Yearlycalculations { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySql("server=localhost;port=3306;database=fundmonitoringnew;user=root;password=Anmol28*", Microsoft.EntityFrameworkCore.ServerVersion.Parse("8.0.43-mysql"));

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Information>(entity =>
        {
            entity.HasKey(e => e.InfoSno).HasName("PRIMARY");

            entity.ToTable("information");

            entity.HasIndex(e => e.Sno, "SNo_idx");

            entity.Property(e => e.InfoSno)
                .ValueGeneratedNever()
                .HasColumnName("InfoSNo");
            entity.Property(e => e.Block).HasMaxLength(45);
            entity.Property(e => e.HostelSuperintendent).HasMaxLength(255);
            entity.Property(e => e.MobileNo).HasMaxLength(255);
            entity.Property(e => e.OrganizationName).HasMaxLength(255);
            entity.Property(e => e.Remark).HasMaxLength(255);
            entity.Property(e => e.Remark2).HasMaxLength(255);
            entity.Property(e => e.Sno).HasColumnName("SNo");

            entity.HasOne(d => d.SnoNavigation).WithMany(p => p.Information)
                .HasForeignKey(d => d.Sno)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("SNo");
        });

        modelBuilder.Entity<Login>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("login");

            entity.Property(e => e.Id)
                .ValueGeneratedNever()
                .HasColumnName("ID");
            entity.Property(e => e.LoginRole).HasMaxLength(45);
            entity.Property(e => e.Password).HasMaxLength(105);
            entity.Property(e => e.Username).HasMaxLength(105);
        });

        modelBuilder.Entity<Monthlycalculation>(entity =>
        {
            entity.HasKey(e => e.MonSno).HasName("PRIMARY");

            entity.ToTable("monthlycalculation");

            entity.HasIndex(e => e.Sno, "SNo_idx");

            entity.Property(e => e.MonSno)
                .ValueGeneratedNever()
                .HasColumnName("MonSNo");
            entity.Property(e => e.AdmittedSeat).HasColumnName("admittedSeat");
            entity.Property(e => e.Amount).HasPrecision(10, 2);
            entity.Property(e => e.Block).HasMaxLength(45);
            entity.Property(e => e.Month).HasMaxLength(45);
            entity.Property(e => e.OrganizationName).HasMaxLength(255);
            entity.Property(e => e.Photo1)
                .HasMaxLength(255)
                .HasColumnName("photo1");
            entity.Property(e => e.Photo10)
                .HasMaxLength(255)
                .HasColumnName("photo10");
            entity.Property(e => e.Photo2)
                .HasMaxLength(255)
                .HasColumnName("photo2");
            entity.Property(e => e.Photo3)
                .HasMaxLength(255)
                .HasColumnName("photo3");
            entity.Property(e => e.Photo4)
                .HasMaxLength(255)
                .HasColumnName("photo4");
            entity.Property(e => e.Photo5)
                .HasMaxLength(255)
                .HasColumnName("photo5");
            entity.Property(e => e.Photo6)
                .HasMaxLength(255)
                .HasColumnName("photo6");
            entity.Property(e => e.Photo7)
                .HasMaxLength(255)
                .HasColumnName("photo7");
            entity.Property(e => e.Photo8)
                .HasMaxLength(255)
                .HasColumnName("photo8");
            entity.Property(e => e.Photo9)
                .HasMaxLength(255)
                .HasColumnName("photo9");
            entity.Property(e => e.Remark).HasMaxLength(255);
            entity.Property(e => e.Remark1).HasMaxLength(255);
            entity.Property(e => e.Remark10).HasMaxLength(255);
            entity.Property(e => e.Remark2).HasMaxLength(255);
            entity.Property(e => e.Remark3).HasMaxLength(255);
            entity.Property(e => e.Remark4).HasMaxLength(255);
            entity.Property(e => e.Remark5).HasMaxLength(255);
            entity.Property(e => e.Remark6).HasMaxLength(255);
            entity.Property(e => e.Remark7).HasMaxLength(255);
            entity.Property(e => e.Remark8).HasMaxLength(255);
            entity.Property(e => e.Remark9).HasMaxLength(255);
            entity.Property(e => e.Sno).HasColumnName("SNo");
            entity.Property(e => e.Total).HasPrecision(10, 2);
            entity.Property(e => e.Year).HasMaxLength(45);

            entity.HasOne(d => d.SnoNavigation).WithMany(p => p.Monthlycalculations)
                .HasForeignKey(d => d.Sno)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_monthlycalculation_organization");
        });

        modelBuilder.Entity<Monthlyinfrastructure>(entity =>
        {
            entity.HasKey(e => e.Misno).HasName("PRIMARY");

            entity.ToTable("monthlyinfrastructure");

            entity.HasIndex(e => e.Sno, "SNo_idx");

            entity.Property(e => e.Misno)
                .ValueGeneratedNever()
                .HasColumnName("MISNo");
            entity.Property(e => e.Block).HasMaxLength(45);
            entity.Property(e => e.Month).HasMaxLength(45);
            entity.Property(e => e.OrganizationName).HasMaxLength(255);
            entity.Property(e => e.Photo1)
                .HasMaxLength(255)
                .HasColumnName("photo1");
            entity.Property(e => e.Photo10)
                .HasMaxLength(255)
                .HasColumnName("photo10");
            entity.Property(e => e.Photo2)
                .HasMaxLength(255)
                .HasColumnName("photo2");
            entity.Property(e => e.Photo3)
                .HasMaxLength(255)
                .HasColumnName("photo3");
            entity.Property(e => e.Photo4)
                .HasMaxLength(255)
                .HasColumnName("photo4");
            entity.Property(e => e.Photo5)
                .HasMaxLength(255)
                .HasColumnName("photo5");
            entity.Property(e => e.Photo6)
                .HasMaxLength(255)
                .HasColumnName("photo6");
            entity.Property(e => e.Photo7)
                .HasMaxLength(255)
                .HasColumnName("photo7");
            entity.Property(e => e.Photo8)
                .HasMaxLength(255)
                .HasColumnName("photo8");
            entity.Property(e => e.Photo9)
                .HasMaxLength(255)
                .HasColumnName("photo9");
            entity.Property(e => e.Remark).HasMaxLength(255);
            entity.Property(e => e.Remark1).HasMaxLength(255);
            entity.Property(e => e.Remark10).HasMaxLength(255);
            entity.Property(e => e.Remark2).HasMaxLength(255);
            entity.Property(e => e.Remark3).HasMaxLength(255);
            entity.Property(e => e.Remark4).HasMaxLength(255);
            entity.Property(e => e.Remark5).HasMaxLength(255);
            entity.Property(e => e.Remark6).HasMaxLength(255);
            entity.Property(e => e.Remark7).HasMaxLength(255);
            entity.Property(e => e.Remark8).HasMaxLength(255);
            entity.Property(e => e.Remark9).HasMaxLength(255);
            entity.Property(e => e.Sno).HasColumnName("SNo");
            entity.Property(e => e.Total).HasPrecision(10, 2);
            entity.Property(e => e.Year).HasMaxLength(45);

            entity.HasOne(d => d.SnoNavigation).WithMany(p => p.Monthlyinfrastructures)
                .HasForeignKey(d => d.Sno)
                .HasConstraintName("fk_monthlyinfra_sno");
        });

        modelBuilder.Entity<Nodel>(entity =>
        {
            entity.HasKey(e => e.IdNodel).HasName("PRIMARY");

            entity.ToTable("nodel", tb => tb.HasComment("\n\n				"));

            entity.Property(e => e.IdNodel).ValueGeneratedNever();
            entity.Property(e => e.Block).HasMaxLength(255);
            entity.Property(e => e.HostelName).HasMaxLength(255);
            entity.Property(e => e.NodelName).HasMaxLength(255);
        });

        modelBuilder.Entity<Nodelentry>(entity =>
        {
            entity.HasKey(e => e.IdNodelEntry).HasName("PRIMARY");

            entity.ToTable("nodelentry");

            entity.HasIndex(e => e.IdNodel, "IdNodel");

            entity.Property(e => e.IdNodelEntry).ValueGeneratedNever();
            entity.Property(e => e.Photo1).HasMaxLength(255);
            entity.Property(e => e.Photo2).HasMaxLength(255);
            entity.Property(e => e.Remark).HasMaxLength(255);
            entity.Property(e => e.Remark1).HasMaxLength(255);
            entity.Property(e => e.Remark2).HasMaxLength(255);

            entity.HasOne(d => d.IdNodelNavigation).WithMany(p => p.Nodelentries)
                .HasForeignKey(d => d.IdNodel)
                .HasConstraintName("nodelentry_ibfk_1");
        });

        modelBuilder.Entity<Organization>(entity =>
        {
            entity.HasKey(e => e.Sno).HasName("PRIMARY");

            entity.ToTable("organization");

            entity.Property(e => e.Sno)
                .ValueGeneratedNever()
                .HasColumnName("SNo");
            entity.Property(e => e.OrganizationType).HasMaxLength(255);
            entity.Property(e => e.Remark).HasMaxLength(255);
        });

        modelBuilder.Entity<Studenthealth>(entity =>
        {
            entity.HasKey(e => e.Shsno).HasName("PRIMARY");

            entity.ToTable("studenthealth");

            entity.HasIndex(e => e.Sissno, "fk_studenthealth_SISSNo");

            entity.Property(e => e.Shsno)
                .ValueGeneratedNever()
                .HasColumnName("SHSNo");
            entity.Property(e => e.Bmi)
                .HasPrecision(5, 2)
                .HasColumnName("BMI");
            entity.Property(e => e.Height).HasPrecision(5, 2);
            entity.Property(e => e.Month).HasMaxLength(45);
            entity.Property(e => e.Remark).HasMaxLength(255);
            entity.Property(e => e.Sissno).HasColumnName("SISSNo");
            entity.Property(e => e.Weight).HasPrecision(5, 2);
            entity.Property(e => e.Year).HasMaxLength(45);

            entity.HasOne(d => d.SissnoNavigation).WithMany(p => p.Studenthealths)
                .HasForeignKey(d => d.Sissno)
                .HasConstraintName("fk_studenthealth_SISSNo");
        });

        modelBuilder.Entity<Studentinformation>(entity =>
        {
            entity.HasKey(e => e.Sissno).HasName("PRIMARY");

            entity.ToTable("studentinformation");

            entity.HasIndex(e => e.Sno, "SNo_idx");

            entity.Property(e => e.Sissno)
                .ValueGeneratedNever()
                .HasColumnName("SISSNo");
            entity.Property(e => e.Block).HasMaxLength(255);
            entity.Property(e => e.Dob).HasColumnName("DOB");
            entity.Property(e => e.OrganizationName).HasMaxLength(255);
            entity.Property(e => e.Photo).HasMaxLength(255);
            entity.Property(e => e.Remark).HasMaxLength(255);
            entity.Property(e => e.Sno).HasColumnName("SNo");
            entity.Property(e => e.StudentName).HasMaxLength(100);

            entity.HasOne(d => d.SnoNavigation).WithMany(p => p.Studentinformations)
                .HasForeignKey(d => d.Sno)
                .HasConstraintName("fk_studentinfo_SNo");
        });

        modelBuilder.Entity<Yearlycalculation>(entity =>
        {
            entity.HasKey(e => e.YearSno).HasName("PRIMARY");

            entity.ToTable("yearlycalculation");

            entity.HasIndex(e => e.Sno, "SNo_idx");

            entity.Property(e => e.YearSno)
                .ValueGeneratedNever()
                .HasColumnName("YearSNo");
            entity.Property(e => e.AdmittedSeat).HasColumnName("admittedSeat");
            entity.Property(e => e.Amount).HasPrecision(10, 2);
            entity.Property(e => e.Block).HasMaxLength(45);
            entity.Property(e => e.OrganizationName).HasMaxLength(255);
            entity.Property(e => e.Photo1)
                .HasMaxLength(255)
                .HasColumnName("photo1");
            entity.Property(e => e.Photo10)
                .HasMaxLength(255)
                .HasColumnName("photo10");
            entity.Property(e => e.Photo2)
                .HasMaxLength(255)
                .HasColumnName("photo2");
            entity.Property(e => e.Photo3)
                .HasMaxLength(255)
                .HasColumnName("photo3");
            entity.Property(e => e.Photo4)
                .HasMaxLength(255)
                .HasColumnName("photo4");
            entity.Property(e => e.Photo5)
                .HasMaxLength(255)
                .HasColumnName("photo5");
            entity.Property(e => e.Photo6)
                .HasMaxLength(255)
                .HasColumnName("photo6");
            entity.Property(e => e.Photo7)
                .HasMaxLength(255)
                .HasColumnName("photo7");
            entity.Property(e => e.Photo8)
                .HasMaxLength(255)
                .HasColumnName("photo8");
            entity.Property(e => e.Photo9)
                .HasMaxLength(255)
                .HasColumnName("photo9");
            entity.Property(e => e.Remark).HasMaxLength(255);
            entity.Property(e => e.Remark1).HasMaxLength(255);
            entity.Property(e => e.Remark10).HasMaxLength(255);
            entity.Property(e => e.Remark2).HasMaxLength(255);
            entity.Property(e => e.Remark3).HasMaxLength(255);
            entity.Property(e => e.Remark4).HasMaxLength(255);
            entity.Property(e => e.Remark5).HasMaxLength(255);
            entity.Property(e => e.Remark6).HasMaxLength(255);
            entity.Property(e => e.Remark7).HasMaxLength(255);
            entity.Property(e => e.Remark8).HasMaxLength(255);
            entity.Property(e => e.Remark9).HasMaxLength(255);
            entity.Property(e => e.Sno).HasColumnName("SNo");
            entity.Property(e => e.Total).HasPrecision(10, 2);
            entity.Property(e => e.Year).HasMaxLength(45);

            entity.HasOne(d => d.SnoNavigation).WithMany(p => p.Yearlycalculations)
                .HasForeignKey(d => d.Sno)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_yearlycalculation_organization");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
