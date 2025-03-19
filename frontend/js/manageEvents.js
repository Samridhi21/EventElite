document.addEventListener("DOMContentLoaded", () => {
    const eventList = document.getElementById("eventList");


    // Fetch events from the server
    function fetchEvents() {
        fetch("http://localhost:3000/admin/api/events")
            .then(response => response.json()) // Ensure the response is parsed as JSON
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    eventList.innerHTML = "";
                    data.forEach(event => createEventCard(event)); // Populate event cards
                } else {
                    eventList.innerHTML = "<p>No events found.</p>"; // If no events, show a message
                }
            })
            .catch(error => {
                console.error("Error fetching events:", error);
                eventList.innerHTML = "<p>Error loading events.</p>"; // Show an error message
            });
    }


    function createEventCard(event) {
        const eventCard = document.createElement("div");
        eventCard.classList.add("event-card");
        eventCard.dataset.id = event.event_id;

            // Set default image if event.image is null or empty
            function getImageUrl(filename) {
                return filename ? `http://localhost:3000/uploads/${filename}` : "default-image.jpg";
            }
    

            eventCard.innerHTML = `
                <h3><input type="text" class="title" value="${event.title}" disabled></h3>
               <img src="${getImageUrl(event.image)}" alt="Event Image" style="max-width: 100%; height: auto;">
                <p><strong>Description:</strong> <textarea class="description" disabled>${event.description}</textarea></p>
                <p><strong>Date:</strong> <input type="date" class="start_date" value="${event.start_date.split('T')[0]}" disabled> - 
                <input type="date" class="end_date" value="${event.end_date.split('T')[0]}" disabled></p>
                <p><strong>Time:</strong> <input type="time" class="time" value="${event.time}" disabled></p>
                <p><strong>Venue:</strong> <input type="text" class="venue" value="${event.venue}" disabled></p>
                <p><strong>Fee:</strong> ₹<input type="number" class="fee" value="${event.fee}" disabled></p>
                
                <div class="actions">
                    <button class="edit-btn">Edit</button>
                    <button class="save-btn">Save</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            eventList.appendChild(eventCard);
        }
        fetchEvents();

        $(document).on("click", ".edit-btn", function () {
            let card = $(this).closest(".event-card");
            card.find("input, textarea").prop("disabled", false);
            card.find(".edit-btn").hide();
            card.find(".save-btn").show();
            card.find(".image-input").show();
        });

        $(document).on("click", ".save-btn", function () {
    let card = $(this).closest(".event-card");
    let eventId = card.data("id");

    // Collect the updated data from the form
    let updatedData = {
        title: card.find(".title").val(),
        description: card.find(".description").val(),
        start_date: card.find(".start_date").val(),
        end_date: card.find(".end_date").val(),
        time: card.find(".time").val(),
        venue: card.find(".venue").val(),
        fee: card.find(".fee").val(),
    };

    console.log(updatedData);

            $.ajax({
                url: `http://localhost:3000/admin/api/events/${eventId}`,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(updatedData),
                success: function () {
                    alert("Event updated!");
                    fetchEvents();
                },
                error: function (xhr) {
                    console.error("Error updating event:", xhr.responseText);
                }
            });
        });

        $(document).on("click", ".delete-btn", function () {
            let card = $(this).closest(".event-card");
            let eventId = card.data("id");

            if (confirm("Are you sure you want to delete this event?")) {
                $.ajax({
                    url: `http://localhost:3000/admin/api/events/${eventId}`,
                    type: "DELETE",
                    success: function () {
                        alert("Event deleted!");
                        fetchEvents();
                    },
                    error: function (xhr) {
                        console.error("Error deleting event:", xhr.responseText);
                    }
                });
            }
            // fetchEvents();
        });
    });
