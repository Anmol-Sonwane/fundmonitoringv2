# Graph Report - fundmonitoringv2  (2026-06-14)

## Corpus Check
- 88 files · ~1,977,361 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 676 nodes · 769 edges · 67 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]

## God Nodes (most connected - your core abstractions)
1. `YearlyCalculationService` - 15 edges
2. `StudentInformationService` - 15 edges
3. `MonthlyCalculationService` - 13 edges
4. `YearlyCalculationController` - 13 edges
5. `IYearlyCalculation` - 12 edges
6. `MonthlyInfrastructureService` - 12 edges
7. `StudentInformationController` - 12 edges
8. `IStudentInformation` - 11 edges
9. `NodelService` - 11 edges
10. `InformationService` - 11 edges

## Surprising Connections (you probably didn't know these)
- `openImageModal()` --calls--> `resolvePhotoUrl()`  [INFERRED]
  monitoringportal/calculation.js → monitoringportal/common.js
- `closeViewAllModal()` --calls--> `openModal()`  [INFERRED]
  monitoringportal/user.js → monitoringportal/studentpanel.js
- `viewPhoto()` --calls--> `resolvePhotoUrl()`  [INFERRED]
  monitoringportal/user.js → monitoringportal/common.js
- `editInfraRow()` --calls--> `resolvePhotoUrl()`  [INFERRED]
  monitoringportal/user.js → monitoringportal/common.js
