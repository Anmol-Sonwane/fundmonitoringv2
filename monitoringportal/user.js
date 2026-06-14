const API_BASE = "/api";
const ORG_URL = `${API_BASE}/Organization`;

if (typeof resolvePhotoUrl !== "function") {
    function resolvePhotoUrl(path) {
        if (!path) return "";
        let value = String(path).trim();
        if (!value) return "";
        if (value.startsWith("data:") || value.startsWith("blob:")) return value;
        if (/^https?:\/\/uploads(\/|$)/i.test(value)) {
            value = value.replace(/^https?:\/\/uploads\/?/i, "");
        } else if (/^\/\/uploads(\/|$)/i.test(value)) {
            value = value.replace(/^\/\/uploads\/?/i, "");
        } else if (/^https?:\/\//i.test(value)) {
            return value;
        }
        value = value.replace(/^\/+/, "");
        if (!value.startsWith("uploads/") && /\.(jpe?g|png|gif|webp|bmp)$/i.test(value) && !value.includes("/")) {
            value = `uploads/${value}`;
        }
        const relativePath = `/${value}`;
        const origin = window.location?.origin;
        if (origin && origin !== "null" && /^https?:/i.test(origin)) {
            return new URL(relativePath, origin).href;
        }
        return relativePath;
    }
    window.resolvePhotoUrl = resolvePhotoUrl;
}

// ================================
// Initialize DOM Events
// ================================
document.addEventListener("DOMContentLoaded", () => {

    // --- ADD ORGANIZATION ---
    const orgForm = document.getElementById("orgForm");
    if (orgForm) {
        orgForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const organizationType = document.getElementById("organizationType").value.trim();
            const remark = document.getElementById("orgRemark").value.trim();

            if (!organizationType) {
                alert("Organization Type is required");
                return;
            }

            try {
                const res = await fetch(`${ORG_URL}/add`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ OrganizationType: organizationType, Remark: remark })
                });

                const msg = await res.text();

                if (!res.ok) throw new Error(msg || "Add failed");

                alert(msg || "Organization added successfully");
                orgForm.reset();
                closeModal(); // Your modal close function
                loadOrganizations(); // refresh table if visible
            } catch (err) {
                alert(err.message);
            }
        });
    }

    // --- VIEW ALL ---
    const viewAllBtn = document.getElementById("viewAllBtn");
    if (viewAllBtn) {
        viewAllBtn.addEventListener("click", () => {
            document.getElementById("orgModal").style.display = "none";
            document.getElementById("orgViewModal").style.display = "block";
            document.getElementById("modalOverlay").style.display = "block";

            loadOrganizations();
        });
    }

    // --- BACK TO ADD ---
    const backBtn = document.getElementById("backToAddBtn");
    if (backBtn) {
        backBtn.addEventListener("click", backToOrgModal);
    }

    // --- TABLE ACTIONS (EDIT / DELETE) ---
    const tbody = document.getElementById("orgTableBody");
    tbody.addEventListener("click", async (e) => {
        const target = e.target;
        const sno = target.dataset.id;
        if (!sno) return;

        // ---------- EDIT / SAVE ----------
        if (target.classList.contains("edit-btn")) {
            const typeText = document.getElementById(`type-text-${sno}`);
            const remarkText = document.getElementById(`remark-text-${sno}`);
            const typeInput = document.getElementById(`type-input-${sno}`);
            const remarkInput = document.getElementById(`remark-input-${sno}`);

            if (target.innerText === "Edit") {
                typeText.style.display = "none";
                remarkText.style.display = "none";
                typeInput.style.display = "block";
                remarkInput.style.display = "block";
                target.innerText = "Save";
            } else {
                const updatedType = typeInput.value.trim();
                const updatedRemark = remarkInput.value.trim();

                if (!updatedType) {
                    alert("Organization Type is required");
                    return;
                }

                try {
                    const res = await fetch(`${ORG_URL}/update`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ Sno: sno, OrganizationType: updatedType, Remark: updatedRemark })
                    });

                    const msg = await res.text();
                    if (!res.ok) throw new Error(msg || "Update failed");

                    typeText.innerText = updatedType;
                    remarkText.innerText = updatedRemark;
                    typeText.style.display = "block";
                    remarkText.style.display = "block";
                    typeInput.style.display = "none";
                    remarkInput.style.display = "none";
                    target.innerText = "Edit";
                    alert(msg || "Updated successfully");
                } catch (err) {
                    alert(err.message);
                }
            }
        }

        // ---------- DELETE ----------
        if (target.classList.contains("delete-btn")) {
            if (!confirm("Are you sure you want to delete this organization?")) return;

            try {
                const res = await fetch(`${ORG_URL}/delete/${sno}`, { method: "DELETE" });
                const msg = res.status === 204 ? "Deleted successfully" : await res.text();

                if (!res.ok) throw new Error(msg || "Delete failed");

                const row = document.getElementById(`row-${sno}`);
                if (row) row.remove();
                alert(msg || "Deleted successfully");
            } catch (err) {
                console.error("Delete failed:", err);
                alert(err.message || "Delete failed");
            }
        }
    });
});

// ================================
// BACK TO ADD MODAL
// ================================
function backToOrgModal() {
    document.getElementById("orgViewModal").style.display = "none";
    document.getElementById("orgModal").style.display = "block";
    document.getElementById("modalOverlay").style.display = "none";
}

// ================================
// LOAD ORGANIZATIONS
// ================================
async function loadOrganizations() {
    try {
        const res = await fetch(`${ORG_URL}/getall`);
        if (!res.ok) throw new Error("Failed to load organizations");

        const data = await res.json();
        const tbody = document.getElementById("orgTableBody");
        tbody.innerHTML = "";

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No data found</td></tr>`;
            return;
        }

        data.forEach(item => {
            tbody.innerHTML += `
                <tr id="row-${item.sno}">
                    <td>${item.sno}</td>
                    <td>
                        <span id="type-text-${item.sno}">${item.organizationType}</span>
                        <textarea id="type-input-${item.sno}" style="display:none;width:100%;">${item.organizationType}</textarea>
                    </td>
                    <td>
                        <span id="remark-text-${item.sno}">${item.remark ?? ""}</span>
                        <textarea id="remark-input-${item.sno}" style="display:none;width:100%;">${item.remark ?? ""}</textarea>
                    </td>
                    <td>
                        <button type="button" class="edit-btn" data-id="${item.sno}">Edit</button>
                        <button type="button" class="delete-btn" data-id="${item.sno}">Delete</button>
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        console.error(err);
        alert(err.message || "Failed to load organizations");
    }
}


//--------------------------------------organization close -------------------------------------------


 
//--------------------------------- information start-------------------------------------------
// ================================
// LOAD ORGANIZATION TYPE DROPDOWN
// ================================
function loadOrganizationDropdown() {

    const dropdown = document.getElementById("infoOrgType");

    // Prevent duplicate loading
    if (!dropdown || dropdown.dataset.loaded === "true") return;

    fetch(`${API_BASE}/Information/OrganizationDropdown`)
        .then(res => res.json())
        .then(data => {

            dropdown.innerHTML = `<option value="">Select Organization Type</option>`;

            data.forEach(item => {
                dropdown.innerHTML += `
                    <option value="${item.sno}">
                        ${item.organizationType}
                    </option>
                `;
            });

            dropdown.dataset.loaded = "true"; // mark as loaded
        })
        .catch(err => {
            alert("Failed to load Organization Types");
            console.error(err);
        });
}
  
// ================================
// INFORMATION FORM - ADD
// ================================

document.addEventListener("DOMContentLoaded", () => {

    const infoForm = document.getElementById("infoForm");

    if (infoForm) {
        infoForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const payload = {
    sno: parseInt(document.getElementById("infoOrgType").value),
    organizationName: document.getElementById("orgName").value.trim(),
    block: document.getElementById("block").value.trim() || null,
    hostelSuperintendent: document.getElementById("superintendent").value.trim() || null,
    mobileNo: document.getElementById("mobile").value.trim() || null,
    totalSeat: parseInt(document.getElementById("totalSeats").value) || 0,
    admittedSeat: parseInt(document.getElementById("admittedSeats").value) || 0,
    remark: document.getElementById("infoRemark").value.trim() || null,
    remark2: null
};


            // Basic validation
            if (!payload.sno || !payload.organizationName) {
                alert("Organization Type and Organization Name are required");
                return;
            }

            fetch("/api/Information", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
                .then(res => {
                    if (!res.ok) {
                        return res.json().then(err => { throw err; });
                    }
                    return res.json();
                })
                .then(data => {
                    alert("Information Added Successfully");
                    infoForm.reset();
                    closeModal();
                })
                .catch(err => {
                    alert(err.message || "Duplicate entry detected");
                });
        });
    }
});

