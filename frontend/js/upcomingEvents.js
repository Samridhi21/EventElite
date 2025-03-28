document.addEventListener("DOMContentLoaded", () => {
   
    const eventListContainer = document.getElementById("event-list");
    const upcomingEventContainer = document.getElementById("upcomingEvent");

    function loadUpcomingEvents() {
        fetch("http://localhost:3000/api/events")
            .then(response => response.json())
            .then(events => {
                if (Array.isArray(events) && events.length > 0) {
                    eventListContainer.innerHTML = "";
                    events.forEach(event => createEventCard(event));
                } else {
                    eventListContainer.innerHTML = "<p>No upcoming events found.</p>";
                }
            })
            .catch(error => {
                console.error("❌ Error fetching events:", error);
                eventListContainer.innerHTML = "<p>Error loading events.</p>";
            });
    }

 
    function createEventCard(event) {
        const eventCard = document.createElement("div");
        eventCard.classList.add("event-card");

        // ✅ Constructing Image Path (with Default Image)
        let imageUrl = event.image || "/uploads/default-event.jpg";
        if (!imageUrl.startsWith("http")) {
            imageUrl = `http://localhost:3000${imageUrl.startsWith("/uploads/") ? imageUrl : `/uploads/${imageUrl}`}`;
        }

        // ✅ Card Content
        eventCard.innerHTML = `
            <img src="${imageUrl}" alt="Event Image" onerror="this.style.display='none'">
            <h3>${event.title}</h3>
            <p><strong>Description:</strong> ${event.description.substring(0, 100)}...</p>
            <p><strong>Date:</strong> ${event.start_date.split("T")[0]} - ${event.end_date.split("T")[0]}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Venue:</strong> ${event.venue}</p>
            <p><strong>Fee:</strong> ₹${event.fee}</p>
            <button class="enroll-btn" 
                data-event-id="${event.event_id}" 
                data-title="${event.title}" 
                data-date="${event.start_date.split("T")[0]}" 
                data-time="${event.time}" 
                data-venue="${event.venue}" 
                data-fee="${event.fee}">
                Enroll Now
            </button>
        `;

        eventListContainer.appendChild(eventCard);
    }

    /*** HANDLE EVENT ENROLLMENT ***/
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("enroll-btn")) {
            const eventId = event.target.getAttribute("data-event-id");
            const eventTitle = event.target.getAttribute("data-title");
            const eventDate = event.target.getAttribute("data-date");
            const eventTime = event.target.getAttribute("data-time");
            const eventVenue = event.target.getAttribute("data-venue");
            const eventFee = event.target.getAttribute("data-fee");

            if (!eventId) {
                console.error("❌ No event ID found for enrollment!");
                return;
            }

            console.log(`✅ Enrolling in event with ID: ${eventId}`);

            // Store event details in localStorage before redirecting
            localStorage.setItem("selectedEvent", JSON.stringify({
                eventId,
                eventTitle,
                eventDate,
                eventTime,
                eventVenue,
                eventFee
            }));

            // Redirect to enrollNow.html
            window.location.href = `enrollNow.html`;
        }
    });

    /*** FETCH LATEST UPCOMING EVENT FOR MARQUEE ***/
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

    
    loadUpcomingEvents();
    fetchLatestEvent();
});
