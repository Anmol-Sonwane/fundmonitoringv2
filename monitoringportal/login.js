// login.js
const BASE_URL = "/api/Login/login";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent form reload

    // Get username and password from inputs
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    // Validate inputs
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    // Payload: only send username & password
   const payload = {
  Username: username,
  Password: password
};

    console.log("Sending payload:", payload);

    try {
      const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
 
      // Handle backend validation errors
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Backend error:", error);

        if (error.errors) {
          const messages = Object.values(error.errors).flat().join("\n");
          alert(messages);
        } else {
          alert(error.title || "Login failed");
        }
        return;
      }

      const data = await response.json();
      console.log("Login success:", data);

      // Save JWT token
      localStorage.setItem("token", data.token);

       // Redirect based on role
      const role = (data.role || "").toLowerCase();
      if (role === "admin") {
        window.location.href = "adminpanel.html";
      } else if (role === "user") {
        window.location.href = "user.html";
      }else if (role === "nodal") {
        window.location.href = "nodalpanel.html";
      } else if (role === "student") {
        window.location.href = "studentpanel.html";
      } else {
        alert("Unknown role: " + data.role);
      }

    } catch (err) {
      console.error("Login request failed:", err);
      alert("Login error: " + err.message);
    }
  });
});