async function loadAllInformation() {
    try {
        const res = await fetch(`${API_BASE}/Information`);
        if (!res.ok) throw new Error("Failed to fetch information");

        const data = await res.json();

        const tbody = document.getElementById("infoTableBody");
        tbody.innerHTML = "";

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;">No records found</td></tr>`;
            return;
        }

        data.forEach(info => {
            tbody.innerHTML += `
                <tr id="info-row-${info.infoSno}">
				 <td>${info.infoSno}</td> <!-- <-- Show infoSno here -->
                    <td>
    <span id="org-text-${info.infoSno}">${info.organizationType}</span>
    <select id="org-input-${info.infoSno}" style="display:none;"></select>
    <input type="hidden" id="orgType-sno-${info.infoSno}" value="${info.sno}">
</td>

					 
                    <td>
                        <span id="name-text-${info.infoSno}">${info.organizationName}</span>
                        <input type="text" id="name-input-${info.infoSno}" value="${info.organizationName}" style="display:none;">
                    </td>
                    <td>
                        <span id="block-text-${info.infoSno}">${info.block}</span>
                        <input type="text" id="block-input-${info.infoSno}" value="${info.block}" style="display:none;">
                    </td>
                    <td>
                        <span id="super-text-${info.infoSno}">${info.hostelSuperintendent}</span>
                        <input type="text" id="super-input-${info.infoSno}" value="${info.hostelSuperintendent}" style="display:none;">
                    </td>
                    <td>
                        <span id="mobile-text-${info.infoSno}">${info.mobileNo}</span>
                        <input type="text" id="mobile-input-${info.infoSno}" value="${info.mobileNo}" style="display:none;">
                    </td>
                    <td>
                        <span id="total-text-${info.infoSno}">${info.totalSeat}</span>
                        <input type="number" id="total-input-${info.infoSno}" value="${info.totalSeat}" style="display:none;">
                    </td>
                    <td>
                        <span id="admit-text-${info.infoSno}">${info.admittedSeat}</span>
                        <input type="number" id="admit-input-${info.infoSno}" value="${info.admittedSeat}" style="display:none;">
                    </td>
                    <td>
                        <span id="remark-text-${info.infoSno}">${info.remark ?? ""}</span>
                        <textarea id="remark-input-${info.infoSno}" style="display:none;">${info.remark ?? ""}</textarea>
                    </td>
                    <td>
                        <button id="edit-btn-${info.infoSno}" onclick="editInfoRow(${info.infoSno})">Edit</button>
                        <button onclick="deleteInfo(${info.infoSno})" class="danger-btn">Delete</button>
                    </td>
                </tr>`;
        });

    } catch (err) {
        console.error("Load error:", err);
        const tbody = document.getElementById("infoTableBody");
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Failed to load data</td></tr>`;
    }
}


async function deleteInfo(id) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        const res = await fetch(`${API_BASE}/Information/${id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            alert("Deleted successfully");
            loadAllInformation();
        } else {
            alert("Delete failed");
        }
    } catch (err) {
        console.error("Delete error:", err);
    }
}
function editInfoRow(id) {
    ["name","block","super","mobile","total","admit","remark"].forEach(fld => {
        document.getElementById(`${fld}-text-${id}`).style.display = "none";
        document.getElementById(`${fld}-input-${id}`).style.display = "block";
    });

    // ---------------- Organization Type dropdown ----------------
    const orgText = document.getElementById(`org-text-${id}`);
    const orgSelect = document.getElementById(`org-input-${id}`);
    const orgSnoHidden = document.getElementById(`orgType-sno-${id}`);
	
	

    // Hide text, show select
    orgText.style.display = "none";
    orgSelect.style.display = "block";
	 

    // Load options dynamically
    fetch("/api/Information/OrganizationDropdown")
        .then(res => res.json())
        .then(data => {
            orgSelect.innerHTML = `<option value="">Select Organization Type</option>`;
            data.forEach(item => {
                const selected = item.sno == orgSnoHidden.value ? "selected" : "";
                orgSelect.innerHTML += `<option value="${item.sno}" ${selected}>${item.organizationType}</option>`;
            });
        })
        .catch(err => console.error(err));

    // Change button to save
    const btn = document.getElementById(`edit-btn-${id}`);
    btn.innerText = "Save";
    btn.onclick = () => updateInfoRow(id);
}


async function updateInfoRow(id) {
   const payload = {
       sno: document.getElementById(`org-input-${id}`).value,
       organizationName: document.getElementById(`name-input-${id}`).value.trim(),
       block: document.getElementById(`block-input-${id}`).value.trim(),
       hostelSuperintendent: document.getElementById(`super-input-${id}`).value.trim(),
       mobileNo: document.getElementById(`mobile-input-${id}`).value.trim(),
       totalSeat: parseInt(document.getElementById(`total-input-${id}`).value),
       admittedSeat: parseInt(document.getElementById(`admit-input-${id}`).value),
       remark: document.getElementById(`remark-input-${id}`).value.trim(),
       remark2: ""
   };

   try {
       const res = await fetch(`${API_BASE}/Information/${id}`, {
           method: "PUT",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(payload)
       });

       if (!res.ok) {
           const err = await res.json();
           throw new Error(err.message || "Update failed");
       }

       alert("Updated successfully");

       // Update text fields
       ["name","block","super","mobile","total","admit","remark"].forEach(fld => {
           const input = document.getElementById(`${fld}-input-${id}`);
           const text = document.getElementById(`${fld}-text-${id}`);
           text.innerText = input.value;
           text.style.display = "block";
           input.style.display = "none";
       });

       // Update organization type
       const orgText = document.getElementById(`org-text-${id}`);
       const orgSelect = document.getElementById(`org-input-${id}`);
       orgText.innerText = orgSelect.options[orgSelect.selectedIndex].text;
       orgText.style.display = "block";
       orgSelect.style.display = "none";

       // Reset button
       const btn = document.getElementById(`edit-btn-${id}`);
       btn.innerText = "Edit";
       btn.onclick = () => editInfoRow(id);

   } catch (err) {
       alert(err.message);
   }
}


function openViewAllModal() {
    closeModal(); // close info form modal
    const modal = document.getElementById("viewAllModal");
    modal.style.display = "block";
    document.getElementById("modalOverlay").style.display = "block";

    loadAllInformation(); // populate table
}

function closeViewAllModal() {
    document.getElementById("viewAllModal").style.display = "none";
    document.getElementById("modalOverlay").style.display = "none";
    openModal("infoModal"); // go back to info form
}
function filterInfoTable() {
    const input = document.getElementById("infoSearch");
    const filter = input.value.toLowerCase();
    const table = document.getElementById("infoTableBody");
    const rows = table.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        let rowText = rows[i].innerText.toLowerCase();
        if (rowText.includes(filter)) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

//--------------------------------- information close -------------------------------------------



// -------------------------------------------------------------------------------------
//--------------------------------------------- Month start ------------------------------------------------------------------
	let monthlyCapturedPhotos = {};
	let monthlyStream = null;
 document.addEventListener("DOMContentLoaded", () => {
    const orgTypeDropdown = document.getElementById("organizationTypeDropdown");
    const orgNameDropdown = document.getElementById("organizationNameDropdown");

    // Inputs
    const blockInput = document.getElementById("blockInput");
    const admittedSeatsInput = document.getElementById("admittedSeatsInput");
    const monthInput = document.getElementById("monthInput");
    const yearInput = document.getElementById("yearInput");
    const amountInput = document.getElementById("amountInput");
    const totalInput = document.getElementById("totalInput");
    const photo1Input = document.getElementById("photo1Input");
    const photo2Input = document.getElementById("photo2Input");
    const remarkInput = document.getElementById("remarkInput");
    const monthlyForm = document.getElementById("monthlyForm");

    // -------------------------------
    // Load Organization Types
    // -------------------------------
    fetch('/api/Information/OrganizationDropdown')
        .then(res => res.json())
        .then(data => {
            orgTypeDropdown.innerHTML = '<option value="">Select Organization Type</option>';
            data.forEach(org => {
                const option = document.createElement("option");
                option.value = org.organizationType;  // Use type as value
                option.text = org.organizationType;
                orgTypeDropdown.add(option);
            });
        });

    // -------------------------------
    // Load Organization Names when type changes
    // -------------------------------
    orgTypeDropdown.addEventListener("change", () => {
        const selectedType = orgTypeDropdown.value;

        if (!selectedType) {
            orgNameDropdown.innerHTML = '<option value="">Select Organization Name</option>';
            return;
        }

        fetch(`/api/Information/organization-names/by-type/${encodeURIComponent(selectedType)}`)
            .then(res => res.json())
            .then(names => {
                orgNameDropdown.innerHTML = '<option value="">Select Organization Name</option>';
                names.forEach(name => {
                    const option = document.createElement("option");
                    option.value = name;
                    option.text = name;
                    orgNameDropdown.add(option);
                });
            });
    });

    // -------------------------------
    // Calculate Total dynamically
    // -------------------------------
    function updateTotal() {
        const admitted = parseFloat(admittedSeatsInput.value) || 0;
        const amount = parseFloat(amountInput.value) || 0;
        totalInput.value = admitted * amount;
    }

    admittedSeatsInput.addEventListener("input", updateTotal);
    amountInput.addEventListener("input", updateTotal);

// -------------------------------
// Handle Form Submit
// -------------------------------
monthlyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("OrganizationType", orgTypeDropdown.value);
    formData.append("OrganizationName", orgNameDropdown.value);
    formData.append("Block", blockInput.value);
    formData.append("AdmittedSeat", admittedSeatsInput.value);
    formData.append("Month", monthInput.value);
    formData.append("Year", yearInput.value);
    formData.append("Amount", amountInput.value);
    formData.append("Total", totalInput.value);
    formData.append("Remark", remarkInput.value);
	
// Camera Images (1-5)
for (let i = 1; i <= 5; i++) {

    const remarkValue =
        document.getElementById(`monthlyRemark${i}`)?.value ?? "";

    formData.append(`Remark${i}`, remarkValue);

    if (monthlyPhotoBlobs[i]) {
        formData.append(
            `Photo${i}`,
            monthlyPhotoBlobs[i],
            `photo${i}.jpg`
        );
    }

    if (monthlyHeadcounts && monthlyHeadcounts[i] != null) {
        formData.append(`Headcount${i}`, monthlyHeadcounts[i]);
    }
}

// Upload Images (6-10)
for (let i = 6; i <= 10; i++) {

    const remarkValue =
        document.getElementById(`monthlyRemark${i}`)?.value ?? "";

    formData.append(`Remark${i}`, remarkValue);

    const fileInput = document.getElementById(`monthlyFile${i}`);

    if (fileInput && fileInput.files.length > 0) {
        formData.append(
            `Photo${i}`,
            fileInput.files[0]
        );
    }

    // Headcount
    if (monthlyHeadcounts && monthlyHeadcounts[i] != null) {
        formData.append(`Headcount${i}`, monthlyHeadcounts[i]);
    }
}

    try {
        const response = await fetch(
            "/api/MonthlyCalculation/Add",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || "Failed to add record");
        }

        alert("✅ Monthly record added successfully!");

        monthlyForm.reset();
        totalInput.value = "";

        orgNameDropdown.innerHTML =
            '<option value="">Select Organization Name</option>';

        resetMonthlyCameraSection(); // ✅ reset camera

    } catch (err) {
        console.error(err);
        alert("❌ Error: " + err.message);
    }
});
});


