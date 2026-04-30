const BASE_URL = "/api/Nodel";
const BASE = "/api/Nodelentry"; // change if needed
const toAssetUrl = (path) => {
    if (!path) return "";
    const normalized = String(path);
    return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

// Form Submit Event
document.getElementById("nodalForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // prevent page reload

    // Get values
    const nodalName = document.getElementById("nodalName").value;
    const hostelName = document.getElementById("hostelName").value;
    const block = document.getElementById("block").value;
    const totalSeat = document.getElementById("totalSeat").value;

    // Validation
    if (!nodalName || !hostelName || !block || !totalSeat) {
        alert("Please fill all fields");
        return;
    }

    // Create object (same as CommandModel)
    const data = {
        nodelName: nodalName,
        hostelName: hostelName,
        block: block,
        totalSeat: parseInt(totalSeat)
    };

    try {
        const response = await fetch(`${BASE_URL}/Add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Nodel Added Successfully ✅");

            // Clear form
            document.getElementById("nodalForm").reset();

            // Optional: close modal
            closeModal();
        } else {
            alert("Failed to add Nodel ❌");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error occurred!");
    }
});
// Import Excel
document.getElementById("importBtn").addEventListener("click", async function () {
    
    const fileInput = document.getElementById("excelFile");
    
    if (fileInput.files.length === 0) {
        alert("Please select an Excel file 📂");
        return;
    }

    const file = fileInput.files[0];

    // Create FormData (IMPORTANT for file upload)
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/api/Nodel/ImportExcel", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            alert("Excel Imported Successfully ✅");
            fileInput.value = ""; // clear file
        } else {
            alert("Import Failed ❌");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Error uploading file!");
    }
});

const VIEW_API = "/api/Nodel";

// ================= OPEN VIEW MODAL =================
async function openviewNodalModal() {
    document.getElementById("nodalInfoModal").style.display = "none";
    document.getElementById("viewNodalModal").style.display = "block";

    await loadNodelData();
}

// ================= BACK BUTTON =================
function backToForm() {
    document.getElementById("viewNodalModal").style.display = "none";
    document.getElementById("nodalInfoModal").style.display = "block";
}

// ================= LOAD DATA =================
async function loadNodelData() {
    const response = await fetch(`${VIEW_API}/GetAll`);
    const data = await response.json();

    const tbody = document.querySelector("#nodalTable tbody");
    tbody.innerHTML = "";

    data.forEach(item => {
        const row = `
        <tr>
            <td>${item.idNodel}</td>
            <td>${item.nodelName}</td>
            <td>${item.hostelName}</td>
            <td>${item.block}</td>
            <td>${item.totalSeat}</td>
            <td>
    <button onclick="enableEdit(this, ${item.idNodel})">Edit</button>
    <button onclick="deleteRow1(${item.idNodel}, this)">Delete</button>
</td>
        </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ================= DELETE =================
async function deleteRow1(id, btn) {

    console.log("Deleting ID:", id);  // 👈 check this

    if (!confirm("Delete this record?")) return;

    try {
        const res = await fetch(`${VIEW_API}/Delete/${id}`, {
            method: "DELETE"
        });

        console.log("Status:", res.status);

        if (res.ok) {
            alert("Deleted successfully");
            btn.closest("tr").remove();
        } else {
            const msg = await res.text();
            console.log("Error:", msg);
            alert("Delete failed: " + msg);
        }

    } catch (err) {
        console.error(err);
    }
}

// ================= EDIT =================
function editRow(id, name, hostel, block, seat) {

    // Fill form
    document.getElementById("nodalName").value = name;
    document.getElementById("hostelName").value = hostel;
    document.getElementById("block").value = block;
    document.getElementById("totalSeat").value = seat;

    // Switch modal
    backToForm();

    // Change submit to update
    const form = document.getElementById("nodalForm");

    form.onsubmit = async function (e) {
        e.preventDefault();

        const updatedData = {
            nodelName: document.getElementById("nodalName").value,
            hostelName: document.getElementById("hostelName").value,
            block: document.getElementById("block").value,
            totalSeat: parseInt(document.getElementById("totalSeat").value)
        };

        const response = await fetch(`${VIEW_API}/Update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            alert("Updated Successfully ✅");
            form.reset();
            form.onsubmit = null; // reset to normal add
        } else {
            alert("Update Failed ❌");
        }
    };
}

// ================= SEARCH =================
document.getElementById("searchInput").addEventListener("keyup", function () {

    const value = this.value.toLowerCase();
    const rows = document.querySelectorAll("#nodalTable tbody tr");

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(value)
            ? ""
            : "none";
    });

});

// ================= ENABLE INLINE EDIT =================
function enableEdit(btn, id) {

    const row = btn.closest("tr");
    const cells = row.querySelectorAll("td");

    // Store old values
    const nodelName = cells[1].innerText;
    const hostelName = cells[2].innerText;
    const block = cells[3].innerText;
    const totalSeat = cells[4].innerText;

    // Convert to input fields
    cells[1].innerHTML = `<input value="${nodelName}">`;
    cells[2].innerHTML = `<input value="${hostelName}">`;
    cells[3].innerHTML = `<input value="${block}">`;
    cells[4].innerHTML = `<input type="number" value="${totalSeat}">`;

    // Change button to Save
    cells[5].innerHTML = `
        <button onclick="saveRow(this, ${id})">Save</button>
        <button onclick="loadNodelData()">Cancel</button>
    `;
}
// ================= SAVE ROW =================
async function saveRow(btn, id) {

    const row = btn.closest("tr");
    const inputs = row.querySelectorAll("input");

    const updatedData = {
        nodelName: inputs[0].value,
        hostelName: inputs[1].value,
        block: inputs[2].value,
        totalSeat: parseInt(inputs[3].value)
    };

    const response = await fetch(`/api/Nodel/Update/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
    });

    if (response.ok) {
        alert("Updated Successfully ✅");
        loadNodelData(); // reload table
    } else {
        alert("Update Failed ❌");
    }
}
//--------------------------------------------
//--------------------------------------------
 
 

let allNodals = [];
let selectedNodalName = "";
let selectedNodalId = 0;

// ==============================
// LOAD NODAL NAMES
// ==============================
async function loadNodalNames() {
    console.log("API calling...");
    try {
        const res = await fetch(`${BASE_URL}/GetAllNodelName`);
        const data = await res.json();

        console.log("Data received:", data);

        allNodals = data;

        renderNodalDropdown(data);

        // 👇 SHOW DROPDOWN
        //document.getElementById("nodalName").style.display = "block";

    } catch (err) {
        console.error("Error loading nodal names:", err);
    }
}

// ==============================
// RENDER DROPDOWN
// ==============================
function renderNodalDropdown(data) {
    const dropdown = document.getElementById("nodalDropdown");

    dropdown.innerHTML = "";

    if (!data || data.length === 0) {
        dropdown.innerHTML = "<div class='dropdown-item'>No Data</div>";
        return;
    }

    data.forEach(name => {
        const div = document.createElement("div");
        div.className = "dropdown-item";
        div.textContent = name;

        div.onclick = () => {
			selectedNodalName = name; 
            document.getElementById("nodalSearch").value = name;
            dropdown.style.display = "none";
            loadHostelNames(name);
        };

        dropdown.appendChild(div);
    });

    dropdown.style.display = "block";
}

// ==============================
// SEARCH FILTER
// ==============================
document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("nodalSearch").addEventListener("input", function () {
        const searchValue = this.value.toLowerCase();

        const filtered = allNodals.filter(x =>
            x.toLowerCase().includes(searchValue)
        );

        renderNodalDropdown(filtered);
    });

    document.getElementById("nodalSearch").addEventListener("focus", loadNodalNames);

});

// ==============================
// SHOW DROPDOWN ON CLICK
// ==============================
document.getElementById("nodalSearch").addEventListener("focus", loadNodalNames);

// ==============================
// SELECT NODEL → LOAD HOSTELS
// ==============================
 

// ==============================
// HIDE DROPDOWN WHEN CLICK OUTSIDE
// ==============================
document.addEventListener("click", function (e) {
    const searchBox = document.getElementById("nodalSearch");
    const dropdown = document.getElementById("nodalDropdown");
	 const hostelSearch = document.getElementById("hostelSearch");
    const hostelDropdown = document.getElementById("hostelDropdown");

    if (!searchBox.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
    }
	if (!hostelSearch.contains(e.target) && !hostelDropdown.contains(e.target)) {
        hostelDropdown.style.display = "none";
    }
});

// ==============================
// LOAD HOSTEL NAMES
// ==============================
async function loadHostelNames(nodalName) {
    try {
        const res = await fetch(
            `${BASE_URL}/GetHostelByNodel?nodelName=${encodeURIComponent(nodalName)}`
        );

        const data = await res.json();

        console.log("Hostel Data:", data);

        const dropdown = document.getElementById("hostelDropdown");
        const input = document.getElementById("hostelSearch");

        dropdown.innerHTML = "";

        if (!data || data.length === 0) {
            dropdown.innerHTML = "<div class='dropdown-item'>No Data</div>";
            return;
        }

        data.forEach(name => {
            const div = document.createElement("div");
            div.className = "dropdown-item";
            div.textContent = name;

           div.onclick = async () => {
    console.log("✅ Hostel Clicked:", name);

    input.value = name;
    dropdown.style.display = "none";

    await loadBlockSeat(selectedNodalName, name);
};
            dropdown.appendChild(div);
        });

        dropdown.style.display = "block";

    } catch (err) {
        console.error("Error:", err);
    }
}
let latestBlock = "";
let latestSeat = "";

async function loadBlockSeat(nodalName, hostelName) {
    try {
        const res = await fetch(
            `${BASE_URL}/GetBlockSeat?nodalName=${encodeURIComponent(nodalName)}&hostelName=${encodeURIComponent(hostelName)}`
        );

        const data = await res.json();

       console.log("🔥 FULL DATA:", JSON.stringify(data));

        if (!data) return;

        // ✅ IMPORTANT
        selectedNodalId = data.idNodel;    // 🔥 store correct ID
        latestBlock = data.block;
        latestSeat = data.totalSeat;
		console.log("✅ selectedNodalId:", selectedNodalId);
        applyBlockSeat();

    } catch (err) {
        console.error("Error:", err);
    }
}
function applyBlockSeat() {
  const blockInput = document.getElementById("blockInput");
const seatInput = document.getElementById("totalSeatInput");

    console.log("Before set:", blockInput.value, seatInput.value);

    blockInput.value = latestBlock || "";
    seatInput.value = latestSeat || "";

    console.log("After set:", blockInput.value, seatInput.value);
}

 

// ==============================
// GET LOCATION
// ==============================
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                currentLocation = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
                console.log("Location:", currentLocation);
            },
            () => currentLocation = "Location denied"
        );
    }
}

