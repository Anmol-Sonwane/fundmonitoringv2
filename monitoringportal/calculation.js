// ================================
// GLOBAL VARIABLES
// ================================
let lastModalSource = "monthly"; 
// tracks whether user is in monthly/yearly
let selectedOrganizationName = ""; // stores currently selected organization
 
const apiBase = "";
// ================================
// PAGE LOAD
// ================================
document.addEventListener("DOMContentLoaded", () => {
    loadTotals();

    // Month/Year buttons
    document.getElementById("monthExpensesBtn").addEventListener("click", openMonthlyModal);
    document.getElementById("yearExpensesBtn").addEventListener("click", openYearlyModal);
	document.getElementById("infraExpensesBtn")
    .addEventListener("click", openInfraModal);

    // Information button
    const infoBtn = document.getElementById("infoBtn");
    if (infoBtn) {
        infoBtn.addEventListener("click", openInfoModal);
    }
	 const applyBtn = document.getElementById("applyYearFilter");
    if (applyBtn) {
        applyBtn.addEventListener("click", loadYearlySummary);
    }
	
    // Load initial data
    loadYearlySummary();
});

// ================================
// LOAD TOTALS
// ================================
async function loadTotals() {
    try {
        const response = await fetch("/api/Calculation/total-summary");
        if (!response.ok) throw new Error("Failed to fetch totals");

        const data = await response.json();

        const monthly = data.monthlyTotal || 0;
        const yearly = data.yearlyTotal || 0;
        const infra = data.monthlyInfraTotal || 0;

        const grandTotal = monthly + yearly + infra;
		
		  // Update donut chart
        const monthlyPercent = grandTotal ? ((monthly / grandTotal) * 100).toFixed(1) : 0;
		const yearlyPercent = grandTotal ? ((yearly / grandTotal) * 100).toFixed(1) : 0;
		const infraPercent = grandTotal ? ((infra / grandTotal) * 100).toFixed(1) : 0;

        document.getElementById("monthlyExpenses").innerText = formatINR(monthly);
        document.getElementById("yearlyExpenses").innerText = formatINR(yearly);
        document.getElementById("infraExpenses").innerText = formatINR(infra);
        document.getElementById("overallExpenses").innerText = formatINR(grandTotal);
		
		document.getElementById("monthlyPercent").innerText = monthlyPercent + "%";
		document.getElementById("yearlyPercent").innerText = yearlyPercent + "%";
		document.getElementById("infraPercent").innerText = infraPercent + "%";

		document.getElementById("donutPercentage").innerText =
		grandTotal ? "100%" : "0%";
		
		updateDonutChart(monthlyPercent, yearlyPercent, infraPercent);

    } catch (err) {
        console.error("Error loading totals:", err);

        document.getElementById("monthlyExpenses").innerText = "₹ 0";
        document.getElementById("yearlyExpenses").innerText = "₹ 0";
        document.getElementById("infraExpenses").innerText = "₹ 0";
        document.getElementById("overallExpenses").innerText = "₹ 0";
    }
}
      
 

// ================================
// UPDATE DONUT CHART
// ================================
function updateDonutChart(monthlyPercent, yearlyPercent, infraPercent) {

    const donut = document.querySelector(".donut");
    if (!donut) return;

    const m = parseFloat(monthlyPercent);
    const y = parseFloat(yearlyPercent);
    const i = parseFloat(infraPercent);

    const firstBreak = m;
    const secondBreak = m + y;
    const thirdBreak = m + y + i;

    donut.style.background = `conic-gradient(
        blue 0% ${firstBreak}%,
        green ${firstBreak}% ${secondBreak}%,
        orange ${secondBreak}% ${thirdBreak}%,
        lightgray ${thirdBreak}% 100%
    )`;
}

// ================================
// OPEN/CLOSE MODALS
// ================================
async function openMonthlyModal() {
	resetAllFilters();
    lastModalSource = "monthly";
    document.getElementById("monthlyModal").style.display = "block";
    await loadMonthlySummary();
}