//--------------------------------------------
async function openMonthlyViewAll() {
    // Close monthly modal
    document.getElementById("monthlyModal").style.display = "none";

    // Open view all modal
    document.getElementById("viewAllMonth").style.display = "block";

    // Load data
    const tbody = document.querySelector("#monthlyTable tbody");
    tbody.innerHTML = "";

    try {
        const res = await fetch("/api/MonthlyCalculation/GetAll");
        const data = await res.json();
data.forEach(record => {

   // Build dynamic photo dropdown (supports up to 10 photos)
let photoOptions = "";

for (let i = 1; i <= 10; i++) {

    const photoPath = record["photo" + i];
const remarkText = record["remark" + i];

if (photoPath) {
    const fullUrl = resolvePhotoUrl(photoPath);
    const headcount = record["headCount" + i]; // ✅ FIXED

    photoOptions += `
        <option value="${fullUrl}" 
                data-remark="${remarkText ?? ''}" 
                data-headcount="${headcount ?? 0}">
            Photo ${i} 
            ${remarkText ? "- " + remarkText : ""} 
            ${headcount != null ? "| 👥 " + headcount : ""}
        </option>
    `;
}
}

const photoDropdown = photoOptions
    ? `
        <select onchange="viewPhoto(this)">
            <option value="">Select Photo</option>
            ${photoOptions}
        </select>
      `
    : "No Photos";

    tbody.innerHTML += `
    <tr id="row-${record.monSno}"
    ${Array.from({length:10}, (_,i)=>`
        data-photo${i+1}="${record["photo"+(i+1)] ?? ""}"
        data-remark${i+1}="${record["remark"+(i+1)] ?? ""}"
    `).join("")}
>
        <td>${record.monSno}</td>

        <td>
            <span id="type-text-${record.monSno}">${record.organizationType}</span>
        </td>

        <td>
            <span id="name-text-${record.monSno}">${record.organizationName}</span>
        </td>

        <td>
            <span id="block-text-${record.monSno}">${record.block ?? ""}</span>
            <input id="block-input-${record.monSno}" value="${record.block ?? ""}" style="display:none">
        </td>

        <td>
            <span id="admit-text-${record.monSno}">${record.admittedSeat ?? ""}</span>
            <input id="admit-input-${record.monSno}" type="number" value="${record.admittedSeat ?? ""}" style="display:none">
        </td>

        <td>${record.month}</td>
        <td>${record.year}</td>

        <td>
            <span id="amount-text-${record.monSno}">${record.amount}</span>
            <input id="amount-input-${record.monSno}" type="number" value="${record.amount}" style="display:none">
        </td>

        <td>
            <span id="total-text-${record.monSno}">${record.total}</span>
        </td>

        <td>
            <span id="remark-text-${record.monSno}">${record.remark ?? ""}</span>
            <input id="remark-input-${record.monSno}" value="${record.remark ?? ""}" style="display:none">
        </td>

         <td>
    ${photoDropdown}
</td>

       <td>
    <button onclick="editMonthlyRow(${record.monSno})">Edit</button>
    <button onclick="deleteMonthlyRow(${record.monSno})" class="danger-btn">Delete</button>
</td>

    </tr>`;
});



    } catch (err) {
        alert("Failed to load monthly data");
        console.error(err);
    }
}
function backFromMonthlyView() {
    document.getElementById("viewAllMonth").style.display = "none";
    document.getElementById("monthlyModal").style.display = "block";
}
 

 
let editMonthlyStreams = {};
let editMonthlyCapturedPhotos = {};
function editRow(id) {
    ["block", "admit", "amount", "remark"].forEach(f => {
        document.getElementById(`${f}-text-${id}`).style.display = "none";
        document.getElementById(`${f}-input-${id}`).style.display = "inline";
    });

    const btn = document.getElementById(`edit-btn-${id}`);
    btn.innerText = "Save";
    btn.onclick = () => updateRow(id);
}
const months = [
 "January","February","March","April","May","June",
 "July","August","September","October","November","December"
];

async function editMonthlyRow(id) {

    const row = document.getElementById(`row-${id}`);

    const orgTypeCell = row.children[1];
    const orgNameCell = row.children[2];
    const blockCell = row.children[3];
    const admitCell = row.children[4];
    const monthCell = row.children[5];
    const yearCell = row.children[6];
    const amountCell = row.children[7];
    const totalCell = row.children[8];
    const remarkCell = row.children[9];
   // -------------------------
// Photo + Remark Edit (10)
// -------------------------
const photoCell = row.children[10];

let photoEditorHTML = `
<div style="max-height:400px; overflow-y:auto; padding:8px;">
`;

for (let i = 1; i <= 10; i++) {

    const existingPhoto = row.getAttribute(`data-photo${i}`) || "";
    const existingRemark = row.getAttribute(`data-remark${i}`) || "";

    let imageControls = "";

    if (i <= 5) {

        imageControls = `
            <button type="button"
                    onclick="openEditMonthlyCamera(${i}, ${id})">
                Open Camera
            </button>

            <video id="edit-video-${i}-${id}"
                   width="150"
                   autoplay
                   style="display:none;">
            </video>

            <canvas id="edit-canvas-${i}-${id}"
                    style="display:none;">
            </canvas>

            <button type="button"
                    onclick="captureEditMonthlyPhoto(${i}, ${id})">
                Capture
            </button>

            <img id="edit-preview-${i}-${id}"
                 width="80"
                 style="display:none;">
        `;

    } else {

        imageControls = `
            <input type="file"
                   id="edit-file-${i}-${id}"
                   accept="image/*">

            <img id="edit-preview-${i}-${id}"
                 width="80"
                 style="display:none;">
        `;
    }

    photoEditorHTML += `
        <div style="margin-bottom:8px; border-bottom:1px solid #ddd; padding:6px;">

            ${existingPhoto
                ? `<img src="${resolvePhotoUrl(existingPhoto)}" width="60"><br>`
                : ""}

            ${imageControls}

            <input type="text"
                   id="edit-remark-${i}-${id}"
                   value="${existingRemark}"
                   placeholder="Remark ${i}">
        </div>
    `;
}
photoEditorHTML += `</div>`;
photoCell.innerHTML = photoEditorHTML;
const actionCell = row.children[11]; // action column

    const currentType = orgTypeCell.innerText.trim();
    const currentName = orgNameCell.innerText.trim();

    // -------------------------
    // Organization Type dropdown
    // -------------------------
    const typeSelect = document.createElement("select");
    const types = await fetch(
        "/api/Information/OrganizationDropdown"
    ).then(r => r.json());

    types.forEach(t => {
        const opt = new Option(t.organizationType, t.organizationType);
        if (t.organizationType === currentType) opt.selected = true;
        typeSelect.appendChild(opt);
    });

    orgTypeCell.innerHTML = "";
    orgTypeCell.appendChild(typeSelect);

    // -------------------------
    // Organization Name dropdown
    // -------------------------
    const nameSelect = document.createElement("select");
    orgNameCell.innerHTML = "";
    orgNameCell.appendChild(nameSelect);

    async function loadNames(type) {
        nameSelect.innerHTML = "";
        const names = await fetch(
            `/api/Information/organization-names/by-type/${encodeURIComponent(type)}`
        ).then(r => r.json());

        names.forEach(n => {
            const opt = new Option(n, n);
            if (n === currentName) opt.selected = true;
            nameSelect.appendChild(opt);
        });
    }

    await loadNames(currentType);
    typeSelect.onchange = () => loadNames(typeSelect.value);

    // -------------------------
    // Block
    // -------------------------
    blockCell.innerHTML = `<input type="text" value="${blockCell.innerText}">`;

    // -------------------------
    // Admitted Seats
    // -------------------------
    admitCell.innerHTML = `<input type="number" value="${admitCell.innerText}">`;

    // -------------------------
    // Month
    // -------------------------
    const monthSelect = document.createElement("select");
    months.forEach(m => {
        const opt = new Option(m, m);
        if (m === monthCell.innerText.trim()) opt.selected = true;
        monthSelect.appendChild(opt);
    });
    monthCell.innerHTML = "";
    monthCell.appendChild(monthSelect);

    // -------------------------
    // Year
    // -------------------------
    yearCell.innerHTML = `<input type="number" value="${yearCell.innerText}">`;

    // -------------------------
    // Amount
    // -------------------------
    amountCell.innerHTML = `<input type="number" value="${amountCell.innerText}">`;

    // -------------------------
    // Total (auto)
    // -------------------------
    totalCell.innerHTML = `<input type="number" readonly>`;

    // auto calculate total
    function updateTotal() {
        const admit = parseFloat(admitCell.querySelector("input").value) || 0;
        const amt = parseFloat(amountCell.querySelector("input").value) || 0;
        totalCell.querySelector("input").value = admit * amt;
    }

    admitCell.querySelector("input").oninput = updateTotal;
    amountCell.querySelector("input").oninput = updateTotal;
    updateTotal();

    // -------------------------
    // Remark
    // -------------------------
    remarkCell.innerHTML = `<textarea>${remarkCell.innerText}</textarea>`;

     
    // -------------------------
    // Action buttons
    // -------------------------
    actionCell.innerHTML = `
        <button onclick="saveMonthlyRow(${id})">Save</button>
        <button onclick="cancelMonthlyEdit()">Cancel</button>
    `;
}


async function saveMonthlyRow(id) {
	stopAllEditMonthlyCameras();
    const row = document.getElementById(`row-${id}`);

    const formData = new FormData();
    formData.append("MonSno", id);
    formData.append("OrganizationType", row.children[1].querySelector("select").value);
    formData.append("OrganizationName", row.children[2].querySelector("select").value);
    formData.append("Month", row.children[5].querySelector("select").value);
    formData.append("Year", row.children[6].querySelector("input").value);
    formData.append("Block", row.children[3].querySelector("input")?.value ?? "");
    formData.append("AdmittedSeat", row.children[4].querySelector("input")?.value ?? "");
    formData.append("Amount", row.children[7].querySelector("input")?.value ?? "");
    formData.append("Remark", row.children[9].querySelector("textarea")?.value ?? "");

   // 🔥 Handle 10 photo + remark updates
// 🔥 Handle 10 photo + remark updates
for (let i = 1; i <= 10; i++) {

    const remarkInput = document.getElementById(`edit-remark-${i}-${id}`);
    const key = `${i}-${id}`;

    // ✅ PHOTO
    if (i <= 5) {

    if (editMonthlyCapturedPhotos[key]) {

        const base64 = editMonthlyCapturedPhotos[key];
        const blob = await (await fetch(base64)).blob();

        formData.append(
            `Photo${i}`,
            blob,
            `photo${i}.jpg`
        );
    }

} else {

    const fileInput =
        document.getElementById(`edit-file-${i}-${id}`);

    if (fileInput && fileInput.files.length > 0) {

        formData.append(
            `Photo${i}`,
            fileInput.files[0]
        );
    }
}

    // ✅ REMARK
    if (remarkInput) {
        formData.append(`Remark${i}`, remarkInput.value.trim());
    }

    // ✅ HEADCOUNT (IMPORTANT)
    if (window.editMonthlyHeadcounts && window.editMonthlyHeadcounts[key] != null) {
        formData.append(`Headcount${i}`, window.editMonthlyHeadcounts[key]);
    }
}    

    try {
        const res = await fetch("/api/MonthlyCalculation/Update", {
            method: "PUT",
            body: formData
        });

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            alert("Update failed: " + (err?.message ?? res.statusText));
            return;
        }

        alert("Updated successfully");
        openMonthlyViewAll(); // reload table
    } catch (err) {
        console.error(err);
        alert("Update failed: " + err.message);
    }
}

