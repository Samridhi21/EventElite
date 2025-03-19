document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:3000/api/pastEvents")
        .then(response => response.json())
        .then(events => {
            const pastEventsList = document.getElementById("pastEventsList");

            if (!pastEventsList) {
                console.error("❌ Error: #pastEventsList is missing in the HTML.");
                return;
            }

            if (!Array.isArray(events) || events.length === 0) { 
                pastEventsList.innerHTML = "<tr><td colspan='5'>No past events found.</td></tr>";
                return;
            }

            events.forEach(event => {
                const row = document.createElement("tr");
                row.innerHTML = `
                   <td>${event.title}</td>
                    <td>${event.start_date}</td> 
                    <td>${event.time}</td>
                    <td>${event.venue}</td>
                    <td>${event.description}</td>
                `;
                pastEventsList.appendChild(row);
            });
        })
        .catch(error => console.error("❌ Error fetching past events:", error));
});