- `editMonthlyRow()` --calls--> `resolvePhotoUrl()`  [INFERRED]
  monitoringportal/user.js → monitoringportal/common.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (31): openImageModal(), resolvePhotoUrl(), cancelInfraEdit(), cancelMonthlyEdit(), captureInfraEditPhoto(), captureYearEditPhoto(), deleteInfo(), editInfraRow() (+23 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (15): CalculationController, fundmonitoring.Controllers, CalculationService, fundmonitoring.Services, ControllerBase, HeadcountController, ICalculationService, fundmonitoring.Controllers (+7 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (22): applyBlockSeat(), applyFilter(), backToForm(), cancelEdit(), deleteRow(), editRow(), fetchVisitData(), fetchVisitDataForModal() (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (22): applyFilter(), deleteHealth(), deleteStudent(), enableEdit(), filterFit(), filterUnfit(), formatDateForInput(), loadFilterDropdowns() (+14 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (7): IInformation, fundmonitoring.Controllers, InformationController, fundmonitoring.Service, InformationService, fundmonitoring.Controllers, LoginController

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (10): fundmonitoring.Services, HeadcountDetectorService, HeadcountResult, IHeadcountDetector, INodelentry, IYearlyCalculation, fundmonitoring.Services, NodelentryService (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (5): IStudentInformation, fundmonitoring.Controllers, StudentInformationController, fundmonitoring.Services, StudentInformationService

### Community 7 - "Community 7"
Cohesion: 0.08
Nodes (3): MonthlyCalculationController, fundmonitoring.Controllers, YearlyCalculationController

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (17): backToOrgType(), closeMonthlyModal(), closeYearlyModal(), formatINR(), loadInfraOrgNames(), loadInfraSummary(), loadMonthlySummary(), loadOrgNameSummary() (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (5): INodel, fundmonitoring.Controllers, NodelController, fundmonitoring.Services, NodelService

### Community 10 - "Community 10"
Cohesion: 0.1
Nodes (5): IOrganization, fundmonitoring.Controllers, OrganizationController, fundmonitoring.Service, OrganizationService

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (3): fundmonitoring.Interface, IYearlyCalculation, OrganizationResultModelY

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (4): fundmonitoring.Services, IStudentInformation, StudentBasicInfo, StudentIdResponse

### Community 13 - "Community 13"
Cohesion: 0.19
Nodes (3): IMonthlyCalculation, fundmonitoring.Services, MonthlyCalculationService

### Community 14 - "Community 14"
Cohesion: 0.23
Nodes (3): IMonthlyinfrastructure, fundmonitoring.Services, MonthlyInfrastructureService

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (3): fundmonitoring.Interface, IMonthlyCalculation, OrganizationResultModel

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (3): fundmonitoring.Interface, IInformation, OrganizationDropdownModel

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (2): fundmonitoring.Interface, INodel

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (2): fundmonitoring.Interface, IMonthlyinfrastructure

### Community 19 - "Community 19"
Cohesion: 0.42
Nodes (9): clearUsers(), createUser(), createUserSample(), deleteUser(), editUser(), getToken(), renderUsers(), seedSample() (+1 more)

### Community 20 - "Community 20"
Cohesion: 0.2
Nodes (2): fundmonitoring.Interface, IOrganization

### Community 21 - "Community 21"
Cohesion: 0.42
Nodes (9): connect(), ensure_pymysql(), import_sql(), iter_statements(), main(), needs_seed(), print_summary(), row_count() (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.22
Nodes (3): IStudenthealth, fundmonitoring.Services, StudentHealthService

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (2): fundmonitoring.Interface, IStudenthealth

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (2): fundmonitoring.Interface, INodelentry

### Community 25 - "Community 25"
Cohesion: 0.4
Nodes (2): DbContext, FundmonitoringnewContext

### Community 26 - "Community 26"
Cohesion: 0.4
Nodes (3): ILoginService, fundmonitoring.Service, LoginService

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (2): fundmonitoring.Interface, ILoginService

### Community 28 - "Community 28"
Cohesion: 0.5
Nodes (2): fundmonitoring.Interface, IHeadcountDetector

### Community 29 - "Community 29"
Cohesion: 0.5
Nodes (2): fundmonitoring.Interface, ICalculationService

### Community 30 - "Community 30"
Cohesion: 0.67
Nodes (2): fundmonitoring, WeatherForecast

### Community 31 - "Community 31"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, YearlyCalculationSummaryQueryModel

### Community 32 - "Community 32"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, LoginResponseModel

### Community 33 - "Community 33"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, YearlycalculationQueryModel

### Community 34 - "Community 34"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, MonthlycalculationQueryModel

### Community 35 - "Community 35"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, TotalSummaryQueryModel

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, NodelQueryModel

### Community 37 - "Community 37"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, NodelentryQueryModel

### Community 38 - "Community 38"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, MonthlyCalculationByOrganizationQueryModel

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, InformationQueryModel

### Community 40 - "Community 40"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, OrganizationQueryModel

### Community 41 - "Community 41"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, YearlyCalculationByOrganizationQueryModel

### Community 42 - "Community 42"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, MonthlyinfrastructureSummaryQueryModel

### Community 43 - "Community 43"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, MonthlyinfrastructureQueryModel

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, MonthlyCalculationSummaryQueryModel

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, StudenthealthQueryModel

### Community 46 - "Community 46"
Cohesion: 0.67
Nodes (2): fundmonitoring.QueryModel, StudentinformationQueryModel

### Community 47 - "Community 47"
Cohesion: 0.67
Nodes (2): fundmonitoring.CommandModel, StudentinformationCommandModel

### Community 48 - "Community 48"
Cohesion: 0.67
Nodes (2): fundmonitoring.CommandModel, MonthlyinfrastructureCommandModel

### Community 49 - "Community 49"
Cohesion: 0.67
Nodes (2): fundmonitoring.CommandModel, LoginCommandModel

### Community 50 - "Community 50"
Cohesion: 0.67
Nodes (2): fundmonitoring.CommandModel, YearlycalculationCommandModel

### Community 51 - "Community 51"
Cohesion: 0.67
Nodes (2): fundmonitoring.CommandModel, StudenthealthCommandModel

### Community 52 - "Community 52"
Cohesion: 0.67
Nodes (2): fundmonitoring.CommandModel, MonthlycalculationCommandModel

### Community 53 - "Community 53"
Cohesion: 0.67
Nodes (2): fundmonitoring.CommandModel, NodelCommandModel

### Community 54 - "Community 54"
Cohesion: 0.67
Nodes (2): fundmonitoring.CommandModel, NodelentryCommandModel

### Community 55 - "Community 55"
Cohesion: 0.67
Nodes (2): fundmonitoring.CommandModel, OrganizationCommandModel

### Community 56 - "Community 56"
Cohesion: 0.67
Nodes (2): fundmonitoring.CommandModel, InformationCommandModel

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (1): Organization

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (1): Studentinformation

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (1): Monthlycalculation

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (1): Nodelentry

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (1): Studenthealth

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (1): Monthlyinfrastructure

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (1): Nodel

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (1): Information

### Community 66 - "Community 66"
Cohesion: 1.0
Nodes (1): Yearlycalculation

### Community 67 - "Community 67"
Cohesion: 1.0
Nodes (1): Login

## Knowledge Gaps
- **105 isolated node(s):** `fundmonitoring`, `WeatherForecast`, `fundmonitoring.QueryModel`, `YearlyCalculationSummaryQueryModel`, `fundmonitoring.QueryModel` (+100 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 17`** (12 nodes): `INodel.cs`, `fundmonitoring.Interface`, `INodel`, `.Add()`, `.Delete()`, `.GetAll()`, `.GetAllNodelName()`, `.GetBlockSeatByHostel()`, `.GetHostelNameByNodelName()`, `.GetTotalUniqueHostels()`, `.ImportFromExcel()`, `.Update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (11 nodes): `IMonthlyinfrastructure.cs`, `fundmonitoring.Interface`, `IMonthlyinfrastructure`, `.Add()`, `.Delete()`, `.GetAll()`, `.GetById()`, `.GetByMonthYear()`, `.GetByOrganizationName()`, `.GetTotalByOrganizationType()`, `.Update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (10 nodes): `IOrganization.cs`, `fundmonitoring.Interface`, `IOrganization`, `.Add()`, `.Delete()`, `.GetAll()`, `.GetOrganizationTypesWithMonthAsync()`, `.GetOrganizationTypesWithYearAsync()`, `.ImportFromExcel()`, `.Update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (8 nodes): `IStudenthealth.cs`, `fundmonitoring.Interface`, `IStudenthealth`, `.Add()`, `.Delete()`, `.GetAll()`, `.GetById()`, `.Update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (8 nodes): `INodelentry.cs`, `fundmonitoring.Interface`, `INodelentry`, `.Add()`, `.Delete()`, `.GetAll()`, `.GetByMonthYear()`, `.Update()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (6 nodes): `DbContext`, `FundmonitoringnewContext.cs`, `FundmonitoringnewContext`, `.OnConfiguring()`, `.OnModelCreating()`, `.OnModelCreatingPartial()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (4 nodes): `ILoginService.cs`, `fundmonitoring.Interface`, `ILoginService`, `.Login()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (4 nodes): `IHeadcountDetector.cs`, `fundmonitoring.Interface`, `IHeadcountDetector`, `.DetectAsync()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (4 nodes): `ICalculationService.cs`, `fundmonitoring.Interface`, `ICalculationService`, `.GetCombinedTotal()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (3 nodes): `WeatherForecast.cs`, `fundmonitoring`, `WeatherForecast`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (3 nodes): `YearlyCalculationSummaryQueryModel.cs`, `fundmonitoring.QueryModel`, `YearlyCalculationSummaryQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (3 nodes): `LoginResponseModel.cs`, `fundmonitoring.QueryModel`, `LoginResponseModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (3 nodes): `YearlycalculationQueryModel.cs`, `fundmonitoring.QueryModel`, `YearlycalculationQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (3 nodes): `MonthlycalculationQueryModel.cs`, `fundmonitoring.QueryModel`, `MonthlycalculationQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (3 nodes): `TotalSummaryQueryModel.cs`, `fundmonitoring.QueryModel`, `TotalSummaryQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (3 nodes): `NodelQueryModel.cs`, `fundmonitoring.QueryModel`, `NodelQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (3 nodes): `NodelentryQueryModel.cs`, `fundmonitoring.QueryModel`, `NodelentryQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (3 nodes): `MonthlyCalculationByOrganizationQueryModel.cs`, `fundmonitoring.QueryModel`, `MonthlyCalculationByOrganizationQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (3 nodes): `InformationQueryModel.cs`, `fundmonitoring.QueryModel`, `InformationQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (3 nodes): `OrganizationQueryModel.cs`, `fundmonitoring.QueryModel`, `OrganizationQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (3 nodes): `YearlyCalculationByOrganizationQueryModel.cs`, `fundmonitoring.QueryModel`, `YearlyCalculationByOrganizationQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (3 nodes): `MonthlyinfrastructureSummaryQueryModel.cs`, `fundmonitoring.QueryModel`, `MonthlyinfrastructureSummaryQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (3 nodes): `MonthlyinfrastructureQueryModel.cs`, `fundmonitoring.QueryModel`, `MonthlyinfrastructureQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (3 nodes): `MonthlyCalculationSummaryQueryModel.cs`, `fundmonitoring.QueryModel`, `MonthlyCalculationSummaryQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (3 nodes): `StudenthealthQueryModel.cs`, `fundmonitoring.QueryModel`, `StudenthealthQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (3 nodes): `StudentinformationQueryModel.cs`, `fundmonitoring.QueryModel`, `StudentinformationQueryModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (3 nodes): `StudentinformationCommandModel.cs`, `fundmonitoring.CommandModel`, `StudentinformationCommandModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (3 nodes): `MonthlyinfrastructureCommandModel.cs`, `fundmonitoring.CommandModel`, `MonthlyinfrastructureCommandModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (3 nodes): `LoginCommandModel.cs`, `fundmonitoring.CommandModel`, `LoginCommandModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (3 nodes): `YearlycalculationCommandModel.cs`, `fundmonitoring.CommandModel`, `YearlycalculationCommandModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (3 nodes): `StudenthealthCommandModel.cs`, `fundmonitoring.CommandModel`, `StudenthealthCommandModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (3 nodes): `MonthlycalculationCommandModel.cs`, `fundmonitoring.CommandModel`, `MonthlycalculationCommandModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (3 nodes): `NodelCommandModel.cs`, `fundmonitoring.CommandModel`, `NodelCommandModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (3 nodes): `NodelentryCommandModel.cs`, `fundmonitoring.CommandModel`, `NodelentryCommandModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (3 nodes): `OrganizationCommandModel.cs`, `fundmonitoring.CommandModel`, `OrganizationCommandModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (3 nodes): `InformationCommandModel.cs`, `fundmonitoring.CommandModel`, `InformationCommandModel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (2 nodes): `Organization.cs`, `Organization`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (2 nodes): `Studentinformation.cs`, `Studentinformation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (2 nodes): `Monthlycalculation.cs`, `Monthlycalculation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (2 nodes): `Nodelentry.cs`, `Nodelentry`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (2 nodes): `Studenthealth.cs`, `Studenthealth`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (2 nodes): `Monthlyinfrastructure.cs`, `Monthlyinfrastructure`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (2 nodes): `Nodel.cs`, `Nodel`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (2 nodes): `Information.cs`, `Information`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (2 nodes): `Yearlycalculation.cs`, `Yearlycalculation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 67`** (2 nodes): `Login.cs`, `Login`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `StudentInformationController` connect `Community 6` to `Community 1`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `NodelController` connect `Community 9` to `Community 1`, `Community 10`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `InformationController` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `fundmonitoring`, `WeatherForecast`, `fundmonitoring.QueryModel` to the rest of the system?**
  _105 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._