function cancelMonthlyEdit() {
    openMonthlyViewAll();
stopAllEditMonthlyCameras();	// reload table data
}

async function deleteRow(id) {
    if (!confirm("Delete this record?")) return;

    const res = await fetch(
        `/api/MonthlyCalculation/Delete/${id}`,
        { method: "DELETE" }
    );

    if (res.ok) {
        document.getElementById(`row-${id}`).remove();
        alert("Deleted successfully");
    } else {
        alert("Delete failed");
    }
}
function filterMonthlyTable() {
    const searchValue = document
        .getElementById("tableSearch")
        .value
        .toLowerCase();

    const rows = document.querySelectorAll("#monthlyTable tbody tr");

    rows.forEach(row => {
        let rowText = "";

        // search these columns
        const searchableColumns = [1, 2, 3, 5, 6, 9];

        searchableColumns.forEach(index => {
            rowText += row.children[index].innerText.toLowerCase() + " ";
        });

        row.style.display = rowText.includes(searchValue)
            ? ""
            : "none";
    });
}
async function deleteMonthlyRow(id) {
    if (!confirm("Delete this record?")) return;

    try {
        const res = await fetch(
            `/api/MonthlyCalculation/Delete/${id}`,
            { method: "DELETE" }
        );

        if (res.ok) {
            document.getElementById(`row-${id}`).remove();
            alert("Deleted successfully");
        } else {
            const err = await res.json().catch(() => null);
            alert("Delete failed: " + (err?.message ?? res.statusText));
        }
    } catch (err) {
        console.error(err);
        alert("Delete failed: " + err.message);
    }
}

document.addEventListener("click", function (e) {

    if (e.target && e.target.id === "monthlyCancelBtn") {

        document.getElementById("monthlyModal").style.display = "none";

        const form = document.getElementById("monthlyForm");
        if (form) form.reset();

        const upload = document.getElementById("monthlyUploadSection");
        if (upload) upload.style.display = "none";
		resetMonthlyCameraSection(); 
    }
	 
});
let monthlyLocation = "";
let monthlyPhotoBlobs = {};
// -------------------------
// MONTHLY CAMERA FUNCTIONS
// -------------------------

async function openMonthlyCamera() {

    const video = document.getElementById("monthlyVideo");

    try {
        monthlyStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        video.srcObject = monthlyStream;
        video.play();

        getMonthlyLocation(); // ✅ fetch location

    } catch (error) {
        console.error("Camera error:", error);
        alert("Camera access denied or not working");
    }
}
function getMonthlyLocation() {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            monthlyLocation =
                `Lat: ${pos.coords.latitude.toFixed(5)}, ` +
                `Lng: ${pos.coords.longitude.toFixed(5)}`;
        },
        () => {
            monthlyLocation = "Location unavailable";
        }
    );
}

function captureMonthlyPhoto(index) {

    const video = document.getElementById("monthlyVideo");
    const canvas = document.getElementById("monthlyCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 1️⃣ Draw image
    ctx.drawImage(video, 0, 0);

    // 2️⃣ Date time
    const dateTime = new Date().toLocaleString();

    // 3️⃣ Background
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(10, canvas.height - 70, canvas.width - 20, 60);

    // 4️⃣ Text
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(dateTime, 20, canvas.height - 40);
    ctx.fillText(monthlyLocation, 20, canvas.height - 15);

    // 5️⃣ Convert to Blob (IMPORTANT)
    canvas.toBlob(blob => {

        if (!blob) {
            console.error("❌ Blob creation failed");
            document.getElementById(`monthlyHeadcount${index}`).textContent = "❌ Capture failed";
            return;
        }

        console.log("✅ Blob created:", blob);

        // store blob
        monthlyPhotoBlobs[index] = blob;

        // preview
        const preview = document.getElementById(`monthlyPreview${index}`);
        preview.src = URL.createObjectURL(blob);
        preview.style.display = "block";

        // show loading
        document.getElementById(`monthlyHeadcount${index}`).textContent = "⏳ Detecting...";

        // detect headcount
        detectMonthlyHeadcount(blob, index);

    }, "image/jpeg");
}
async function detectMonthlyHeadcount(blob, index) {

    try {

        const formData = new FormData();
        formData.append("image", blob, "photo.jpg");

        const res = await fetch("/api/headcount", {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            document.getElementById(`monthlyHeadcount${index}`).textContent = "❌ Detection failed";
            return;
        }

        const data = await res.json();

        // ✅ 1. SHOW ON UI
        document.getElementById(`monthlyHeadcount${index}`).textContent =
            `👥 People: ${data.count}`;

        // ✅ 2. STORE IN GLOBAL OBJECT (IMPORTANT)
        if (!window.monthlyHeadcounts) {
            window.monthlyHeadcounts = {};
        }

        monthlyHeadcounts[index] = data.count;

        console.log("Headcount stored:", monthlyHeadcounts);

    } catch (err) {
        console.error("Headcount error:", err);
        document.getElementById(`monthlyHeadcount${index}`).textContent =
            "⚠️ Service unavailable";
    }
}

function resetMonthlyCameraSection() {

    // clear blobs
    monthlyPhotoBlobs = {};

    // stop camera
    if (monthlyStream) {
        monthlyStream.getTracks().forEach(track => track.stop());
        monthlyStream = null;
    }

    // clear previews + headcount
    for (let i = 1; i <= 10; i++) {

        const preview = document.getElementById(`monthlyPreview${i}`);
        const hc = document.getElementById(`monthlyHeadcount${i}`);

        if (preview) {
            preview.src = "";
            preview.style.display = "none";
        }

        if (hc) {
            hc.textContent = "";
        }
    }
}

async function openEditMonthlyCamera(index, rowId) {

    const video = document.getElementById(`edit-video-${index}-${rowId}`);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        editMonthlyStreams[`${index}-${rowId}`] = stream;

        video.style.display = "block";
        video.srcObject = stream;
        video.play();

    } catch (err) {
        alert("Camera error: " + err.message);
    }
}

function captureEditMonthlyPhoto(index, rowId) {

    const video = document.getElementById(`edit-video-${index}-${rowId}`);
    const canvas = document.getElementById(`edit-canvas-${index}-${rowId}`);
    const preview = document.getElementById(`edit-preview-${index}-${rowId}`);

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const currentTime = new Date().toLocaleString();

    navigator.geolocation.getCurrentPosition(async function (pos) {

        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        // Draw frame
        ctx.drawImage(video, 0, 0);

        // Background
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(10, canvas.height - 90, canvas.width - 20, 80);

        // Text
        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "yellow";

        ctx.fillText("Time: " + currentTime, 20, canvas.height - 60);
        ctx.fillText("Lat: " + latitude.toFixed(6), 20, canvas.height - 40);
        ctx.fillText("Lng: " + longitude.toFixed(6), 20, canvas.height - 20);

        const imageData = canvas.toDataURL("image/jpeg");

        // show preview
        preview.src = imageData;
        preview.style.display = "block";

        // store image
        const key = `${index}-${rowId}`;
        editMonthlyCapturedPhotos[key] = imageData;

        // ✅ STOP CAMERA
        if (editMonthlyStreams[key]) {
            editMonthlyStreams[key].getTracks().forEach(t => t.stop());
        }
        video.style.display = "none";

        // ===================================================
        // ✅ NEW: AUTO HEADCOUNT DETECTION
        // ===================================================

        try {
            const blob = await (await fetch(imageData)).blob();

            // show loading
            preview.title = "⏳ Detecting...";

            const formData = new FormData();
            formData.append("image", blob, "photo.jpg");

            const res = await fetch("/api/headcount", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                preview.title = "❌ Detection failed";
                return;
            }

            const data = await res.json();

            // ✅ STORE HEADCOUNT
            if (!window.editMonthlyHeadcounts) {
                window.editMonthlyHeadcounts = {};
            }

            editMonthlyHeadcounts[key] = data.count;

            // ✅ SHOW ON IMAGE (tooltip)
            preview.title = "👥 " + data.count;

            console.log("Edit Headcount:", editMonthlyHeadcounts);

        } catch (err) {
            console.error("Edit headcount error:", err);
            preview.title = "⚠️ Detection failed";
        }

    }, function () {
        alert("Location permission required.");
    });
}
function stopAllEditMonthlyCameras() {

    for (const key in editMonthlyStreams) {

        if (editMonthlyStreams[key]) {
            editMonthlyStreams[key].getTracks().forEach(track => track.stop());
        }
    }

    editMonthlyStreams = {};
}
// -------------------------------------------------------------------------------------
//--------------------------------------------- Month close  ------------------------------------------------------------------
//-------------------------------year------------------------------------------
let yearlyCapturedPhotos = {};
let yearlyStream = null;
 

const BASE_URL = "/api/Information";

// Bind Yearly Modal dropdowns dynamically
function bindYearlyDropdowns() {
    const orgType = document.getElementById("yearlyOrgType");
    const orgName = document.getElementById("yearlyOrgName");

    if (!orgType || !orgName) {
        console.error("Yearly dropdowns not found!");
        return;
    }

    if (orgType.dataset.loaded === "true") return; // prevent duplicate load

    fetch(`${BASE_URL}/OrganizationDropdown`)
        .then(res => res.json())
        .then(data => {
            orgType.innerHTML = `<option value="">Select Organization Type</option>`;
            data.forEach(item => {
                const option = document.createElement("option");
                option.value = item.organizationType.trim();
                option.textContent = item.organizationType;
                orgType.appendChild(option);
            });
            orgType.dataset.loaded = "true";
            console.log("Organization Types Loaded:", data);
        })
        .catch(err => {
            console.error("Error loading organization types:", err);
            alert("Failed to load organization types");
        });

    orgType.addEventListener("change", () => {
        const selectedType = orgType.value;

        orgName.innerHTML = `<option value="">Select Organization Name</option>`;
        orgName.disabled = true;

        if (!selectedType) return;

        fetch(`${BASE_URL}/organization-names/by-type/${encodeURIComponent(selectedType)}`)
            .then(res => res.json())
            .then(data => {
                if (!data || data.length === 0) {
                    orgName.innerHTML = `<option value="">No names available</option>`;
                    orgName.disabled = true;
                    return;
                }

                data.forEach(name => {
                    const option = document.createElement("option");
                    option.value = name;
                    option.textContent = name;
                    orgName.appendChild(option);
                });

                orgName.disabled = false;
            })
            .catch(err => {
                console.error("Error loading organization names:", err);
                alert("Failed to load organization names");
            });
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const yearlyForm = document.getElementById("yearlyForm");
    bindYearlyDropdowns();

    const viewAllBtn = document.getElementById("yearlyViewAllBtn");
    if (viewAllBtn) viewAllBtn.addEventListener("click", openYearlyViewAll);

    if (!yearlyForm) return;

yearlyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const orgType = document.getElementById("yearlyOrgType").value.trim();
    const orgName = document.getElementById("yearlyOrgName").value.trim();
    const block = (document.getElementById("yearlyBlock").value || "").trim();
    const year = document.getElementById("year").value.trim();
    const total = document.getElementById("total").value.trim();

    // ✅ validation
    if (!orgType || !orgName || !year || !total) {
        alert("Please fill required fields!");
        return;
    }

    const formData = new FormData();

    formData.append("OrganizationType", orgType);
    formData.append("OrganizationName", orgName);
    formData.append("Block", block);
    formData.append("Year", year);
    formData.append("Total", total);

   // Camera Images (1-5)
for (let i = 1; i <= 5; i++) {

    const remarkValue =
        document.getElementById(`yearlyRemark${i}`)?.value ?? "";

    formData.append(`Remark${i}`, remarkValue);

    if (yearlyPhotoBlobs[i]) {
        formData.append(
            `Photo${i}`,
            yearlyPhotoBlobs[i],
            `photo${i}.jpg`
        );
    }

    if (window.yearlyHeadcounts &&
        yearlyHeadcounts[i] != null) {

        formData.append(
            `HeadCount${i}`,
            yearlyHeadcounts[i]
        );
    }
}

// Upload Images (6-10)
for (let i = 6; i <= 10; i++) {

    const remarkValue =
        document.getElementById(`yearlyRemark${i}`)?.value ?? "";

    formData.append(`Remark${i}`, remarkValue);

    const fileInput =
        document.getElementById(`yearlyFile${i}`);

    if (fileInput && fileInput.files.length > 0) {

        formData.append(
            `Photo${i}`,
            fileInput.files[0]
        );
    }

    if (window.yearlyHeadcounts &&
        yearlyHeadcounts[i] != null) {

        formData.append(
            `HeadCount${i}`,
            yearlyHeadcounts[i]
        );
    }
}

    // debug
    console.log("Submitting Yearly Record:");
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }

    try {
        const res = await fetch(
            "/api/YearlyCalculation/add",
            {
                method: "POST",
                body: formData
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message || "Failed to add yearly record");
        }

        alert("✅ Yearly record added successfully!");

        yearlyForm.reset();
        document.getElementById("yearlyOrgName").disabled = true;

        resetYearlyCameraSection(); // ✅ reset camera

    } catch (err) {
        console.error(err);
        alert("❌ Error: " + err.message);
    }
});
});