async function openYearlyModal() {
	resetAllFilters();
    lastModalSource = "yearly";
    document.getElementById("yearlyModal").style.display = "block";
    await loadYearlySummary();
}

function closeMonthlyModal() { document.getElementById("monthlyModal").style.display = "none"; }
function closeYearlyModal() { document.getElementById("yearlyModal").style.display = "none"; }
function closeOrgDetails() {
    document.getElementById("orgDetailsModalMonthly").style.display = "none";
    document.getElementById("orgDetailsModalYearly").style.display = "none";
}
function closeOrgInfoModal() { document.getElementById("orgInfoModal").style.display = "none"; }
// ================================
// LOAD MONTHLY SUMMARY (WITH FILTER)
// ================================
async function loadMonthlySummary() {
    const month = document.getElementById("monthFilter")?.value || "";
    const year = document.getElementById("yearFilter")?.value || "";

    let url = "/api/MonthlyCalculation/GetTotalByOrganizationTypeMY";

    const params = [];
    if (month) params.push(`month=${encodeURIComponent(month)}`);
    if (year) params.push(`year=${encodeURIComponent(year)}`);

    if (params.length) {
        url += "?" + params.join("&");
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch monthly summary");

        const data = await res.json();
        const tbody = document.getElementById("monthlySummaryBody");
        tbody.innerHTML = "";

        if (!data?.length) {
            tbody.innerHTML = "<tr><td colspan='2'>No data available</td></tr>";
            return;
        }

        data.forEach(item => {
            tbody.innerHTML += `
                <tr style="cursor:pointer"
                    onclick="openOrgNameModal('${encodeURIComponent(item.organizationType)}','monthly')">
                    <td>${item.organizationType}</td>
                    <td>${formatINR(item.totalAmount)}</td>
                </tr>
            `;
        });

    } catch (err) {
        console.error(err);
        document.getElementById("monthlySummaryBody").innerHTML =
            "<tr><td colspan='2'>Error loading data</td></tr>";
    }
}