// ==============================
// CAMERA OPEN
// ==============================
let stream = null;
let photoBlob1 = null;
let photoBlob2 = null;
let currentLocation = "Fetching location...";

async function openCamera() {
    const video = document.getElementById("video");

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        video.srcObject = stream;
        video.play(); // ensure video starts

        getLocation(); // call your location function

    } catch (error) {
        console.error("Camera access error:", error);
        alert("Unable to access camera. Please allow permission.");
    }
}
// ==============================
// CAPTURE PHOTO WITH STAMP
// ==============================
function capturePhoto(index) {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // draw image
    ctx.drawImage(video, 0, 0);

    // DATE TIME
    const dateTime = new Date().toLocaleString();

    // BACKGROUND
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(10, canvas.height - 70, canvas.width - 20, 60);

    // TEXT
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(dateTime, 20, canvas.height - 40);
    ctx.fillText(currentLocation, 20, canvas.height - 15);

    // SAVE BLOB
    canvas.toBlob(blob => {

    if (!blob) {
        console.error("❌ Blob is null");
        document.getElementById(`headcount${index}`).textContent = "❌ Image capture failed";
        return;
    }

    console.log("✅ Blob created:", blob);

    if (index === 1) {
        photoBlob1 = blob;
        document.getElementById("preview1").src = URL.createObjectURL(blob);
        document.getElementById("headcount1").textContent = "⏳ Detecting...";
    } else {
        photoBlob2 = blob;
        document.getElementById("preview2").src = URL.createObjectURL(blob);
        document.getElementById("headcount2").textContent = "⏳ Detecting...";
    }

    detectHeadcountPreview(blob, index);

}, "image/jpeg");
}