const BASE_YEARLY_URL = "/api/YearlyCalculation";

// Open Yearly View All Modal
async function openYearlyViewAll() {
    const yearlyModal = document.getElementById("yearlyModal");
    yearlyModal.style.display = "none";

    const viewModal = document.getElementById("viewAllYearly");
    viewModal.style.display = "block";

    const tbody = document.querySelector("#yearlyTable tbody");
    tbody.innerHTML = "";

    try {
        const res = await fetch("/api/YearlyCalculation/getall");
        const data = await res.json();

        data.forEach(record => {
            // Build dynamic photo dropdown (supports up to 10 photos)
let photoOptions = "";

for (let i = 1; i <= 10; i++) {

    const photoPath = record["photo" + i];
    const remarkText = record["remark" + i];

    if (photoPath) {
        const fullUrl = resolvePhotoUrl(photoPath);
       const headcount = record["headCount" + i]; // ✅ correct case

photoOptions += `
   <option value="${fullUrl}" 
           data-remark="${remarkText ?? ''}" 
           data-headcount="${headcount ?? 0}">
        Photo ${i} 
        ${remarkText ? "- " + remarkText : ""}
        ${headcount != null ? "| 👥 " + headcount : ""}
    </option>
`;
    }
}

const photoDropdown = photoOptions
    ? `
        <select onchange="viewPhoto(this)">
            <option value="">Select Photo</option>
            ${photoOptions}
        </select>
      `
    : "No Photos";


            tbody.innerHTML += `
            <tr id="year-row-${record.yearSno}"
${Array.from({length:10}, (_,i)=>`
    data-photo${i+1}="${record["photo"+(i+1)] ?? ""}"
    data-remark${i+1}="${record["remark"+(i+1)] ?? ""}"
`).join("")}
>
                <td>${record.yearSno}</td>
                <td>
                    <span id="type-text-${record.yearSno}">${record.organizationType}</span>
                    <select id="type-input-${record.yearSno}" style="display:none;"></select>
                </td>
                <td>
                    <span id="name-text-${record.yearSno}">${record.organizationName}</span>
                    <select id="name-input-${record.yearSno}" style="display:none;"></select>
                </td>
                <td>
                    <span id="block-text-${record.yearSno}">${record.block ?? ""}</span>
                    <input type="text" id="block-input-${record.yearSno}" value="${record.block ?? ""}" style="display:none;">
                </td>
                <td>
                    <span id="year-text-${record.yearSno}">${record.year}</span>
                    <input type="number" id="year-input-${record.yearSno}" value="${record.year}" style="display:none;">
                </td>
                <td>
                    <span id="total-text-${record.yearSno}">${record.total}</span>
                    <input type="number" id="total-input-${record.yearSno}" value="${record.total}" style="display:none;">
                </td>
                <td>
                    <span id="remark-text-${record.yearSno}">${record.remark ?? ""}</span>
                    <textarea id="remark-input-${record.yearSno}" style="display:none;">${record.remark ?? ""}</textarea>
                </td>
				<td class="photo-cell">
    ${photoDropdown}
</td>

                <td>
                    <button id="edit-btn-${record.yearSno}" onclick="editYearRow(${record.yearSno})">Edit</button>
                    <button onclick="deleteYearRow(${record.yearSno})" class="danger-btn">Delete</button>
                </td>
            </tr>`;
        });

    } catch (err) {
        console.error(err);
        alert("Failed to load yearly data");
    }
}


   
 
 

// ---------------------------
// Delete Yearly Row
// ---------------------------
async function deleteYearRow(yearSno) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        const res = await fetch(`/api/YearlyCalculation/delete/${yearSno}`, {
            method: "DELETE"
        });

        if (res.ok) {
            alert("Deleted successfully");
            const row = document.getElementById(`year-row-${yearSno}`);
            if (row) row.remove();
        } else if (res.status === 404) {
            alert("Record not found");
        } else {
            const err = await res.json();
            alert("Delete failed: " + (err.message || "Unknown error"));
        }
    } catch (err) {
        console.error(err);
        alert("Delete failed: " + err.message);
    }
}



// ---------------------------
// Search/Filter Table
// ---------------------------
function filterYearlyTable() {
    const input = document.getElementById("yearlySearch").value.toLowerCase();
    const rows = document.querySelectorAll("#yearlyTable tbody tr");
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? "" : "none";
    });
}

// ---------------------------
// Close Yearly View Modal
// ---------------------------
function closeYearlyView() {
    document.getElementById("viewAllYearly").style.display = "none";
    document.getElementById("yearlyModal").style.display = "block"; // go back to form
}

// ---------------------------
// TODO: Edit Yearly Row Inline
// ---------------------------
// ---------------------------
// Edit Yearly Row Inline (All columns editable)
// ---------------------------
let editYearlyStreams = {};
let editYearlyCapturedPhotos = {}; // 🔥 ADD THIS
function editYearRow(yearSno) {
    const row = document.getElementById(`year-row-${yearSno}`);

    // Hide all span texts, show inputs
    ["type", "name", "block", "year", "total", "remark"].forEach(field => {
        document.getElementById(`${field}-text-${yearSno}`).style.display = "none";
        document.getElementById(`${field}-input-${yearSno}`).style.display = "block";
    });

    // Populate type/name dropdowns
    const currentType = document.getElementById(`type-text-${yearSno}`).innerText;
    const currentName = document.getElementById(`name-text-${yearSno}`).innerText;
    populateOrgDropdowns(yearSno, currentType, currentName);

    // Replace photo columns with file inputs
   // ---------------------------
// Replace photo column with 10 photo + remark editors
// ---------------------------
const photoCell = row.querySelector(".photo-cell");

if (!photoCell) {
    console.error("Photo cell not found!");
    return;
} // photo column index

let photoEditorHTML = `
<div style="max-height:400px; overflow-y:auto; padding:8px;">
`;

for (let i = 1; i <= 10; i++) {

    const existingPhoto = row.getAttribute(`data-photo${i}`) || "";
    const existingRemark = row.getAttribute(`data-remark${i}`) || "";

    let imageControls = "";

    // Camera Images 1-5
    if (i <= 5) {

        imageControls = `
            <button type="button"
                    onclick="openYearEditCamera(${yearSno}, ${i})">
                Open Camera
            </button>

            <video id="year-edit-video-${yearSno}-${i}"
                   width="200"
                   autoplay
                   style="display:none;">
            </video>

            <button type="button"
                    onclick="captureYearEditPhoto(${yearSno}, ${i})">
                Capture
            </button>

            <img id="year-edit-preview-${yearSno}-${i}"
                 width="120"
                 style="display:none;">
        `;

    }
    // Upload Images 6-10
    else {

        imageControls = `
            <input type="file"
                   id="year-edit-file-${yearSno}-${i}"
                   accept="image/*">

            <img id="year-edit-preview-${yearSno}-${i}"
                 width="120"
                 style="display:none;">
        `;
    }

    photoEditorHTML += `
        <div style="margin-bottom:8px; border-bottom:1px solid #ddd; padding:6px;">

            ${existingPhoto
                ? `<img src="${resolvePhotoUrl(existingPhoto)}" width="60"><br>`
                : ""}

            ${imageControls}

            <input type="text"
                   id="year-edit-remark-${i}-${yearSno}"
                   value="${existingRemark}"
                   placeholder="Remark ${i}">
        </div>
    `;
}
photoEditorHTML += `</div>`;
photoCell.innerHTML = photoEditorHTML;

    // Change Edit button to Save
    const btn = document.getElementById(`edit-btn-${yearSno}`);
    btn.innerText = "Save";
    btn.onclick = () => updateYearRow(yearSno);
}

