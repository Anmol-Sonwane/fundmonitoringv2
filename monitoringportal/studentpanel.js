const API_BASE = "/api/StudentInformation";
const toAssetUrl = resolvePhotoUrl;

function goBack() {
    document.getElementById("viewStudentModal").style.display = "none";
    document.getElementById("studentInfoModal").style.display = "block";
}


// =========================
// SUBMIT FORM
// =========================
document.querySelector("#studentInfoModal form")
    .addEventListener("submit", async function (e) {

        e.preventDefault();

        try {

            const form = e.target;

            // Get inputs
            const inputs = form.querySelectorAll("input, select, textarea");

			const formData = new FormData();
				formData.append("Sno", orgTypeDropdown.value); // ✅ correct

formData.append(
    "OrganizationType",
    orgTypeDropdown.options[orgTypeDropdown.selectedIndex].text // ✅ correct
);
				formData.append("OrganizationName", document.getElementById("orgName").value);
				formData.append("Block", document.getElementById("block").value);
				formData.append("StudentName", document.getElementById("studentName").value);
				formData.append("Dob", document.getElementById("dob").value);
				formData.append("Remark", document.getElementById("remark").value);

				const photo = document.getElementById("photo").files[0];
				if (photo) {
					formData.append("PhotoFile", photo);
			}

            // =========================
            // API CALL
            // =========================
            const response = await fetch(`${API_BASE}/Add`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error occurred");
            }

            alert("Student added successfully ✅");

            console.log(data);

            form.reset();

        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
    });
	
	const orgTypeDropdown = document.getElementById("orgType");
const orgNameDropdown = document.getElementById("orgName");

// -------------------------------
// Load Organization Types
// -------------------------------
async function loadOrganizationTypes() {
    try {
        const res = await fetch("/api/Information/OrganizationDropdown");
        const data = await res.json();

        orgTypeDropdown.innerHTML = '<option value="">Select Organization Type</option>';

        data.forEach(org => {
            const option = document.createElement("option");

            option.value = org.sno;               // ✅ ID goes to Sno
            option.text = org.organizationType;  // ✅ Display text

            orgTypeDropdown.add(option);
        });

    } catch (err) {
        console.error("Error loading organization types:", err);
    }
}

// -------------------------------
// Load Organization Names based on Type
// -------------------------------
orgTypeDropdown.addEventListener("change", async () => {

    const selectedType =
    orgTypeDropdown.options[orgTypeDropdown.selectedIndex].text; // if API unchanged

    if (!selectedType) {
        orgNameDropdown.innerHTML = '<option value="">Select Organization Name</option>';
        return;
    }

    try {
        const res = await fetch(
            `/api/Information/organization-names/by-type/${encodeURIComponent(selectedType)}`
        );

        const names = await res.json();

        orgNameDropdown.innerHTML = '<option value="">Select Organization Name</option>';

        names.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.text = name;
            orgNameDropdown.add(option);
        });

    } catch (err) {
        console.error("Error loading organization names:", err);
    }
});

// -------------------------------
// INITIAL LOAD
// -------------------------------
loadOrganizationTypes();


// =========================
// IMPORT STUDENTS
// =========================
async function importStudents() {

    try {
        const fileInput = document.getElementById("importFile");

        if (!fileInput.files.length) {
            alert("Please select an Excel file");
            return;
        }

        const file = fileInput.files[0];

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_BASE}/import`, {
            method: "POST",
            body: formData
        });

        const result = await response.text();

        if (response.ok) {
            alert(result); // show success + error rows
        } else {
            alert("Import failed: " + result);
        }

    } catch (error) {
        console.error("Import Error:", error);
        alert("Something went wrong during import");
    }
}

//----------------------------------
 
const API = "/api/StudentInformation/GetAll";
const tableBody = document.querySelector("#viewStudentModal tbody");

// ============================
// LOAD ALL STUDENTS
// ============================
async function loadStudents() {
    try {
        const res = await fetch(API);
        const data = await res.json();

        tableBody.innerHTML = "";

        data.forEach(student => {

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${student.sissno}</td>
                <td contenteditable="false">${student.studentName || ""}</td>
				  <td>${student.organizationType || ""}</td>
                <td>${student.organizationName || ""}</td>
                <td contenteditable="false">${student.block || ""}</td>
                <td contenteditable="false">${formatDate(student.dob)}</td>

                <td>
                    <img src="${toAssetUrl(student.photo)}" 
                         width="50" height="50" 
                         style="border-radius:6px; object-fit:cover;" />
                </td>

                <td contenteditable="false">${student.remark || ""}</td>

                <td>
                    <button onclick="enableEdit(this, ${student.sissno})">Edit</button>
                    <button onclick="deleteStudent(${student.sissno})">Delete</button>
                </td>
            `;

            tableBody.appendChild(tr);
        });

    } catch (err) {
        console.error("Error loading students:", err);
    }
}