// ==============================
// HEADCOUNT PREVIEW DETECTION   ← NEW FUNCTION
// ==============================
async function detectHeadcountPreview(blob, index) {
    try {

        if (!(blob instanceof Blob)) {
            console.error("❌ Not a valid Blob:", blob);
            document.getElementById(`headcount${index}`).textContent = "❌ Invalid image";
            return;
        }

        const formData = new FormData();
        formData.append("image", blob, "photo.jpg");

        const res = await fetch("/api/headcount", {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            document.getElementById(`headcount${index}`).textContent = "❌ Detection failed";
            return;
        }

        const data = await res.json();

        document.getElementById(`headcount${index}`).textContent =
            `👥 People Detected: ${data.count}`;

    } catch (err) {
        console.error("Headcount error:", err);
        document.getElementById(`headcount${index}`).textContent = "⚠️ Service unavailable";
    }
}
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("nodalVisitForm");

    if (!form) {
        console.error("❌ nodalVisitForm NOT FOUND");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        console.log("🔥 SUBMIT CLICKED");

        try {

            if (!selectedNodalId) {
                alert("Please select Nodal & Hostel properly");
                return;
            }

            const formData = new FormData();

            formData.append("IdNodel", selectedNodalId);
            formData.append("AdmittedSeat", document.getElementById("admittedSeat").value);
            formData.append("Month", document.getElementById("month").value);
            formData.append("Year", document.getElementById("year").value);
            formData.append("Remark", "");
            formData.append("Remark1", document.getElementById("remark1").value);
            formData.append("Remark2", document.getElementById("remark2").value);

            if (photoBlob1) {
                formData.append("photo1", photoBlob1, "photo1.jpg");
            }

            if (photoBlob2) {
                formData.append("photo2", photoBlob2, "photo2.jpg");
            }

            // 🔍 DEBUG
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            const res = await fetch(`${BASE}/Add`, {
                method: "POST",
                body: formData
            });

            console.log("📡 API CALLED");
			const text = await res.text();  
            let result;

           try {
    result = JSON.parse(text);   // try convert to JSON
} catch {
    result = text;               // fallback as plain text
}

            console.log("📥 RESPONSE:", result);

            if (res.ok) {
                alert("✅ Data Saved Successfully");

                form.reset();
                document.getElementById("preview1").src = "";
                document.getElementById("preview2").src = "";

                selectedNodalId = 0;
                selectedNodalName = "";

                stopCamera();
            } else {
                console.error("❌ SERVER ERROR:", result);
                alert("❌ " + (result.title || result || "Server Error"));
            }

        } catch (err) {
            console.error("❌ ERROR:", err);
            alert("Something went wrong");
        }
    });

});
// ==============================
// STOP CAMERA — NO CHANGES
// ==============================
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}
//---------------------------------------
//---------------------------------------- load count 
// Function to load total hostels
let totalHostelsCount = 0;
async function loadTotalHostels() {
    try {
        const res = await fetch(`${BASE_URL}/GetTotalHostelCount`);
        if (!res.ok) throw new Error("Failed to fetch total hostels");

        const data = await res.json();
			totalHostelsCount = data.totalHostels;// { totalHostels: 5 }

        // Show the count in the div
        document.getElementById("totalHostelTable").textContent = totalHostelsCount;
    } catch (err) {
        console.error("Error loading total hostels:", err);
        document.getElementById("totalHostelTable").textContent = "Error";
    }
}

