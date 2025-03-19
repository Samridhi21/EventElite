document.getElementById("adminLoginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent page reload

    const name = document.getElementById("adminName").value;
    const password = document.getElementById("adminPassword").value;

    try {
        const response = await fetch("http://localhost:3000/admin/login", { // Change port if needed
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message); // ✅ Show success alert
            window.location.href = data.redirectUrl; // ✅ Redirect to Student Registration Page
        } else {
            alert(data.error); // Show error message
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
    }
});

  
