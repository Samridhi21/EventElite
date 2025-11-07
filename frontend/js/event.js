document.addEventListener("DOMContentLoaded", function () {
    const eventListContainer = document.getElementById("event-list");
    const upcomingEventContainer = document.getElementById("upcomingEvent");
    const eventForm = document.getElementById("createEventForm");
    const messageBox = document.getElementById("messageBox");

    // Form Submission
    eventForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(eventForm);

        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        fetch("http://localhost:3000/api/events/create", {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showMessage("❌ " + data.error, "error");
                } else {
                    showMessage("✅ Event Created Successfully!", "success");
                    alert("✅ Event Created Succesfully!");

                    eventForm.reset();
                    fetchEvents(); 
                    fetchLatestEvent(); 
                }
            })
            .catch(error => {
                console.error("Fetch Error:", error);
                showMessage("❌ Failed to create event.", "error");
            });
    });

    // Image Preview
    document.getElementById("eventImageInput").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("imagePreview").src = e.target.result;
                document.getElementById("imagePreview").style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    });

    // ✅ Fix Date Function
    function fixDate(dateString) {
        let date = new Date(dateString);
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); // Reverse the shift
        return date.toISOString().split("T")[0]; // Extract YYYY-MM-DD
    }

    // ✅ Fetch and display events
    function fetchEvents() {
        fetch("http://localhost:3000/api/events")
            .then(response => response.json())
            .then(events => {
                let eventList = document.getElementById("eventList");
                eventList.innerHTML = "";

                events.forEach(event => {
                    let fixedStartDate = fixDate(event.start_date);
                    let fixedEndDate = fixDate(event.end_date);

                    let eventCard = `
                        <div class="event-card">
                            <h3>${event.title}</h3>
                            <p><strong>Date:</strong> ${fixedStartDate} - ${fixedEndDate}</p>
                            <p><strong>Time:</strong> ${event.time}</p>
                            <p><strong>Venue:</strong> ${event.venue}</p>
                        </div>
                    `;

                    eventList.innerHTML += eventCard;
                });
            })
            .catch(error => console.error("Error fetching events:", error));
    }

    // ✅ Fetch Latest Upcoming Event
    function fetchLatestEvent() {
        fetch("http://localhost:3000/api/latest-event")
            .then(response => response.json())
            .then(data => {
                upcomingEventContainer.innerHTML = data.title
                    ? `<marquee>${data.title}</marquee>`
                    : "No upcoming events";
            })
            .catch(error => {
                console.error("❌ Error fetching upcoming event:", error);
                upcomingEventContainer.innerHTML = "Failed to load events.";
            });
    }

    // ✅ Call fetchEvents & fetchLatestEvent on page load
    fetchEvents();
    fetchLatestEvent();
});