// Call the function when page loads
document.addEventListener("DOMContentLoaded", loadTotalHostels);

//---------------------------------Dashboard table
//------------------------------------

  // Replace with your actual API

// DOM elements
const monthSelect = document.getElementById("dashMonth");
const yearSelect = document.getElementById("dashYear");
const visitedStats = document.getElementById("visitedStats");
const notVisitedStats = document.getElementById("notVisitedStats");
const visitTableSection = document.getElementById("visitTableSection");

// Function to fetch data based on month & year
async function fetchVisitData(month, year) {
    if (!month || !year) return; // don't fetch if month/year not selected

    try {
        const res = await fetch(`${BASE}/GetByMonthYear?month=${month}&year=${year}`);
        if (!res.ok) throw new Error("Failed to fetch visit data");

        const data = await res.json(); // List of NodelentryQueryModel
// Unique visited hostels (admittedSeat > 0)
        const uniqueVisitedHostels = new Set(
            data.filter(x => x.admittedSeat > 0).map(x => x.hostelName)
        );

        // Unique not visited hostels (admittedSeat == 0)
		
        // Not visited = total hostels - visited hostels
        const notVisitedCount = totalHostelsCount - uniqueVisitedHostels.size;

        // Update stats
        visitedStats.textContent = uniqueVisitedHostels.size;
        notVisitedStats.textContent = notVisitedCount;

        // Render table
        renderVisitTable(data);
    } catch (err) {
        console.error("Error fetching visit data:", err);
        visitTableSection.innerHTML = "<p>Error loading data</p>";
		 visitedStats.textContent = "0";
        notVisitedStats.textContent = "0";
    }
}