// ---------------------------
// Update Yearly Row after Edit
// ---------------------------
async function updateYearRow(yearSno) {

    stopAllYearEditCameras();

    const type = document.getElementById(`type-input-${yearSno}`).value;
    const name = document.getElementById(`name-input-${yearSno}`).value;
    const block = document.getElementById(`block-input-${yearSno}`).value;
    const year = document.getElementById(`year-input-${yearSno}`).value;
    const total = document.getElementById(`total-input-${yearSno}`).value;
    const remark = document.getElementById(`remark-input-${yearSno}`).value;

    const formData = new FormData();
    formData.append("YearSno", yearSno);
    formData.append("OrganizationType", type);
    formData.append("OrganizationName", name);
    formData.append("Block", block);
    formData.append("Year", year);
    formData.append("Total", total);
    formData.append("Remark", remark);

    // 🔥 Handle 10 photo + remark + headcount
    for (let i = 1; i <= 10; i++) {

        const key = `${i}-${yearSno}`;
        const remarkInput = document.getElementById(`year-edit-remark-${i}-${yearSno}`);
      if (i <= 5) {

    const data = editYearlyCapturedPhotos[key];

    if (data) {

        const blob = await (await fetch(data.photo)).blob();

        formData.append(`Photo${i}`, blob, `photo${i}.jpg`);

        formData.append(`Photo${i}Time`, data.time ?? "");
        formData.append(`Photo${i}Latitude`, data.latitude ?? "");
        formData.append(`Photo${i}Longitude`, data.longitude ?? "");

        if (data.headcount != null) {
            formData.append(`HeadCount${i}`, data.headcount);
        }
    }

}
else {

    const fileInput =
        document.getElementById(`year-edit-file-${yearSno}-${i}`);

    if (fileInput && fileInput.files.length > 0) {

        formData.append(
            `Photo${i}`,
            fileInput.files[0]
        );
    }
}

        // ✅ always send remark
        if (remarkInput) {
            formData.append(`Remark${i}`, remarkInput.value.trim());
        }
    }

    try {

        const res = await fetch(`${BASE_YEARLY_URL}/update`, {
            method: "PUT",
            body: formData
        });

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.message || "Failed to update");
        }

        alert("✅ Updated successfully!");
        openYearlyViewAll();

    } catch (err) {
        console.error(err);
        alert("❌ Update failed: " + err.message);
    }
}


async function populateOrgDropdowns(yearSno, currentType, currentName) {
    const typeSelect = document.getElementById(`type-input-${yearSno}`);
    const nameSelect = document.getElementById(`name-input-${yearSno}`);

    // Load Organization Types
    const resTypes = await fetch("/api/Information/OrganizationDropdown");
    const typesData = await resTypes.json();

    typeSelect.innerHTML = '';
    typesData.forEach(item => {
        const option = document.createElement("option");
        option.value = item.organizationType.trim();
        option.textContent = item.organizationType;
        if (item.organizationType.trim() === currentType) option.selected = true;
        typeSelect.appendChild(option);
    });

    // Load Organization Names for current type
    await loadOrgNames(yearSno, currentType, currentName);

    // When type changes, reload names
    typeSelect.addEventListener("change", async () => {
        await loadOrgNames(yearSno, typeSelect.value, null);
    });
}

async function loadOrgNames(yearSno, orgType, selectedName) {
    const nameSelect = document.getElementById(`name-input-${yearSno}`);
    nameSelect.innerHTML = `<option value="">Select Organization Name</option>`;
    nameSelect.disabled = true;

    if (!orgType) return;

    const resNames = await fetch(`/api/Information/organization-names/by-type/${encodeURIComponent(orgType)}`);
    const namesData = await resNames.json();

    namesData.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        if (name === selectedName) option.selected = true;
        nameSelect.appendChild(option);
    });

    nameSelect.disabled = false;
}

document.addEventListener("click", function (e) {

    if (e.target && e.target.id === "yearlyCancelBtn") {

        document.getElementById("yearlyModal").style.display = "none";

        const form = document.getElementById("yearlyForm");
        if (form) form.reset();

        const upload = document.getElementById("yearlyUploadSection");
        if (upload) upload.style.display = "none";
		resetYearlyCameraSection();
    }

});
// -------------------------
// YEARLY CAMERA FUNCTIONS
// -------------------------
let yearlyLocation = "";
let yearlyPhotoBlobs = {}; // also needed if not already declared
async function openYearlyCamera() {

    const video = document.getElementById("yearlyVideo");

    try {
        yearlyStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        video.srcObject = yearlyStream;
        video.play();

        getYearlyLocation(); // ✅ get GPS

    } catch (error) {
        console.error("Camera error:", error);
        alert("Camera access denied or not working");
    }
}

function getYearlyLocation() {

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            yearlyLocation =
                `Lat: ${pos.coords.latitude.toFixed(5)}, ` +
                `Lng: ${pos.coords.longitude.toFixed(5)}`;
        },
        () => {
            yearlyLocation = "Location unavailable";
        }
    );
}

function captureYearlyPhoto(index) {

    const video = document.getElementById("yearlyVideo");
    const canvas = document.getElementById("yearlyCanvas");
    const ctx = canvas.getContext("2d");

    if (!video.videoWidth) {
        alert("Camera not ready");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw frame
    ctx.drawImage(video, 0, 0);

    // Date time
    const dateTime = new Date().toLocaleString();

    // Background
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(10, canvas.height - 70, canvas.width - 20, 60);

    // Text
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(dateTime, 20, canvas.height - 40);
    ctx.fillText(yearlyLocation || "Location unavailable", 20, canvas.height - 15);

    // Convert to blob
    canvas.toBlob(blob => {

        if (!blob) {
            console.error("❌ Blob creation failed");
            document.getElementById(`yearlyHeadcount${index}`).textContent = "❌ Capture failed";
            return;
        }

        console.log("✅ Blob created:", blob);

        // ✅ store blob
        yearlyPhotoBlobs[index] = blob;

        // preview
        const preview = document.getElementById(`yearlyPreview${index}`);
        preview.src = URL.createObjectURL(blob);
        preview.style.display = "block";

        // loading text
        document.getElementById(`yearlyHeadcount${index}`).textContent = "⏳ Detecting...";

        // detect headcount
        detectYearlyHeadcount(blob, index);

    }, "image/jpeg", 0.8); // compressed for faster API
}
async function detectYearlyHeadcount(blob, index) {

    try {

        const formData = new FormData();
        formData.append("image", blob, "photo.jpg");

        const res = await fetch("/api/headcount", {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            document.getElementById(`yearlyHeadcount${index}`).textContent = "❌ Detection failed";
            return;
        }

        const data = await res.json();

        document.getElementById(`yearlyHeadcount${index}`).textContent =
            `👥 People: ${data.count}`;
			
			// ✅ STORE
if (!window.yearlyHeadcounts) {
    window.yearlyHeadcounts = {};
}
yearlyHeadcounts[index] = data.count;

    } catch (err) {
        console.error("Headcount error:", err);
        document.getElementById(`yearlyHeadcount${index}`).textContent =
            "⚠️ Service unavailable";
    }
}

function resetYearlyCameraSection() {

    yearlyPhotoBlobs = {};

    if (yearlyStream) {
        yearlyStream.getTracks().forEach(track => track.stop());
        yearlyStream = null;
    }

    for (let i = 1; i <= 10; i++) {

        const preview = document.getElementById(`yearlyPreview${i}`);
        const hc = document.getElementById(`yearlyHeadcount${i}`);

        if (preview) {
            preview.src = "";
            preview.style.display = "none";
        }

        if (hc) {
            hc.textContent = "";
        }
    }

    const uploadSection = document.getElementById("yearlyUploadSection");
    if (uploadSection) uploadSection.style.display = "none";
}

async function openYearEditCamera(yearSno, index) {

    stopAllYearEditCameras(); // stop previous cameras

    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
    });

    editYearlyStreams[`${yearSno}-${index}`] = stream;

    const video = document.getElementById(`year-edit-video-${yearSno}-${index}`);
    video.srcObject = stream;
    video.style.display = "block";
}

function captureYearEditPhoto(yearSno, index) {

    const video = document.getElementById(`year-edit-video-${yearSno}-${index}`);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const currentTime = new Date().toLocaleString();

    navigator.geolocation.getCurrentPosition(function (pos) {

        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        ctx.drawImage(video, 0, 0);

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(10, canvas.height - 90, canvas.width - 20, 80);

        ctx.font = "bold 18px Arial";
        ctx.fillStyle = "yellow";

        ctx.fillText("Time: " + currentTime, 20, canvas.height - 60);
        ctx.fillText("Lat: " + latitude.toFixed(6), 20, canvas.height - 40);
        ctx.fillText("Lng: " + longitude.toFixed(6), 20, canvas.height - 20);

        const imageData = canvas.toDataURL("image/jpeg");

        // 🔥 STORE LIKE MONTHLY
        editYearlyCapturedPhotos[`${index}-${yearSno}`] = {
            photo: imageData,
            time: currentTime,
            latitude: latitude,
            longitude: longitude
        };

        const preview = document.getElementById(`year-edit-preview-${yearSno}-${index}`);
        preview.src = imageData;
        preview.style.display = "block";

        stopAllYearEditCameras();

    }, function () {
        alert("Location permission required.");
    });
}
function stopAllYearEditCameras() {

    for (const key in editYearlyStreams) {

        if (editYearlyStreams[key]) {
            editYearlyStreams[key].getTracks().forEach(track => track.stop());
        }
    }

    document.querySelectorAll("[id^='year-edit-video-']").forEach(video => {
        video.style.display = "none";
    });

    editYearlyStreams = {};
}
//------------------------year close-----------------------------------------------------
  