// ============================
// FORMAT DATE
// ============================
function formatDate(date) {
    if (!date) return "";
    return new Date(date).toISOString().split('T')[0];
}

 
function openModal(modalId) {

    // hide all modals first
    document.querySelectorAll(".modal")
        .forEach(m => m.style.display = "none");

    // show selected modal
    document.getElementById(modalId).style.display = "block";

    // =========================
    // Student Modal
    // =========================
    if (modalId === "viewStudentModal") {
        loadStudents();
        loadOrganizationTypesFilter();
    }

    // =========================
    // Health Modal
    // =========================
    if (modalId === "viewHealthModal") {
        loadHealthTable();
        loadFilterDropdowns();
    }
}
async function deleteStudent(id) {

    if (!confirm("Delete this student?")) return;

    try {

        const res = await fetch(`${API_BASE}/Delete/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const text = await res.text();
            console.log("Delete error:", text);
            alert("Delete failed");
            return;
        }

        alert("Deleted successfully");
        loadStudents();

    } catch (err) {
        console.error("Delete error:", err);
    }
}
 

// =========================
// ENABLE EDIT
// =========================
async function enableEdit(btn, id) {

    const row = btn.closest("tr");
    const cells = row.querySelectorAll("td");

    // ✅ store original values BEFORE changing DOM
    const studentName = cells[1].innerText;
    const orgType = cells[2].innerText;
    const orgName = cells[3].innerText;
    const block = cells[4].innerText;
    const dob = cells[5].innerText;
    const remark = cells[7].innerText;
    const photo = row.dataset.photo || "default.png";

    // =========================
    // Replace with inputs
    // =========================
    cells[1].innerHTML = `<input value="${studentName}" />`;

    cells[2].innerHTML = `<select class="edit-org-type"></select>`;
    cells[3].innerHTML = `<select class="edit-org-name"></select>`;

    cells[4].innerHTML = `<input value="${block}" />`;

    cells[5].innerHTML = `
        <input type="date" value="${formatDateForInput(dob)}" />
    `;

    cells[6].innerHTML = `
        <div style="display:flex; flex-direction:column; gap:5px;">
            <img src="${toAssetUrl(photo)}" 
                 width="50" height="50"
                 style="border-radius:6px; object-fit:cover;" />
            <input type="file" class="edit-photo" />
        </div>
    `;

    cells[7].innerHTML = `<input value="${remark}" />`;

    // =========================
    // Load dropdowns
    // =========================
    await loadOrgTypesForEdit(row, orgType, orgName);

    // =========================
    // Change button to Save
    // =========================
    btn.innerText = "Save";
    btn.onclick = () => updateStudent(row, id);
}


// =========================
// DATE FORMAT FIX
// =========================
function formatDateForInput(date) {
    if (!date) return "";

    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}


// =========================
// LOAD ORG TYPES
// =========================
async function loadOrgTypesForEdit(row, selectedText, selectedName) {

    const typeSelect = row.querySelector(".edit-org-type");

    const res = await fetch("/api/Information/OrganizationDropdown");
    const data = await res.json();

    typeSelect.innerHTML = `<option value="">Select Type</option>`;

    data.forEach(org => {

        const option = document.createElement("option");
        option.value = org.sno;
        option.text = org.organizationType;

        if (org.organizationType === selectedText) {
            option.selected = true;
        }

        typeSelect.appendChild(option);
    });

    // load names after type
    await loadOrgNamesForEdit(row, selectedName);

    typeSelect.addEventListener("change", () => {
        loadOrgNamesForEdit(row);
    });
}


// =========================
// LOAD ORG NAMES
// =========================
async function loadOrgNamesForEdit(row, selectedName = null) {

    const typeSelect = row.querySelector(".edit-org-type");
    const nameSelect = row.querySelector(".edit-org-name");

    const typeText = typeSelect.options[typeSelect.selectedIndex]?.text;

    if (!typeText) return;

    const res = await fetch(
        `/api/Information/organization-names/by-type/${typeText}`
    );

    const names = await res.json();

    nameSelect.innerHTML = `<option value="">Select Name</option>`;

    names.forEach(n => {

        const option = document.createElement("option");
        option.value = n;
        option.text = n;

        if (n === selectedName) {
            option.selected = true;
        }

        nameSelect.appendChild(option);
    });
}


// =========================
// UPDATE STUDENT
// =========================
async function updateStudent(row, id) {

    const formData = new FormData();

    const typeSelect = row.querySelector(".edit-org-type");
    const nameSelect = row.querySelector(".edit-org-name");
    const fileInput = row.querySelector(".edit-photo");

    // ======================
    // REQUIRED FIELDS
    // ======================
    formData.append("Sissno", id); // 🔥 IMPORTANT (PRIMARY KEY)

    formData.append("StudentName", row.cells[1].querySelector("input").value);

    formData.append("Sno", typeSelect.value || "");

    formData.append("OrganizationName", nameSelect.value || "");

    formData.append("Block", row.cells[4].querySelector("input").value || "");

    formData.append("Remark", row.cells[7].querySelector("input").value || "");

    // ======================
    // FIX DATE FORMAT (IMPORTANT FOR DATEONLY)
    // ======================
    const dobValue = row.cells[5].querySelector("input").value;

    if (dobValue) {
        formData.append("Dob", dobValue); // "yyyy-MM-dd"
    }

    // ======================
    // PHOTO
    // ======================
    if (fileInput.files.length > 0) {
        formData.append("PhotoFile", fileInput.files[0]);
    }

    try {

        const res = await fetch(`${API_BASE}/Update/${id}`, {
            method: "PUT",
            body: formData
        });

        const text = await res.text();
        console.log("SERVER RESPONSE:", text);

        if (!res.ok) {
            alert(text || "Update failed");
            return;
        }

        alert("Updated successfully ✅");
        loadStudents();

    } catch (err) {
        console.error("Update error:", err);
    }
}


const filterType = document.getElementById("filterOrgType");
const filterName = document.getElementById("filterOrgName");

// make sure tableBody exists
//const tableBody = document.querySelector("#tableBody");

async function loadOrganizationTypesFilter() {
    const res = await fetch("/api/Information/OrganizationDropdown");
    const data = await res.json();

    filterType.innerHTML = '<option value="">All Types</option>';

    data.forEach(org => {
        const option = document.createElement("option");
        option.value = org.organizationType;
        option.text = org.organizationType;
        filterType.appendChild(option);
    });
}


// =======================
// TYPE CHANGE
// =======================
filterType.addEventListener("change", async () => {

    const type = filterType.value;

    // reset names when type changes
    filterName.innerHTML = '<option value="">All Names</option>';

    if (type) {
        const res = await fetch(
            `/api/Information/organization-names/by-type/${type}`
        );

        const names = await res.json();

        names.forEach(n => {
            const option = document.createElement("option");
            option.value = n;
            option.text = n;
            filterName.appendChild(option);
        });
    }

    filterTable(); // always filter table after change
});


// =======================
// NAME CHANGE
// =======================
filterName.addEventListener("change", filterTable);


// =======================
// MAIN FILTER FUNCTION
// =======================
function filterTable() {

    const type = filterType.value.trim().toLowerCase();
    const name = filterName.value.trim().toLowerCase();

    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(row => {

        const orgType = (row.cells[2]?.innerText || "").trim().toLowerCase();
        const orgName = (row.cells[3]?.innerText || "").trim().toLowerCase();

        let show = true;

        // ✅ FIX: exact match instead of includes
        if (type && orgType !== type) {
            show = false;
        }

        if (name && orgName !== name) {
            show = false;
        }

        row.style.display = show ? "" : "none";
    });
}
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", function () {
    const keyword = this.value.trim().toLowerCase();

    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(row => {

        // combine all columns text
        const rowText = row.innerText.toLowerCase();

        // show row if match found anywhere
        if (rowText.includes(keyword)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
});

//------------------------------
//------------------------------
//-------------------------------
 // Get dropdowns
const healthorgTypeDropdown = document.getElementById("healthOrgType");
const healthorgNameDropdown = document.getElementById("healthOrgName");

// -------------------------------
// Load Organization Types
// -------------------------------
async function healthloadOrganizationTypes() {
    try {
        const res = await fetch("/api/Information/OrganizationDropdown");
        const data = await res.json();

        healthorgTypeDropdown.innerHTML = '<option value="">Select Organization Type</option>';

        data.forEach(org => {
            const option = document.createElement("option");

            option.value = org.sno;               // ID
            option.text = org.organizationType;  // Text

            healthorgTypeDropdown.appendChild(option);
        });

    } catch (err) {
        console.error("Error loading organization types:", err);
    }
}

// -------------------------------
// Load Organization Names based on Type
// -------------------------------
healthorgTypeDropdown.addEventListener("change", async () => {

    const selectedType =
        healthorgTypeDropdown.options[healthorgTypeDropdown.selectedIndex].text;

    if (!selectedType) {
        healthorgNameDropdown.innerHTML = '<option value="">Select Organization Name</option>';
        return;
    }

    try {
        const res = await fetch(
            `/api/Information/organization-names/by-type/${encodeURIComponent(selectedType)}`
        );

        const names = await res.json();

        healthorgNameDropdown.innerHTML = '<option value="">Select Organization Name</option>';

        names.forEach(name => {
            const option = document.createElement("option");

            option.value = name;
            option.text = name;

            healthorgNameDropdown.appendChild(option);
        });

    } catch (err) {
        console.error("Error loading organization names:", err);
    }
});

// -------------------------------
// Call function on page load
// -------------------------------
healthloadOrganizationTypes();

const studentList = document.getElementById("studentList");

healthorgNameDropdown.addEventListener("change", async () => {

    const orgType =
        healthorgTypeDropdown.options[healthorgTypeDropdown.selectedIndex].text;

    const orgName =
        healthorgNameDropdown.options[healthorgNameDropdown.selectedIndex].text;

    if (!orgType || !orgName) return;

    try {
        const res = await fetch(
            `/api/StudentInformation/GetStudentNames?orgType=${encodeURIComponent(orgType)}&orgName=${encodeURIComponent(orgName)}`
        );

        const students = await res.json();

        studentList.innerHTML = "";

        students.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            studentList.appendChild(option);
        });

    } catch (err) {
        console.error(err);
    }
});

const studentInput = document.getElementById("healthStudentInput");
const blockInput = document.getElementById("healthBlock");
const dobInput = document.getElementById("healthDob");

// ------------------------------------
// Auto-fill Block + DOB on student select
// ------------------------------------
studentInput.addEventListener("change", async () => {

    const orgType =
        healthorgTypeDropdown.options[healthorgTypeDropdown.selectedIndex].text;

    const orgName =
        healthorgNameDropdown.options[healthorgNameDropdown.selectedIndex].text;

    const studentName = studentInput.value;

    if (!orgType || !orgName || !studentName) return;

    try {
        const res = await fetch(
            `/api/StudentInformation/GetStudentDetails?orgType=${encodeURIComponent(orgType)}&orgName=${encodeURIComponent(orgName)}&studentName=${encodeURIComponent(studentName)}`
        );

        if (!res.ok) {
            blockInput.value = "";
            dobInput.value = "";
            return;
        }

        const data = await res.json();

        // Fill Block
        blockInput.value = data.block || "";

        // Fill DOB (yyyy-MM-dd format for input type="date")
        if (data.dob) {
            const date = new Date(data.dob);
            dobInput.value = date.toISOString().split("T")[0];
        } else {
            dobInput.value = "";
        }

    } catch (err) {
        console.error("Error fetching student details:", err);
    }
});

//---------------------
//-----------
 

 


// ----------------------
// BMI Calculation
// ----------------------
document.addEventListener("DOMContentLoaded", () => {

    const weightInput = document.getElementById("weight");
    const heightInput = document.getElementById("height");
    const bmiInput = document.getElementById("bmi");

    function calculateBMI() {

        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);

        if (!isNaN(weight) && !isNaN(height) && weight > 0 && height > 0) {

            const bmi = weight / (height * height);
            bmiInput.value = bmi.toFixed(2);

            // 🎯 Color logic
            if (bmi >= 18.5 && bmi <= 24.9) {
                bmiInput.style.color = "green";   // Normal
            } else {
                bmiInput.style.color = "red";     // Not normal
            }

            // Optional bold
            bmiInput.style.fontWeight = "bold";

        } else {
            bmiInput.value = "";
            bmiInput.style.color = "black";
        }
    }

    weightInput.addEventListener("input", calculateBMI);
    heightInput.addEventListener("input", calculateBMI);

});

//--------------------------
//------------------------
document.querySelector("#studentHealthModal form")
.addEventListener("submit", async function (e) {

    e.preventDefault();

    try {

        const orgTypeEl = document.getElementById("healthOrgType");
        const orgNameEl = document.getElementById("healthOrgName");

        const orgType = orgTypeEl.options[orgTypeEl.selectedIndex]?.text;
        const orgName = orgNameEl.options[orgNameEl.selectedIndex]?.text;

        const studentName = document.getElementById("healthStudentInput").value.trim();

        const month = document.getElementById("healthMonth").value;
        const year = document.getElementById("healthYear").value;

        const age = document.getElementById("age").value;
        const weight = document.getElementById("weight").value;
        const height = document.getElementById("height").value;
        const bmi = document.getElementById("bmi").value;
        const remark = document.getElementById("healthRemark").value;

        // -------------------------------
        // Basic Validation
        // -------------------------------
        if (!orgType || !orgName || !studentName) {
            alert("Please select organization and student");
            return;
        }

        // -------------------------------
        // Step 1: Get Student ID
        // -------------------------------
        const resStudent = await fetch(
            `/api/StudentInformation/GetStudentByName?orgType=${encodeURIComponent(orgType)}&orgName=${encodeURIComponent(orgName)}&studentName=${encodeURIComponent(studentName)}`
        );

        if (!resStudent.ok) {
            alert("Student not found ❌");
            return;
        }

        const studentData = await resStudent.json();

        if (!studentData || !studentData.sissno) {
            alert("Invalid student data ❌");
            return;
        }

        const sissno = studentData.sissno;

        // -------------------------------
        // Step 2: Prepare Payload
        // -------------------------------
        const payload = {
            sissno: sissno,
            month: month || null,
            year: year || null,
            age: age ? parseInt(age) : null,
            weight: weight ? parseFloat(weight) : null,
            height: height ? parseFloat(height) : null,
            bmi: bmi ? parseFloat(bmi) : null,
            remark: remark || null
        };

        // -------------------------------
        // Step 3: Submit Health Data
        // -------------------------------
        const res = await fetch(
            "/api/StudentHealth/Add",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error("API Error:", errorText);
            alert("Failed to save ❌");
            return;
        }

        // -------------------------------
        // Success
        // -------------------------------
        alert("Health data saved successfully ✅");

        // Reset form
        e.target.reset();

        // Clear BMI color
        document.getElementById("bmi").style.color = "black";

    } catch (err) {
        console.error("Error:", err);
        alert("Something went wrong ❌");
    }
});

//--------
//---------------
//---------------------------

/*function openModal(modalId) {

    document.querySelectorAll(".modal").forEach(m => m.style.display = "none");

    document.getElementById(modalId).style.display = "block";

    // 🔥 Load table when opening view modal
    if (modalId === "viewHealthModal") {
        loadHealthTable();
        loadFilterDropdowns();
    }
}*/

async function loadHealthTable() {

    const tbody = document.getElementById("healthTableBody");

    try {
        const res = await fetch("/api/StudentHealth/GetAll");
        const data = await res.json();

        tbody.innerHTML = "";

        data.forEach(item => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${item.studentName}</td>
                <td>${item.organizationType}</td>
                <td>${item.organizationName}</td>
                <td>${item.block}</td>
                <td>${item.dob ? item.dob.split('T')[0] : ''}</td>
                <td>${item.month}</td>
                <td>${item.year}</td>
                <td>${item.age}</td>
                <td>${item.weight}</td>
                <td>${item.height}</td>
                <td style="color:${item.bmi >= 18.5 && item.bmi <= 24.9 ? 'green' : 'red'}">
                    ${item.bmi}
                </td>
                <td>${item.remark || ''}</td>
                <td>
                    <button onclick="editHealth(this,${item.shsno})">Edit</button>
                    <button onclick="deleteHealth(${item.shsno})">Delete</button>
                </td>
            `;

            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Error loading table:", err);
    }
}

async function loadFilterDropdowns() {

    const typeDropdown = document.getElementById("viewHealthOrgType");
    const nameDropdown = document.getElementById("viewHealthOrgName");

    // Load Org Types
    const res = await fetch("/api/Information/OrganizationDropdown");
    const data = await res.json();

    typeDropdown.innerHTML = '<option value="">All Types</option>';

    data.forEach(x => {
        const opt = document.createElement("option");
        opt.value = x.organizationType;
        opt.text = x.organizationType;
        typeDropdown.appendChild(opt);
    });

    // On change → load names
    typeDropdown.addEventListener("change", async () => {

        const type = typeDropdown.value;

        if (!type) return;

        const res2 = await fetch(
            `/api/Information/organization-names/by-type/${encodeURIComponent(type)}`
        );

        const names = await res2.json();

        nameDropdown.innerHTML = '<option value="">All Names</option>';

        names.forEach(n => {
            const opt = document.createElement("option");
            opt.value = n;
            opt.text = n;
            nameDropdown.appendChild(opt);
        });
    });
}
document.getElementById("viewHealthOrgType")
    .addEventListener("change", filterHealthTable);

document.getElementById("viewHealthOrgName")
    .addEventListener("change", filterHealthTable);

function filterHealthTable() {

    const type = document.getElementById("viewHealthOrgType").value.toLowerCase();
    const name = document.getElementById("viewHealthOrgName").value.toLowerCase();

    const rows = document.querySelectorAll("#healthTableBody tr");

    rows.forEach(row => {

        const orgType = row.children[1].innerText.toLowerCase().trim();
        const orgName = row.children[2].innerText.toLowerCase().trim();

        const matchType = !type || orgType === type;
        const matchName = !name || orgName === name;

        row.style.display = (matchType && matchName)
            ? ""
            : "none";
    });
}
 
async function deleteHealth(id) {

    if (!confirm("Are you sure to delete?")) return;

    try {
        const res = await fetch(
            `/api/StudentHealth/Delete/${id}`,
            { method: "DELETE" }
        );

        if (!res.ok) {
            alert("Delete failed ❌");
            return;
        }

        alert("Deleted successfully ✅");
        loadHealthTable();

    } catch (err) {
        console.error(err);
    }
}

function editHealth(btn, id) {

    const row = btn.closest("tr");
    const cells = row.querySelectorAll("td");

    // =========================
    // KEEP THESE AS TEXT (NO CHANGE)
    // =========================
    const studentName = cells[0].innerText;
    const orgType = cells[1].innerText;
    const orgName = cells[2].innerText;
    const block = cells[3].innerText;
    const dob = cells[4].innerText;

    // =========================
    // ONLY HEALTH FIELDS EDITABLE
    // =========================
    const month = cells[5].innerText;
    const year = cells[6].innerText;
    const age = cells[7].innerText;
    const weight = cells[8].innerText;
    const height = cells[9].innerText;
    const bmi = cells[10].innerText;
    const remark = cells[11].innerText;

    // Keep static columns (just reassign text to avoid overwrite issue)
    cells[0].innerHTML = studentName;
    cells[1].innerHTML = orgType;
    cells[2].innerHTML = orgName;
    cells[3].innerHTML = block;
    cells[4].innerHTML = dob;

    // Editable fields
    cells[5].innerHTML = `<input type="number" id="month_${id}" value="${month}">`;

    cells[6].innerHTML = `<input type="number" id="year_${id}" value="${year}">`;

    cells[7].innerHTML = `<input type="number" id="age_${id}" value="${age}">`;

    cells[8].innerHTML = `<input type="number" id="weight_${id}" value="${weight}" oninput="calcBMI(${id})">`;

    cells[9].innerHTML = `<input type="number" id="height_${id}" value="${height}" oninput="calcBMI(${id})">`;

    cells[10].innerHTML = `<input type="text" id="bmi_${id}" value="${bmi}" readonly>`;

    cells[11].innerHTML = `<input type="text" id="remark_${id}" value="${remark}">`;

    // Action buttons
    cells[12].innerHTML = `
        <button onclick="updateHealth(${id})">Save</button>
        <button onclick="loadHealthTable()">Cancel</button>
    `;
}
function calcBMI(id) {

    let weight = parseFloat(document.getElementById(`weight_${id}`).value);
    let height = parseFloat(document.getElementById(`height_${id}`).value);

    if (weight > 0 && height > 0) {
        let bmi = weight / (height * height);
        document.getElementById(`bmi_${id}`).value = bmi.toFixed(2);
    }
}
async function updateHealth(id, btn) {

    const model = {
        Month: document.getElementById(`month_${id}`).value,
        Year: document.getElementById(`year_${id}`).value,
        Age: document.getElementById(`age_${id}`).value,
        Weight: document.getElementById(`weight_${id}`).value,
        Height: document.getElementById(`height_${id}`).value,
        Bmi: document.getElementById(`bmi_${id}`).value,
        Remark: document.getElementById(`remark_${id}`).value
    };

    try {
        const res = await fetch(`/api/StudentHealth/Update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(model)
        });

        if (res.ok) {
            alert("Updated successfully");
            loadHealthTable(); // refresh only table
        } else {
            alert("Update failed");
        }

    } catch (err) {
        console.error(err);
    }
}

//----------------------
//------------
//----
/*
async function loadHealthTable() {

    const container = document.getElementById("studentTableSection");

    try {
        const res = await fetch("/api/StudentHealth/GetAll");
        const data = await res.json();

        let table = `
        <table border="1" width="100%" style="border-collapse:collapse; text-align:center;">
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Organization Type</th>
                    <th>Organization Name</th>
                    <th>Block</th>
                    <th>DOB</th>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Age</th>
                    <th>Weight</th>
                    <th>Height</th>
                    <th>BMI</th>
                    <th>Remark</th>
                </tr>
            </thead>
            <tbody>
        `;

        data.forEach(item => {
            table += `
                <tr>
                    <td>${item.studentName}</td>
                    <td>${item.organizationType}</td>
                    <td>${item.organizationName}</td>
                    <td>${item.block}</td>
                    <td>${item.dob ? item.dob.split('T')[0] : ''}</td>
                    <td>${item.month}</td>
                    <td>${item.year}</td>
                    <td>${item.age}</td>
                    <td>${item.weight}</td>
                    <td>${item.height}</td>
                    <td style="color:${item.bmi >= 18.5 && item.bmi <= 24.9 ? 'green' : 'red'}">
                        ${item.bmi}
                    </td>
                    <td>${item.remark || ''}</td>
                </tr>
            `;
        });

        table += `
            </tbody>
        </table>
        `;

        container.innerHTML = table;

    } catch (err) {
        console.error("Error loading table:", err);
    }
}

// auto load on page open
window.onload = loadHealthTable;
*/
let healthData = [];
let filteredData = [];

async function loadHealthTabledas() {

    const container = document.getElementById("studentTableSection");

    try {
        const res = await fetch("/api/StudentHealth/GetAll");
        const data = await res.json();

        healthData = data; 
		filteredData = data;// store globally

        renderTable(filteredData);
		loadOrgTypeDropdown();

    } catch (err) {
        console.error("Error loading table:", err);
    }
}
function renderTable(data) {
	
	 updateCount(data);

    const container = document.getElementById("studentTableSection");

    let table = `
        <table border="1" width="100%" style="border-collapse:collapse; text-align:center;">
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Organization Type</th>
                    <th>Organization Name</th>
                    <th>Block</th>
                    <th>DOB</th>
                    <th>Month</th>
                    <th>Year</th>
                    <th>Age</th>
                    <th>Weight</th>
                    <th>Height</th>
                    <th>BMI</th>
                    <th>Remark</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(item => {
        table += `
            <tr>
                <td>${item.studentName}</td>
                <td>${item.organizationType}</td>
                <td>${item.organizationName}</td>
                <td>${item.block}</td>
                <td>${item.dob ? item.dob.split('T')[0] : ''}</td>
                <td>${item.month}</td>
                <td>${item.year}</td>
                <td>${item.age}</td>
                <td>${item.weight}</td>
                <td>${item.height}</td>
                <td style="color:${item.bmi >= 18.5 && item.bmi <= 24.9 ? 'green' : 'red'}">
                    ${item.bmi}
                </td>
                <td>${item.remark || ''}</td>
            </tr>
        `;
    });

    table += `</tbody></table>`;
    container.innerHTML = table;
}
 
function applyFilter() {

    const month = document.getElementById("dashMonth").value;
    const year = document.getElementById("dashYear").value;

    let data = filteredData; // start from current dataset

    if (month) {
        data = data.filter(x => x.month == month);
    }

    if (year) {
        data = data.filter(x => x.year == year);
    }

    renderTable(data);
}
document.getElementById("dashMonth").addEventListener("change", applyFilter);
document.getElementById("dashYear").addEventListener("change", applyFilter);

function filterFit() {
    const filtered = healthData.filter(item =>
        item.bmi >= 18.5 && item.bmi <= 24.9
    );

    renderTable(filtered);
}
function filterUnfit() {
    const filtered = healthData.filter(item =>
        item.bmi < 18.5 || item.bmi > 24.9
    );

    renderTable(filtered);
}
function resetFilter() {

    // reset dropdowns
    document.getElementById("dashMonth").value = "";
    document.getElementById("dashYear").value = "";
    document.getElementById("orgTypeFilter").value = "";
    document.getElementById("orgNameFilter").innerHTML =
        `<option value="">Organization Name</option>`;

    // reset dataset
    filteredData = healthData;

    // reload table
    renderTable(healthData);
}

function updateCount(data) {
    document.getElementById("totalCount").innerText =
        "Total Records: " + data.length;
}
async function loadStudentCount() {
    try {
        const res = await fetch("/api/StudentInformation/GetCount");
        const data = await res.json();

        document.getElementById("totalStudentTable").innerText = data.totalStudents;

    } catch (err) {
        console.error("Error loading count:", err);
    }
}
window.onload = function () {
    loadStudentCount();
	loadHealthTabledas();
};

function loadOrgTypeDropdown() {

    const typeDropdown = document.getElementById("orgTypeFilter");

    typeDropdown.innerHTML = `<option value="">Organization Type</option>`;

    const types = [...new Set(healthData.map(x => x.organizationType))];

    types.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.text = t;
        typeDropdown.appendChild(opt);
    });
}
document.getElementById("orgTypeFilter").addEventListener("change", function () {

    const type = this.value;

    // filter base data
    filteredData = type
        ? healthData.filter(x => x.organizationType === type)
        : healthData;

    renderTable(filteredData);

    loadOrgNameDropdown(filteredData);
});
function loadOrgNameDropdown(data) {

    const nameDropdown = document.getElementById("orgNameFilter");

    nameDropdown.innerHTML = `<option value="">Organization Name</option>`;

    const names = [...new Set(data.map(x => x.organizationName))];

    names.forEach(n => {
        const opt = document.createElement("option");
        opt.value = n;
        opt.text = n;
        nameDropdown.appendChild(opt);
    });
}
document.getElementById("orgNameFilter").addEventListener("change", function () {

    const name = this.value;
    const type = document.getElementById("orgTypeFilter").value;

    let data = healthData;

    if (type) {
        data = data.filter(x => x.organizationType === type);
    }

    if (name) {
        data = data.filter(x => x.organizationName === name);
    }

    filteredData = data;

    renderTable(filteredData);
});
//-------------------------
//-----------------------
//----export-------------------
document.getElementById("exportBtn").addEventListener("click", exportTableToExcel);

function exportTableToExcel() {

    const table = document.getElementById("studentTable");

    const workbook = XLSX.utils.table_to_book(table, {
        sheet: "Students"
    });

    XLSX.writeFile(workbook, "StudentRecords.xlsx");
}