// Function to render table
function renderVisitTable(data) {
    if (data.length === 0) {
        visitTableSection.innerHTML = "<p>No data found for selected month/year.</p>";
        return;
    }

    let html = `
    <table border="1" cellspacing="0" cellpadding="5">
        <thead>
            <tr>
                <th>Nodel Name</th>
                <th>Hostel Name</th>
                <th>Block</th>
                <th>Total Seat</th>
                <th>Admitted Seat</th>
                <th>Month</th>
                <th>Year</th>
                <th>Remark</th>
            </tr>
        </thead>
        <tbody>
    `;

    data.forEach(item => {
        html += `
        <tr>
            <td>${item.nodelName}</td>
            <td>${item.hostelName}</td>
            <td>${item.block}</td>
            <td>${item.totalSeat}</td>
            <td>${item.admittedSeat}</td>
            <td>${item.month}</td>
            <td>${item.year}</td>
            <td>${item.remark || ""}</td>
        </tr>
        `;
    });

    html += "</tbody></table>";

    visitTableSection.innerHTML = html;
}

// Event listeners for month/year select
monthSelect.addEventListener("change", () => {
    const month = monthSelect.value;
    const year = yearSelect.value;
    fetchVisitData(month, year);
});

yearSelect.addEventListener("change", () => {
    const month = monthSelect.value;
    const year = yearSelect.value;
    fetchVisitData(month, year);
});

//------------------------------------
//-------------------export----------------

 document.querySelector(".btn-primary").addEventListener("click", function () {
    const table = document.querySelector("#visitTableSection table");

    if (!table) {
        alert("No table to export!");
        return;
    }

    // Create a Workbook using a simple HTML approach
    const tableHTML = table.outerHTML.replace(/ /g, '%20');

    // File name
    const filename = 'HostelVisitTable.xls';

    // Create a download link
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);

    downloadLink.href = 'data:application/vnd.ms-excel,' + tableHTML;
    downloadLink.download = filename;
    downloadLink.click();
    document.body.removeChild(downloadLink);
});

//--------------------------
//-----------------------
function openViewModal() {
    document.getElementById("viewModal").style.display = "block";
    loadAllData(); // load on open
}

function closeViewModal() {
    document.getElementById("viewModal").style.display = "none";
}
async function loadAllData() {
    try {
        const res = await fetch(`${BASE}/GetAll`);
        const data = await res.json();

        renderViewTable(data);

    } catch (err) {
        console.error(err);
    }
}

function applyFilter() {
    const month = document.getElementById("filterMonth").value;
    const year = document.getElementById("filterYear").value;

    fetchVisitDataForModal(month, year);
}

