document.getElementById("btn").addEventListener("click", async function () {
    const password = prompt("Enter your password:");
  
    if (!password) {
      alert("Password is required");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/api/admin/verify", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ password })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (data.role === "admin" || data.role === "faculty") {
          window.location.href = "/event.html";
        } else {
          alert(`${data.error}`);
          window.location.href = "/home";
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Try again later.");
    }
  });
  