//-------------------------import----------------------------------
async function importExcel() {
    const fileInput = document.getElementById("excelFile");

    if (!fileInput || fileInput.files.length === 0) {
        alert("Please select an Excel file");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]); // MUST be "file"

    try {
        const response = await fetch(`${API_BASE}/Information/ImportExcel`, {
            method: "POST",
            body: formData   // ❌ DO NOT set headers
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(data);
            alert(data.message || "Import failed");
            return;
        }

        alert(`✅ Imported successfully\nRecords added: ${data.addedRecords}`);

        fileInput.value = "";
    } catch (error) {
        console.error(error);
        alert("❌ Server error while importing");
    }
}
//--------------------------import close ----------------------------------
//------------------infra startt--------------------------------------------------
let infraCapturedPhotos = {};
let infraStream = null;
let editInfraStreams = {};
let editInfraCapturedPhotos = {}; // 🔥 ADD THIS
document.addEventListener("DOMContentLoaded", () => {

    const orgTypeDropdown = document.getElementById("infraOrgType");
    const orgNameDropdown = document.getElementById("infraOrgName");

    const blockInput = document.getElementById("infraBlock");
    const monthInput = document.getElementById("infraMonth");
    const yearInput = document.getElementById("infraYear");
    const totalInput = document.getElementById("infraTotal");
    const remarkInput = document.getElementById("infraRemark");
    const infraForm = document.getElementById("infraForm");


    // ================================
    // LOAD ORGANIZATION TYPES
    // ================================
    fetch('/api/Information/OrganizationDropdown')
        .then(res => res.json())
        .then(data => {
            orgTypeDropdown.innerHTML = '<option value="">Select Organization Type</option>';
            data.forEach(org => {
                const option = document.createElement("option");
                option.value = org.organizationType;
                option.text = org.organizationType;
                orgTypeDropdown.add(option);
            });
        });


    // ================================
// LOAD ORGANIZATION NAMES BY TYPE
// ================================
orgTypeDropdown.addEventListener("change", async () => {

    const selectedType = orgTypeDropdown.value;

    // Reset dropdown
    orgNameDropdown.innerHTML = '<option value="">Loading...</option>';
    orgNameDropdown.disabled = true;

    if (!selectedType) {
        orgNameDropdown.innerHTML = '<option value="">Select Organization Name</option>';
        orgNameDropdown.disabled = true;
        return;
    }

    try {

        const response = await fetch(
            `/api/Information/organization-names/by-type/${encodeURIComponent(selectedType)}`
        );

        if (!response.ok) throw new Error("Failed to fetch names");

        const names = await response.json();

        orgNameDropdown.innerHTML = '<option value="">Select Organization Name</option>';

        names.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            orgNameDropdown.appendChild(option);
        });

        orgNameDropdown.disabled = false;

    } catch (error) {
        console.error(error);
        orgNameDropdown.innerHTML = '<option value="">Failed to load names</option>';
    }
});


    // ================================
    // SUBMIT FORM
    // ================================
    infraForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const formData = new FormData();

        formData.append("OrganizationType", orgTypeDropdown.value);
        formData.append("OrganizationName", orgNameDropdown.value);
        formData.append("Block", blockInput.value);
        formData.append("Month", monthInput.value);
        formData.append("Year", yearInput.value);
        formData.append("Total", totalInput.value);
        formData.append("Remark", remarkInput.value);

        // 🔥 Loop 10 Photos + Remarks
        // 🔥 Send 10 captured photos
// Camera Images (1-5)
for (let i = 1; i <= 5; i++) {

    const remarkValue =
        document.getElementById(`infraRemark${i}`)?.value ?? "";

    formData.append(`Remark${i}`, remarkValue);

    if (infraCapturedPhotos[i]) {

        const base64 = infraCapturedPhotos[i].photo;

        const blob = await (await fetch(base64)).blob();

        formData.append(`Photo${i}`, blob, `photo${i}.jpg`);
        formData.append(`Photo${i}Time`, infraCapturedPhotos[i].time);
        formData.append(`Photo${i}Latitude`, infraCapturedPhotos[i].latitude);
        formData.append(`Photo${i}Longitude`, infraCapturedPhotos[i].longitude);
    }
}

// Upload Images (6-10)
for (let i = 6; i <= 10; i++) {

    const remarkValue =
        document.getElementById(`infraRemark${i}`)?.value ?? "";

    formData.append(`Remark${i}`, remarkValue);

    const fileInput =
        document.getElementById(`infraFile${i}`);

    if (fileInput && fileInput.files.length > 0) {

        formData.append(
            `Photo${i}`,
            fileInput.files[0]
        );
    }
}

        try {

            const response = await fetch(
                "/api/MonthlyInfrastructure/Add",
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => null);
                throw new Error(err?.message || "Failed to add record");
            }

            alert("Infrastructure record added successfully!");
            infraForm.reset();
			resetInfraCameraSection();

        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        }
    });

});
function closeInfraModal() {
    const modal = document.getElementById("infraModal");
    modal.style.display = "none";
}

// ===============================
// OPEN INFRA VIEW ALL
// ===============================
document.getElementById("infraViewAllBtn").addEventListener("click", openInfraViewAll);