async function fetchVisitDataForModal(month, year) {
    try {
        let url = `${BASE}/GetAll`;

        if (month && year) {
            url = `${BASE}/GetByMonthYear?month=${month}&year=${year}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        renderViewTable(data);

    } catch (err) {
        console.error(err);
    }
}

function renderViewTable(data) {

    if (data.length === 0) {
        viewTableSection.innerHTML = "<p>No data found</p>";
        return;
    }

    let html = `
    <div style="overflow:auto; max-height:400px; border:1px solid #ccc;">
    <table border="1" cellpadding="5" style="min-width:1200px; border-collapse:collapse;">
        <thead style="position:sticky; top:0; background:#f2f2f2;">
            <tr>
                <th>Nodel</th>
                <th>Hostel</th>
                <th>Block</th>
                <th>Total Seat</th>
                <th>Admitted</th>
                <th>Month</th>
                <th>Year</th>
                <th>Main Remark</th>

                <th>Photo 1</th>
				<th>photo 1 HC</th>
                <th>Remark 1</th>

                <th>Photo 2</th>
				<th>photo 2 HC</th>
                <th>Remark 2</th>

                <th>Action</th>
            </tr>
        </thead>
        <tbody>
    `;

    data.forEach(item => {

        html += `
        <tr>
            <td>${item.nodelName}</td>
            <td>${item.hostelName}</td>
            <td>${item.block}</td>
            <td>${item.totalSeat}</td>

            <td contenteditable="false" id="ad-${item.idNodelEntry}">
                ${item.admittedSeat}
            </td>

            <td contenteditable="false" id="m-${item.idNodelEntry}">
                ${item.month}
            </td>

            <td contenteditable="false" id="y-${item.idNodelEntry}">
                ${item.year}
            </td>

            <td contenteditable="false" id="r-${item.idNodelEntry}">
                ${item.remark || ""}
            </td>

            <!-- PHOTO 1 -->
            <td>
    ${
        item.photo1 
        ? `<img 
                src="${toAssetUrl(item.photo1)}" 
                width="80" 
                height="60"
                style="object-fit:cover; border-radius:5px; cursor:pointer;"
                onclick="openFullImage('${item.photo1}')"
           >`
        : "No Image"
    }
</td>
			<!-- HEADCOUNT 1 -->
<td>${item.headCount1 ?? 0}</td>
            <td>${item.remark1 || ""}</td>

            <!-- PHOTO 2 -->
           <td>
    ${
        item.photo2 
        ? `<img 
                src="${toAssetUrl(item.photo2)}" 
                width="80" 
                height="60"
                style="object-fit:cover; border-radius:5px; cursor:pointer;"
                onclick="openFullImage('${item.photo2}')"
           >`
        : "No Image"
    }
</td>
			<!-- HEADCOUNT 2 -->
<td>${item.headCount2 ?? 0}</td>

            <td>${item.remark2 || ""}</td>

            <td id="action-${item.idNodelEntry}">
    <button onclick='editRow(${item.idNodelEntry}, ${JSON.stringify(item)})'>Edit</button>
    <button onclick="deleteRow(${item.idNodelEntry})">Delete</button>
</td>
        </tr>
        `;
    });

    html += "</tbody></table></div>";

    viewTableSection.innerHTML = html;
}
 
function viewImage(fileName) {

    const modalHtml = `
    <div id="imgModal" style="
        position:fixed;
        top:0; left:0;
        width:100%; height:100%;
        background:rgba(0,0,0,0.8);
        display:flex;
        justify-content:center;
        align-items:center;
        z-index:9999;
    " onclick="this.remove()">

        <img 
            src="${toAssetUrl(fileName)}" 
            style="max-width:90%; max-height:90%; border:5px solid white;"
            onerror="this.src='https://via.placeholder.com/300?text=No+Image'"
        >
    </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function openFullImage(fileName) {

    const modal = document.createElement("div");

    modal.style.position = "fixed";
    modal.style.top = 0;
    modal.style.left = 0;
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.background = "rgba(0,0,0,0.9)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "9999";

    modal.innerHTML = `
        <span style="
            position:absolute;
            top:20px;
            right:30px;
            font-size:30px;
            color:white;
            cursor:pointer;
        " onclick="this.parentElement.remove()">✖</span>

        <img 
            src="${toAssetUrl(fileName)}" 
            style="max-width:90%; max-height:90%; border-radius:10px;"
            onerror="this.src='https://via.placeholder.com/400?text=No+Image'"
        >
    `;

    // close on background click
    modal.addEventListener("click", function(e) {
        if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
}
function editRow(id, item) {

    const row = document.getElementById(`ad-${id}`).parentElement;

    row.innerHTML = `
        <!-- NODEL -->
        <td>
            <input type="text" id="nodal-${id}" value="${item.nodelName}" onfocus="loadNodalNamesEdit(${id})">
            <div id="nodalDropdown-${id}" class="dropdown-list"></div>
        </td>

        <!-- HOSTEL -->
        <td>
            <input type="text" id="hostel-${id}" value="${item.hostelName}" readonly>
            <div id="hostelDropdown-${id}" class="dropdown-list"></div>
        </td>

        <!-- BLOCK -->
        <td><input id="block-${id}" value="${item.block}" readonly></td>

        <!-- TOTAL SEAT -->
        <td><input id="seat-${id}" value="${item.totalSeat}" readonly></td>

        <!-- ADMITTED -->
        <td><input id="ad-${id}" value="${item.admittedSeat}"></td>

        <!-- MONTH -->
        <td><input id="m-${id}" value="${item.month}"></td>

        <!-- YEAR -->
        <td><input id="y-${id}" value="${item.year}"></td>

        <!-- REMARK -->
        <td><input id="r-${id}" value="${item.remark || ""}"></td>

        <!-- PHOTO 1 -->
        <td>
            <button onclick="openCameraInline(${id},1)">📷</button>
            <video id="video-${id}" width="100" autoplay></video>
            <button onclick="captureInline(${id},1)">Capture</button>

            <img id="preview-${id}-1" width="80"
                 src="${toAssetUrl(item.photo1)}">
        </td>
					<!-- HEADCOUNT 1 -->
		<td>
			<input id="hc1-${id}" value="${item.headCount1 ?? 0}" readonly>
		</td>

        <!-- REMARK 1 -->
        <td><input id="remark1-${id}" value="${item.remark1 || ""}"></td>

        <!-- PHOTO 2 -->
        <td>
            <button onclick="openCameraInline(${id},2)">📷</button>
            <video id="video-${id}" width="100" autoplay></video>
            <button onclick="captureInline(${id},2)">Capture</button>

            <img id="preview-${id}-2" width="80"
                 src="${toAssetUrl(item.photo2)}">
        </td>
					<!-- HEADCOUNT 2 -->
		<td>
			<input id="hc2-${id}" value="${item.headCount2 ?? 0}" readonly>
		</td>
        <!-- REMARK 2 -->
        <td><input id="remark2-${id}" value="${item.remark2 || ""}"></td>

        <!-- ACTION -->
        <td>
            <button onclick="saveRowFull(${id})">Save</button>
            <button onclick="cancelEdit()">Cancel</button>
        </td>
    `;

    // 🔥 VERY IMPORTANT → store nodalId
    document.getElementById(`nodal-${id}`).dataset.id = item.idNodel;
}

async function loadNodalNamesEdit(id) {

    const res = await fetch(`${BASE_URL}/GetAllNodelName`);
    const data = await res.json();

    const dropdown = document.getElementById(`nodalDropdown-${id}`);
    dropdown.innerHTML = "";

    data.forEach(name => {
        const div = document.createElement("div");
        div.innerText = name;

        div.onclick = () => {
            document.getElementById(`nodal-${id}`).value = name;
            dropdown.style.display = "none";

            loadHostelNamesEdit(id, name);
        };

        dropdown.appendChild(div);
    });

    dropdown.style.display = "block";
}

async function loadHostelNamesEdit(id, nodalName) {

    const res = await fetch(`${BASE_URL}/GetHostelByNodel?nodelName=${encodeURIComponent(nodalName)}`);
    const data = await res.json();

    const dropdown = document.getElementById(`hostelDropdown-${id}`);
    dropdown.innerHTML = "";

    data.forEach(name => {

        const div = document.createElement("div");
        div.innerText = name;

        div.onclick = async () => {

            document.getElementById(`hostel-${id}`).value = name;
            dropdown.style.display = "none";

            const res2 = await fetch(
                `${BASE_URL}/GetBlockSeat?nodelName=${encodeURIComponent(nodalName)}&hostelName=${encodeURIComponent(name)}`
            );

            const info = await res2.json();

            document.getElementById(`block-${id}`).value = info.block;
            document.getElementById(`seat-${id}`).value = info.totalSeat;

            // 🔥 important
            document.getElementById(`nodal-${id}`).dataset.id = info.idNodel;
        };

        dropdown.appendChild(div);
    });

    dropdown.style.display = "block";
}
let rowStreams = {};
let rowPhoto1 = {};
let rowPhoto2 = {};

async function openCameraInline(id, index) {
    const video = document.getElementById(`video-${id}`);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });

        video.srcObject = stream;
        video.play();

        rowStreams[id] = stream;

        getLocation();

    } catch (err) {
        console.error("Camera error:", err);
        alert("Camera access denied");
    }
}

function captureInline(id, index) {

    const video = document.getElementById(`video-${id}`);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    // stamp
    const dateTime = new Date().toLocaleString();

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(10, canvas.height - 70, canvas.width - 20, 60);

    ctx.fillStyle = "#fff";
    ctx.font = "14px Arial";
    ctx.fillText(dateTime, 20, canvas.height - 40);
    ctx.fillText(currentLocation, 20, canvas.height - 15);

    canvas.toBlob((blob) => {

        if (!blob) {
            console.error("❌ Blob null");
            alert("Image capture failed");
            return;
        }

        console.log("✅ Blob:", blob);

        // preview + store
        if (index === 1) {
            rowPhoto1[id] = blob;
            document.getElementById(`preview-${id}-1`).src = URL.createObjectURL(blob);
            document.getElementById(`hc1-${id}`).value = "Detecting...";
        } else {
            rowPhoto2[id] = blob;
            document.getElementById(`preview-${id}-2`).src = URL.createObjectURL(blob);
            document.getElementById(`hc2-${id}`).value = "Detecting...";
        }

        // 🔥 call detection
        detectHeadcountInline(blob, id, index);

    }, "image/jpeg");
}

async function detectHeadcountInline(blob, id, index) {
    try {

        if (!(blob instanceof Blob)) {
            console.error("❌ Invalid blob");
            return;
        }

        const formData = new FormData();
        formData.append("image", blob, "photo.jpg");

        const res = await fetch("/api/headcount", {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            if (index === 1)
                document.getElementById(`hc1-${id}`).value = "Failed";
            else
                document.getElementById(`hc2-${id}`).value = "Failed";
            return;
        }

        const data = await res.json();

        if (index === 1) {
            document.getElementById(`hc1-${id}`).value = data.count ?? 0;
        } else {
            document.getElementById(`hc2-${id}`).value = data.count ?? 0;
        }

    } catch (err) {
        console.error("❌ Headcount error:", err);

        if (index === 1)
            document.getElementById(`hc1-${id}`).value = "Error";
        else
            document.getElementById(`hc2-${id}`).value = "Error";
    }
}

async function saveRowFull(id) {

    const formData = new FormData();

    const nodalId = document.getElementById(`nodal-${id}`).dataset.id;

    formData.append("IdNodel", nodalId);
    formData.append("AdmittedSeat", document.getElementById(`ad-${id}`).value);
    formData.append("Month", document.getElementById(`m-${id}`).value);
    formData.append("Year", document.getElementById(`y-${id}`).value);
    formData.append("Remark", document.getElementById(`r-${id}`).value);
    formData.append("Remark1", document.getElementById(`remark1-${id}`).value);
    formData.append("Remark2", document.getElementById(`remark2-${id}`).value);

	 // 🔥 ADD HEADCOUNT (IMPORTANT)
    formData.append("HeadCount1", document.getElementById(`hc1-${id}`)?.value || 0);
    formData.append("HeadCount2", document.getElementById(`hc2-${id}`)?.value || 0);
	
    if (rowPhoto1[id]) {
        formData.append("Photo1", rowPhoto1[id]);
    }

    if (rowPhoto2[id]) {
        formData.append("Photo2", rowPhoto2[id]);
    }

    const res = await fetch(`${BASE}/Update/${id}`, {
        method: "PUT",
        body: formData
    });

    if (res.ok) {
        alert("✅ Updated Successfully");
        loadAllData();
    } else {
        alert("❌ Update Failed");
    }
}
function cancelEdit() {
    loadAllData(); // reload original data
}

function stopRowCamera(id) {
    if (rowStreams[id]) {
        rowStreams[id].getTracks().forEach(track => track.stop());
    }
}

 async function deleteRow(id) {

    if (!confirm("Delete this record?")) return;

    try {
        const res = await fetch(`${BASE}/Delete/${id}`, {  // ✅ FIXED
            method: "DELETE"
        });

        if (res.ok) {
            alert("Deleted successfully");
            loadAllData();
        } else {
            alert("Delete failed");
        }

    } catch (err) {
        console.error(err);
    }
}