async function loadYearlySummary() {
    try {
        const year = document.getElementById("yearFilter2").value;

        let url = "/api/YearlyCalculation/GetTotalByOrganizationTypeY";
        if (year) url += `?year=${encodeURIComponent(year)}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch yearly summary");

        const data = await res.json();
        const tbody = document.getElementById("yearlySummaryBody");
        tbody.innerHTML = "";

        if (!data || data.length === 0) {
            tbody.innerHTML = "<tr><td colspan='2'>No data available</td></tr>";
            return;
        }

        data.forEach(item => {
            tbody.innerHTML += `
                <tr style="cursor:pointer"
                    onclick="openOrgNameModal('${encodeURIComponent(item.organizationType)}','yearly')">
                    <td>${item.organizationType}</td>
                    <td>${formatINR(item.totalAmount)}</td>
                </tr>`;
        });

    } catch (err) {
        console.error(err);
        document.getElementById("yearlySummaryBody").innerHTML =
            "<tr><td colspan='2'>Error loading data</td></tr>";
    }
}

// ================================
// OPEN ORGANIZATION NAME MODAL
// ================================
function openOrgNameModal(orgType, source) {
    orgType = decodeURIComponent(orgType);
    lastModalSource = source;
	document.getElementById("orgNameSearch").value = "";

    // Close parent modal
    if (source === "monthly") closeMonthlyModal();
    if (source === "yearly") closeYearlyModal();

    const modal = document.getElementById("orgNameModal");
    modal.style.display = "block";
    modal.querySelector("h2").innerText = `${source === "monthly" ? "Monthly" : "Yearly"} Expenses - ${orgType}`;

    loadOrgNameSummary(orgType, source);
}

async function loadOrgNameSummary(orgType, source) {
    try {
        const apiUrl = `/api/${source === "monthly" ? "MonthlyCalculation" : "YearlyCalculation"}/GetOrganizationsByType?orgType=${encodeURIComponent(orgType)}`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Failed to fetch organization names");

        const data = await res.json();
        const tbody = document.getElementById("orgNameSummaryBody");
        tbody.innerHTML = "";

        if (!data?.length) {
            tbody.innerHTML = "<tr><td colspan='2'>No data available</td></tr>";
            return;
        }

        data.forEach(item => {
            tbody.innerHTML += `<tr style="cursor:pointer" onclick="${source === 'monthly' ? `openMonthlyOrgDetails('${encodeURIComponent(item.organizationName)}')` : `openYearlyOrgDetails('${encodeURIComponent(item.organizationName)}')`}">
                <td>${item.organizationName || "N/A"}</td>
                <td>${formatINR(item.total ?? 0)}</td>
            </tr>`;
        });
    } catch (err) {
        console.error(err);
        document.getElementById("orgNameSummaryBody").innerHTML = "<tr><td colspan='2'>Error loading data</td></tr>";
    }
}


// ================================
// OPEN ORG DETAILS MODAL
// ================================
async function openMonthlyOrgDetails(orgName) {
     lastModalSource = "monthly";
	orgName = decodeURIComponent(orgName);
    selectedOrganizationName = orgName;
    document.getElementById("orgNameModal").style.display = "none";

    const modal = document.getElementById("orgDetailsModalMonthly");
    modal.setAttribute("data-org-name", orgName);
    const tbody = document.getElementById("orgDetailsBodyMonthly");
    tbody.innerHTML = "<tr><td colspan='9'>Loading...</td></tr>";

    try {
        const res = await fetch(`/api/MonthlyCalculation/GetAllByOrganizationName?organizationName=${encodeURIComponent(orgName)}`);
        const data = await res.json();

       tbody.innerHTML = data.length ? data.map((item, index) => {

    let photoDropdown = `
    <div class="photo-scroll-box">
`;

for (let i = 1; i <= 10; i++) {
    const photo = item[`photo${i}`];
    const remark = item[`remark${i}`];
	const headcount = item[`headCount${i}`];
	

    if (photo) {
        photoDropdown += `
            <div class="photo-card">
                <img src="${apiBase + photo}" 
     class="photo-thumb" 
     onclick="openImageModal('${apiBase + photo}')"/>
                <div class="photo-remark">${remark || "No Remark"}</div>
				<div class="photo-headcount">👤 Headcount: ${headcount ?? 0}</div>
            </div>
        `;
    }
}

photoDropdown += `</div>`;
    return `<tr>
        <td>${item.block || "-"}</td>
        <td>${item.admittedSeat || "-"}</td>
        <td>${item.month || "-"}</td>
        <td>${item.year || "-"}</td>
        <td>₹ ${item.amount || 0}</td>
        <td>₹ ${item.total || 0}</td>
        <td>${item.remark || "-"}</td>
        <td>${photoDropdown}</td>
    </tr>`;

}).join("") : "<tr><td colspan='8'>No records found</td></tr>";

        modal.style.display = "block";
    } catch (err) {
        console.error(err);
        tbody.innerHTML = "<tr><td colspan='9'>Error loading data</td></tr>";
    }
}

async function openYearlyOrgDetails(orgName) {
	 lastModalSource = "yearly"; 
    orgName = decodeURIComponent(orgName);
    selectedOrganizationName = orgName;
    document.getElementById("orgNameModal").style.display = "none";

    const modal = document.getElementById("orgDetailsModalYearly");
    modal.setAttribute("data-org-name", orgName);
    const tbody = document.getElementById("orgDetailsBodyYearly");
    tbody.innerHTML = "<tr><td colspan='8'>Loading...</td></tr>";

    try {
        const res = await fetch(`/api/YearlyCalculation/GetAllByOrganizationName?organizationName=${encodeURIComponent(orgName)}`);
        const data = await res.json();

		tbody.innerHTML = data.length ? data.map((item, index) => {

		let photoDropdown = `
    <div class="photo-scroll-box">
`;

for (let i = 1; i <= 10; i++) {
    const photo = item[`photo${i}`];
    const remark = item[`remark${i}`];
	const headcount = item[`headCount${i}`];

    if (photo) {
        photoDropdown += `
            <div class="photo-card">
                <img src="${apiBase + photo}" 
     class="photo-thumb" 
     onclick="openImageModal('${apiBase + photo}')"/>
                <div class="photo-remark">${remark || "No Remark"}</div>
				<div class="photo-headcount">👤 Headcount: ${headcount ?? 0}</div>
            </div>
        `;
    }
}

photoDropdown += `</div>`;

		return `<tr>
					<td>${item.block || "-"}</td>
					<td>${item.year || "-"}</td>
					<td>₹ ${item.total || 0}</td>
					<td>${item.remark || "-"}</td>
					<td>${photoDropdown}</td>
				</tr>`;

		}).join("") : "<tr><td colspan='8'>No records found</td></tr>";
         

        modal.style.display = "block";
    } catch (err) {
        console.error(err);
        tbody.innerHTML = "<tr><td colspan='8'>Error loading data</td></tr>";
    }
}

// ================================
// OPEN INFORMATION MODAL (FIXED)
// ================================
async function openInfoModal() {
    let modalId = "";

    if (lastModalSource === "monthly") {
        modalId = "orgDetailsModalMonthly";
    } else if (lastModalSource === "yearly") {
        modalId = "orgDetailsModalYearly";
    }
	 else if (lastModalSource === "infra") {   // ✅ ADD THIS
        modalId = "infraDetailsModal";
    }
    const modal = document.getElementById(modalId);
    if (!modal) {
        alert("Details modal not found");
        return;
    }

    const orgName = modal.getAttribute("data-org-name");
    if (!orgName) {
        alert("Organization not found. Please reopen details.");
        return;
    }

    try {
        const response = await fetch(
    `/api/Information/organization?name=${encodeURIComponent(orgName)}`
);


        if (!response.ok) {
            throw new Error("API failed: " + response.status);
        }

        const data = await response.json();

        const tbody = document.getElementById("orgInfoBody");
        tbody.innerHTML = `
            <tr>
                <td>${data.organizationName ?? "-"}</td>
                <td>${data.block ?? "-"}</td>
                <td>${data.hostelSuperintendent ?? "-"}</td>
                <td>${data.mobileNo ?? "-"}</td>
                <td>${data.totalSeat ?? "-"}</td>
                <td>${data.admittedSeat ?? "-"}</td>
                <td>${data.remark ?? "-"}</td>
                <td>${data.remark2 ?? "-"}</td>
            </tr>
        `;
		
		// ✅ CLOSE CURRENT DETAILS MODAL
        modal.style.display = "none";
		
       // ✅ OPEN INFO MODAL
        document.getElementById("orgInfoModal").style.display = "block";

    } catch (err) {
        console.error("INFO FETCH ERROR:", err);
        alert("Unable to fetch organization information.");
    }
}

function closeOrgInfoModal() {

    // 1️⃣ Close Info Modal
    document.getElementById("orgInfoModal").style.display = "none";

    // 2️⃣ Reopen previous modal
    if (lastModalSource === "monthly") {
        document.getElementById("orgDetailsModalMonthly").style.display = "block";
    }
    else if (lastModalSource === "yearly") {
        document.getElementById("orgDetailsModalYearly").style.display = "block";
    }
    else if (lastModalSource === "infra") {
        document.getElementById("infraDetailsModal").style.display = "block";
    }
}

// ================================
// BACK BUTTONS
// ================================
function backToOrgName() {
    document.getElementById("orgDetailsModalMonthly").style.display = "none";
    document.getElementById("orgDetailsModalYearly").style.display = "none";
    document.getElementById("infraDetailsModal").style.display = "none"; // ✅ ADD

    document.getElementById("orgNameModal").style.display = "block";
}

function backToOrgType() {
    document.getElementById("orgNameModal").style.display = "none";
     // Reset filters if you want
    if (lastModalSource === "monthly") {
        const monthFilter = document.getElementById("monthFilter");
        const yearFilter = document.getElementById("yearFilter");
        if (monthFilter) monthFilter.value = "";
        if (yearFilter) yearFilter.value = "";
        loadMonthlySummary(); // reload data
        document.getElementById("monthlyModal").style.display = "block";
    } else if (lastModalSource === "yearly") {
        const yearFilter = document.getElementById("yearFilter2");
        if (yearFilter) yearFilter.value = "";
        loadYearlySummary(); // reload data
        document.getElementById("yearlyModal").style.display = "block";
    }
	 else if (lastModalSource === "infra") {

        // ✅ Reset Infra Filters
        const infraMonth = document.getElementById("infraMonthFilter");
        const infraYear = document.getElementById("infraYearFilter");
        if (infraMonth) infraMonth.value = "";
        if (infraYear) infraYear.value = "";

        loadInfraSummary();   // reload without filters
        document.getElementById("infraModal").style.display = "block";
    }
}

// ================================
// FORMAT CURRENCY
// ================================
function formatINR(amount) {
    return amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
}

// ================================
// CLICK OUTSIDE MODAL TO CLOSE
// ================================
window.onclick = function(event) {
    ["monthlyModal", "yearlyModal", "orgNameModal", "orgDetailsModalMonthly", "orgDetailsModalYearly", "orgInfoModal"].forEach(id => {
        const modal = document.getElementById(id);
        if (event.target === modal) modal.style.display = "none";
    });
};
function resetAllFilters() {
    // Monthly filters
    const monthFilter = document.getElementById("monthFilter");
    const yearFilter = document.getElementById("yearFilter");

    if (monthFilter) monthFilter.value = "";
    if (yearFilter) yearFilter.value = "";

    // Yearly filter
    const yearFilter2 = document.getElementById("yearFilter2");
    if (yearFilter2) yearFilter2.value = "";
	
	 // ✅ Infra filters
    const infraMonth = document.getElementById("infraMonthFilter");
    const infraYear = document.getElementById("infraYearFilter");
	
	  if (infraMonth) infraMonth.value = "";
    if (infraYear) infraYear.value = "";
	
    // Reload summaries with no filters
    loadMonthlySummary();
    loadYearlySummary();
	 loadInfraSummary();   // ✅ ADD THIS
}
 function filterOrgNames() {
    const input = document.getElementById("orgNameSearch").value.toLowerCase();
    const rows = document.querySelectorAll("#orgNameSummaryBody tr");

    rows.forEach(row => {
        const orgName = row.cells[0].innerText.toLowerCase();
        row.style.display = orgName.includes(input) ? "" : "none";
    });
}
//--------------------------infrA----------------------------


async function openInfraModal() {
    lastModalSource = "infra";   // ✅ ADD THIS
    resetAllFilters();
    document.getElementById("infraModal").style.display = "block";
    await loadInfraSummary();
}

async function loadInfraSummary() {
    const month = document.getElementById("infraMonthFilter")?.value || "";
    const year = document.getElementById("infraYearFilter")?.value || "";

    let url = "/api/MonthlyInfrastructure/GetTotalByOrganizationType";

    const params = [];
    if (month) params.push(`month=${encodeURIComponent(month)}`);
    if (year) params.push(`year=${encodeURIComponent(year)}`);

    if (params.length) {
        url += "?" + params.join("&");
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch infra summary");

        const data = await res.json();
        const tbody = document.getElementById("infraSummaryBody");
        tbody.innerHTML = "";

        if (!data?.length) {
            tbody.innerHTML = "<tr><td colspan='2'>No data available</td></tr>";
            return;
        }

        data.forEach(item => {
            tbody.innerHTML += `
                <tr style="cursor:pointer"
                    onclick="openInfraOrgNameModal('${encodeURIComponent(item.organizationType)}')">
                    <td>${item.organizationType}</td>
                    <td>${formatINR(item.totalAmount)}</td>
                </tr>
            `;
        });

    } catch (err) {
        console.error(err);
        document.getElementById("infraSummaryBody").innerHTML =
            "<tr><td colspan='2'>Error loading data</td></tr>";
    }
}

function openInfraOrgNameModal(orgType) {
	lastModalSource = "infra";  
    orgType = decodeURIComponent(orgType);

    document.getElementById("infraModal").style.display = "none";
    document.getElementById("orgNameModal").style.display = "block";

    document.querySelector("#orgNameModal h2").innerText =
        `Infrastructure Expenses - ${orgType}`;

    loadInfraOrgNames(orgType);
}

async function loadInfraOrgNames(orgType) {
    try {
        const res = await fetch(
            `/api/MonthlyInfrastructure/GetOrganizationsByType?orgType=${encodeURIComponent(orgType)}`
        );

        const data = await res.json();
        const tbody = document.getElementById("orgNameSummaryBody");
        tbody.innerHTML = "";

        if (!data?.length) {
            tbody.innerHTML = "<tr><td colspan='2'>No data available</td></tr>";
            return;
        }

        data.forEach(item => {
            tbody.innerHTML += `
                <tr style="cursor:pointer"
                    onclick="openInfraDetails('${encodeURIComponent(item.organizationName)}')">
                    <td>${item.organizationName}</td>
                    <td>${formatINR(item.total)}</td>
                </tr>
            `;
        });

    } catch (err) {
        console.error(err);
    }
}

async function openInfraDetails(orgName) {
	 lastModalSource = "infra";   // ✅ ADD THIS
    orgName = decodeURIComponent(orgName);

    document.getElementById("orgNameModal").style.display = "none";
    const modal = document.getElementById("infraDetailsModal");
	  modal.setAttribute("data-org-name", orgName);
    const tbody = document.getElementById("infraDetailsBody");

    tbody.innerHTML = "<tr><td colspan='6'>Loading...</td></tr>";

    try {
        const res = await fetch(
            `/api/MonthlyInfrastructure/GetByOrganizationName?organizationName=${encodeURIComponent(orgName)}`
        );

        const data = await res.json();

        tbody.innerHTML = data.length
            ? data.map(item => {

                 // ✅ REPLACED DROPDOWN WITH SCROLL BOX
                let photoDropdown = `<div class="photo-scroll-box">`;

                for (let i = 1; i <= 10; i++) {
                    const photo = item[`photo${i}`];
                    const remark = item[`remark${i}`];

                    if (photo) {
                        photoDropdown += `
                            <div class="photo-card">
                                <img src="${apiBase + photo}" 
									class="photo-thumb" 
									onclick="openImageModal('${apiBase + photo}')"/>
                                <div class="photo-remark">${remark || "No Remark"}</div>
                            </div>
                        `;
                    }
                }

                photoDropdown += `</div>`;

                return `
                    <tr>
                        <td>${item.block || "-"}</td>
                        <td>${item.month || "-"}</td>
                        <td>${item.year || "-"}</td>
                        <td>${formatINR(item.total || 0)}</td>
                        <td>${item.remark || "-"}</td>
                        <td>${photoDropdown}</td>
                    </tr>
                `;
            }).join("")
            : "<tr><td colspan='6'>No records found</td></tr>";

        modal.style.display = "block";

    } catch (err) {
        console.error(err);
    }
}

function openImageModal(imageSrc) {

    // ✅ Close current details modal
    if (lastModalSource === "infra") {
        document.getElementById("infraDetailsModal").style.display = "none";
    }
    else if (lastModalSource === "monthly") {
        document.getElementById("orgDetailsModalMonthly").style.display = "none";
    }
    else if (lastModalSource === "yearly") {
        document.getElementById("orgDetailsModalYearly").style.display = "none";
    }

    // ✅ Open image modal
    const modal = document.getElementById("imagePreviewModal");
    const img = document.getElementById("previewImage");

    img.src = imageSrc;
    modal.style.display = "flex";
}

function closeImageModal() {

    document.getElementById("imagePreviewModal").style.display = "none";

    // ✅ Reopen previous modal
    if (lastModalSource === "infra") {
        document.getElementById("infraDetailsModal").style.display = "block";
    }
    else if (lastModalSource === "monthly") {
        document.getElementById("orgDetailsModalMonthly").style.display = "block";
    }
    else if (lastModalSource === "yearly") {
        document.getElementById("orgDetailsModalYearly").style.display = "block";
    }
}