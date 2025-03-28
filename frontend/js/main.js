document.getElementById("btn").addEventListener("click", async function () {
  const upcomingEventDiv = document.getElementById("upcomingEvent");
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

    
    fetch("http://localhost:3000/api/events/latest-upcoming")
    .then(response => response.json())
    .then(event => {
        if (event.message) {
            upcomingEventDiv.textContent = "More events to come...";
            upcomingEventDiv.style.color = "gray";
        } else {
            upcomingEventDiv.innerHTML = `
                <strong>Upcoming Event: </strong> ${event.title} - ${event.description} 
                on <strong>${event.start_date}</strong> at <strong>${event.time}</strong> 
                in <strong>${event.venue}</strong>
            `;
            upcomingEventDiv.style.color = "red";
        }
    })
    .catch(error => {
        console.error("Error fetching event:", error);
        upcomingEventDiv.textContent = "Failed to load events.";
        upcomingEventDiv.style.color = "red";
    });
});
  