const BASE_URL = "https://localhost:7117/api/Login"; // change port if needed

// Get JWT Token from login (stored in localStorage)
function getToken() {
    return localStorage.getItem("token"); 
}

// ================= GET ALL USERS =================
async function renderUsers() {
    const wrap = document.getElementById("userListWrap");
    const count = document.getElementById("userCount");
    wrap.innerHTML = "Loading...";

    try {
        const res = await fetch(`${BASE_URL}/getall`, {
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        });

        if (!res.ok) throw new Error("Unauthorized or error");

        const data = await res.json();
        wrap.innerHTML = "";
        count.innerText = data.length;

        data.forEach(u => {
            const div = document.createElement("div");
            div.className = "user-card";

           div.innerHTML = `
    <b>ID:</b> ${u.id} <br>
    <b>Username:</b> ${u.username} <br>
    <b>Role:</b> ${u.loginRole} <br>

    <button class="edit-btn"
        data-id="${u.id}"
        data-username="${u.username}"
        data-role="${u.loginRole}">
        Edit
    </button>

    <button class="delete-btn"
        data-id="${u.id}">
        Delete
    </button>
`;


            wrap.appendChild(div);
        });

    } catch (err) {
        wrap.innerHTML = "❌ Failed to load users";
        console.error(err);
    }
}

// ================= CREATE USER =================
async function createUser() {
    const username = document.getElementById("u_username").value;
    const password = document.getElementById("u_password").value;
    const role = document.getElementById("u_role").value;

    if (!username || !password) {
        alert("Fill all fields");
        return;
    }

    const payload = {
        username: username,
        password: password,
        loginRole: role
    };

    const res = await fetch(`${BASE_URL}/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
        },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert("User Created");
        renderUsers();
		 // ✅ clear form fields
    document.getElementById("u_username").value = "";
    document.getElementById("u_password").value = "";
    document.getElementById("u_role").value = "user"; // reset dropdown
    } else {
        alert("Error creating user");
    }
}

// ================= EDIT USER =================
function editUser(id, username, role) {
    const newUser = prompt("New Username:", username);
    const newPass = prompt("New Password:");
    const newRole = prompt("Role (admin/user):", role);

    if (!newUser || !newPass) return;

    updateUser(id, newUser, newPass, newRole);
}

// ================= UPDATE USER =================
async function updateUser(id, username, password, role) {
    const payload = {
        username: username,
        password: password,
        loginRole: role
    };

    const res = await fetch(`${BASE_URL}/update/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
        },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert("Updated");
        renderUsers();
    } else {
        alert("Update failed");
    }
}

// ================= DELETE USER =================
async function deleteUser(id) {
    if (!confirm("Delete this user?")) return;

    const res = await fetch(`${BASE_URL}/delete/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + getToken()
        }
    });

    if (res.ok) {
        alert("Deleted");
        renderUsers();
    } else {
        alert("Delete failed");
    }
}

// ================= DEMO SEED USERS =================
async function seedSample() {
    await createUserSample("admin", "12345", "admin");
    await createUserSample("user1", "12345", "user");
    await createUserSample("user2", "12345", "user");
    renderUsers();
}

async function createUserSample(username, password, role) {
    const payload = { username, password, loginRole: role };

    await fetch(`${BASE_URL}/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
        },
        body: JSON.stringify(payload)
    });
}

// ================= CLEAR USERS =================
async function clearUsers() {
    if (!confirm("Delete ALL users?")) return;

    const res = await fetch(`${BASE_URL}/getall`, {
        headers: { "Authorization": "Bearer " + getToken() }
    });

    const users = await res.json();

    for (let u of users) {
        await fetch(`${BASE_URL}/delete/${u.id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + getToken() }
        });
    }

    renderUsers();
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}
document.addEventListener("click", function (e) {
    const btn = e.target;

    // EDIT BUTTON
    if (btn.classList.contains("edit-btn")) {
        const id = btn.dataset.id;
        const username = btn.dataset.username;
        const role = btn.dataset.role;

        editUser(id, username, role);
    }

    // DELETE BUTTON
    if (btn.classList.contains("delete-btn")) {
        const id = btn.dataset.id;
        deleteUser(id);
    }
});