async function openInfraViewAll() {

    document.getElementById("infraModal").style.display = "none";
    document.getElementById("viewAllInfra").style.display = "block";

    const tbody = document.querySelector("#infraTable tbody");
    tbody.innerHTML = "";

    try {
        const res = await fetch("/api/MonthlyInfrastructure/GetAll");
        const data = await res.json();

        data.forEach(record => {

            let photoOptions = "";

            for (let i = 1; i <= 10; i++) {

                const photoPath = record["photo" + i];
                const remarkText = record["remark" + i];

                if (photoPath) {
                    const fullUrl = resolvePhotoUrl(photoPath);
                   photoOptions += `
    <option 
        value="${fullUrl}" 
        data-remark="${remarkText ?? ''}">
        Photo ${i} ${remarkText ? "- " + remarkText : ""}
    </option>
`;
                }
            }

            const photoDropdown = photoOptions
                ? `
                    <select onchange="viewPhoto(this)">
                        <option value="">Select Photo</option>
                        ${photoOptions}
                    </select>
                  `
                : "No Photos";

            tbody.innerHTML += `
			<tr id="infra-row-${record.misno}"
			${Array.from({length:10}, (_,i)=>`
				data-photo${i+1}="${record['photo'+(i+1)] ?? ''}"
				data-remark${i+1}="${record['remark'+(i+1)] ?? ''}"
			`).join('')}
		>
                    <td>${record.misno}</td>
                    <td>${record.organizationType}</td>
                    <td>${record.organizationName}</td>
                    <td>${record.block ?? ""}</td>
                    <td>${record.month}</td>
                    <td>${record.year}</td>
                    <td>${record.total}</td>
                    <td>${record.remark ?? ""}</td>
                    <td>${photoDropdown}</td>
                    <td>
                        <button onclick="editInfraRow(${record.misno})">Edit</button>
                        <button onclick="deleteInfraRow(${record.misno})">Delete</button>
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        alert("Failed to load infrastructure data");
        console.error(err);
    }
}
function backFromInfraView() {
    document.getElementById("viewAllInfra").style.display = "none";
    document.getElementById("infraModal").style.display = "block";
}

// ==========================================================
// VIEW PHOTO
// ==========================================================
function viewPhoto(selectElement) {

    const selectedOption = selectElement.options[selectElement.selectedIndex];

    if (!selectedOption.value) return;

    const photoUrl = resolvePhotoUrl(selectedOption.value);
    const remark = selectedOption.getAttribute("data-remark") || "";

    // Detect which modal is open
    if (document.getElementById("viewAllInfra")?.style.display === "block") {
        document.getElementById("viewAllInfra").style.display = "none";
        document.getElementById("infraphotoPreviewModal").style.display = "block";
        document.getElementById("previewImage").src = photoUrl;
        document.getElementById("previewRemark").textContent = remark;
    }
    else if (document.getElementById("viewAllYearly")?.style.display === "block") {
        document.getElementById("viewAllYearly").style.display = "none";
        document.getElementById("photoPreviewModal").style.display = "block";
        document.getElementById("photoPreviewImg").src = photoUrl;
    }
    else if (document.getElementById("viewAllMonth")?.style.display === "block") {
        document.getElementById("viewAllMonth").style.display = "none";
        document.getElementById("photoViewModal").style.display = "block";
        document.getElementById("photoPreview").src = photoUrl;
    }

    selectElement.value = "";
}
function closePhotoinfra() {

    document.getElementById("infraphotoPreviewModal").style.display = "none";
	

    // Reopen infra table
    document.getElementById("viewAllInfra").style.display = "block";
}
function closePhotoModal() { document.getElementById("photoViewModal").style.display = "none";
  // Reopen infra table
    document.getElementById("viewAllMonth").style.display = "block";; 
 }
function closePhotoPreview() { document.getElementById("photoPreviewModal").style.display = "none";
 document.getElementById("viewAllYearly").style.display = "block";
 }
// =====================================
// DELETE INFRASTRUCTURE RECORD
// =====================================
async function deleteInfraRow(id) {

    if (!confirm("Are you sure you want to delete this record?")) {
        return;
    }

    try {

        const response = await fetch(
            `/api/MonthlyInfrastructure/delete/${id}`,
            {
                method: "DELETE"
            }
        );

        if (response.ok) {

            // Remove row from table
            const row = document.getElementById(`infra-row-${id}`);
            if (row) {
                row.remove();
            }

            alert("Deleted successfully");

        } else {

            const error = await response.json().catch(() => null);
            alert("Delete failed: " + (error?.message ?? response.statusText));
        }

    } catch (error) {

        console.error("Delete error:", error);
        alert("Delete failed: " + error.message);
    }
}

async function editInfraRow(id) {

    const row = document.getElementById(`infra-row-${id}`);

    const orgTypeCell = row.children[1];
    const orgNameCell = row.children[2];
    const blockCell = row.children[3];
    const monthCell = row.children[4];
    const yearCell = row.children[5];
    const totalCell = row.children[6];
    const remarkCell = row.children[7];
    const photoCell = row.children[8];

let photoEditorHTML = `
<div style="max-height:400px; overflow-y:auto; padding:10px;">
`;

for (let i = 1; i <= 10; i++) {

    const existingPhoto = row.getAttribute(`data-photo${i}`) || "";
    const existingRemark = row.getAttribute(`data-remark${i}`) || "";

    let imageControls = "";

    // Photo 1-5 Camera
    if (i <= 5) {

        imageControls = `
            <button type="button"
                    onclick="openInfraEditCamera(${id}, ${i})">
                Open Camera
            </button>

            <video id="infra-edit-video-${id}-${i}"
                   width="180"
                   autoplay
                   style="display:none; margin-top:5px;">
            </video>

            <button type="button"
                    onclick="captureInfraEditPhoto(${id}, ${i})">
                Capture
            </button>

            <img id="infra-edit-preview-${id}-${i}"
                 width="70"
                 style="display:none; margin-top:5px;">
        `;

    }
    // Photo 6-10 Upload
    else {

        imageControls = `
            <input type="file"
                   id="infra-edit-file-${id}-${i}"
                   accept="image/*">

            <img id="infra-edit-preview-${id}-${i}"
                 width="70"
                 style="display:none; margin-top:5px;">
        `;
    }

    photoEditorHTML += `
        <div style="
            display:flex;
            align-items:flex-start;
            gap:15px;
            padding:12px 0;
            border-bottom:1px solid #ddd;
        ">

            <div>
                ${
                    existingPhoto
                    ? `<img src="${resolvePhotoUrl(existingPhoto)}"
                           style="width:70px;height:70px;
                                  object-fit:cover;
                                  border-radius:50%;
                                  border:1px solid #ccc;">`
                    : `<div style="
                            width:70px;
                            height:70px;
                            border-radius:50%;
                            background:#f0f0f0;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:12px;
                            color:#999;
                        ">
                        No Photo
                       </div>`
                }
            </div>

            <div style="flex:1;">

                ${imageControls}

                <input type="text"
                       id="infra-edit-remark-${i}-${id}"
                       value="${existingRemark}"
                       placeholder="Remark ${i}"
                       style="width:100%; padding:6px;">
            </div>

        </div>
    `;
}

photoEditorHTML += `</div>`;

photoCell.innerHTML = photoEditorHTML;
    const actionCell = row.children[9];

    const currentType = orgTypeCell.innerText.trim();
    const currentName = orgNameCell.innerText.trim();

    // -------------------------
    // Organization Type dropdown
    // -------------------------
    const typeSelect = document.createElement("select");

    const types = await fetch(
        "/api/Information/OrganizationDropdown"
    ).then(r => r.json());

    types.forEach(t => {
        const opt = new Option(t.organizationType, t.organizationType);
        if (t.organizationType === currentType) opt.selected = true;
        typeSelect.appendChild(opt);
    });

    orgTypeCell.innerHTML = "";
    orgTypeCell.appendChild(typeSelect);

    // -------------------------
    // Organization Name dropdown
    // -------------------------
    const nameSelect = document.createElement("select");
    orgNameCell.innerHTML = "";
    orgNameCell.appendChild(nameSelect);

    async function loadNames(type) {
        nameSelect.innerHTML = "";

        const names = await fetch(
            `/api/Information/organization-names/by-type/${encodeURIComponent(type)}`
        ).then(r => r.json());

        names.forEach(n => {
            const opt = new Option(n, n);
            if (n === currentName) opt.selected = true;
            nameSelect.appendChild(opt);
        });
    }

    await loadNames(currentType);
    typeSelect.onchange = () => loadNames(typeSelect.value);

    // -------------------------
    // Other Fields
    // -------------------------
    blockCell.innerHTML = `<input type="text" value="${blockCell.innerText}">`;
    monthCell.innerHTML = `<input type="text" value="${monthCell.innerText}">`;
    yearCell.innerHTML = `<input type="number" value="${yearCell.innerText}">`;
    totalCell.innerHTML = `<input type="number" value="${totalCell.innerText}">`;
    remarkCell.innerHTML = `<textarea>${remarkCell.innerText}</textarea>`;

     

    // -------------------------
    // Action buttons
    // -------------------------
    actionCell.innerHTML = `
        <button onclick="saveInfraRow(${id})">Save</button>
        <button onclick="cancelInfraEdit()">Cancel</button>
    `;
}
function cancelInfraEdit() {

    stopAllInfraEditCameras();
    openInfraViewAll();
}
async function saveInfraRow(id) {
	stopAllInfraEditCameras();

    const row = document.getElementById(`infra-row-${id}`);

    const formData = new FormData();
    formData.append("Misno", id);

    formData.append("OrganizationType", row.children[1].querySelector("select").value);
    formData.append("OrganizationName", row.children[2].querySelector("select").value);
    formData.append("Block", row.children[3].querySelector("input")?.value ?? "");
    formData.append("Month", row.children[4].querySelector("input")?.value ?? "");
    formData.append("Year", row.children[5].querySelector("input")?.value ?? "");
    formData.append("Total", row.children[6].querySelector("input")?.value ?? "");
    formData.append("Remark", row.children[7].querySelector("textarea")?.value ?? "");

    // 🔥 Handle 10 photos + remarks
  for (let i = 1; i <= 10; i++) {

    const key = `${i}-${id}`;
    const remarkInput = document.getElementById(`infra-edit-remark-${i}-${id}`);

   if (i <= 5) {

    if (editInfraCapturedPhotos[key]) {

        const base64 = editInfraCapturedPhotos[key].photo;
        const blob = await (await fetch(base64)).blob();

        formData.append(`Photo${i}`, blob, `photo${i}.jpg`);
        formData.append(`Photo${i}Time`, editInfraCapturedPhotos[key].time);
        formData.append(`Photo${i}Latitude`, editInfraCapturedPhotos[key].latitude);
        formData.append(`Photo${i}Longitude`, editInfraCapturedPhotos[key].longitude);
    }

}
else {

    const fileInput =
        document.getElementById(`infra-edit-file-${id}-${i}`);

    if (fileInput && fileInput.files.length > 0) {

        formData.append(
            `Photo${i}`,
            fileInput.files[0]
        );
    }
}

    if (remarkInput) {
        formData.append(`Remark${i}`, remarkInput.value.trim());
    }
}
    try {

        const res = await fetch(
            "/api/MonthlyInfrastructure/Update",
            {
                method: "PUT",
                body: formData
            }
        );

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            alert("Update failed: " + (err?.message ?? res.statusText));
            return;
        }

        alert("Updated successfully");
        openInfraViewAll();

    } catch (err) {
        console.error(err);
        alert("Update failed: " + err.message);
    }
}
function searchInfraTable() {

    const input = document.getElementById("infraSearchInput");
    const filter = input.value.toLowerCase();

    const rows = document.querySelectorAll("#infraTable tbody tr");

    rows.forEach(row => {

        const rowText = row.innerText.toLowerCase();

        if (rowText.includes(filter)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }

    });
}
document.addEventListener("click", function (e) {

    if (e.target && e.target.id === "infraCancelBtn") {

        document.getElementById("infraModal").style.display = "none";

        const form = document.getElementById("infraForm");
        if (form) form.reset();

        const upload = document.getElementById("infraUploadSection");
        if (upload) upload.style.display = "none";
		resetInfraCameraSection();
    }

});

// -------------------------
// INFRA CAMERA FUNCTIONS
// -------------------------

async function openInfraCamera() {

    infraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
    });

    document.getElementById("infraVideo").srcObject = infraStream;
}

async function captureInfraPhoto(index) {

    const video = document.getElementById("infraVideo");
    const canvas = document.getElementById("infraCanvas");
    const preview = document.getElementById(`infraPreview${index}`);
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    // Get current time
    const currentTime = new Date().toLocaleString();

    // Get location first
    navigator.geolocation.getCurrentPosition(function (pos) {

        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        // 🟢 TEXT STYLE
        ctx.font = "20px Arial";
        ctx.fillStyle = "yellow";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        // 🟢 Draw background box (optional but professional)
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(10, canvas.height - 80, canvas.width - 20, 70);

        // 🟢 Draw text
        ctx.fillStyle = "yellow";
        ctx.fillText("Time: " + currentTime, 20, canvas.height - 55);
        ctx.fillText("Lat: " + latitude.toFixed(6), 20, canvas.height - 35);
        ctx.fillText("Lng: " + longitude.toFixed(6), 20, canvas.height - 15);

        const imageData = canvas.toDataURL("image/jpeg");

        preview.src = imageData;
        preview.style.display = "block";

        infraCapturedPhotos[index] = {
            photo: imageData,
            time: currentTime,
            latitude: latitude,
            longitude: longitude,
            remark: document.getElementById(`infraRemark${index}`)?.value ?? ""
        };

        // Stop camera after capture
        if (infraStream) {
            infraStream.getTracks().forEach(track => track.stop());
        }

    }, function (error) {
        alert("Location permission required.");
    });
}
function resetInfraCameraSection() {

    infraCapturedPhotos = {};

    if (infraStream) {
        infraStream.getTracks().forEach(track => track.stop());
        infraStream = null;
    }

    for (let i = 1; i <= 10; i++) {
        const preview = document.getElementById(`infraPreview${i}`);
        if (preview) {
            preview.src = "";
            preview.style.display = "none";
        }
    }

    const uploadSection = document.getElementById("infraUploadSection");
    if (uploadSection) uploadSection.style.display = "none";
}
async function openInfraEditCamera(id, index) {

    stopAllInfraEditCameras(); // stop previous

    const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
    });

    editInfraStreams[`${id}-${index}`] = stream;

    const video = document.getElementById(`infra-edit-video-${id}-${index}`);
    video.srcObject = stream;
    video.style.display = "block";
}
function captureInfraEditPhoto(id, index) {

    const video = document.getElementById(`infra-edit-video-${id}-${index}`);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const currentTime = new Date().toLocaleString();

    navigator.geolocation.getCurrentPosition(function (pos) {

        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        ctx.drawImage(video, 0, 0);

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(10, canvas.height - 80, canvas.width - 20, 70);

        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "yellow";

        ctx.fillText("Time: " + currentTime, 20, canvas.height - 55);
        ctx.fillText("Lat: " + latitude.toFixed(6), 20, canvas.height - 35);
        ctx.fillText("Lng: " + longitude.toFixed(6), 20, canvas.height - 15);

        const imageData = canvas.toDataURL("image/jpeg");

        // 🔥 STORE EXACTLY LIKE MONTHLY
        editInfraCapturedPhotos[`${index}-${id}`] = {
            photo: imageData,
            time: currentTime,
            latitude: latitude,
            longitude: longitude
        };

        const preview = document.getElementById(`infra-edit-preview-${id}-${index}`);
        preview.src = imageData;
        preview.style.display = "block";

        stopAllInfraEditCameras();

    }, function () {
        alert("Location permission required.");
    });
}
function stopAllInfraEditCameras() {

    for (const key in editInfraStreams) {
        if (editInfraStreams[key]) {
            editInfraStreams[key].getTracks().forEach(track => track.stop());
        }
    }

    document.querySelectorAll("[id^='infra-edit-video-']")
        .forEach(video => video.style.display = "none");

    editInfraStreams = {};
}