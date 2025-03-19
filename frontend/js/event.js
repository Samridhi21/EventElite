document.addEventListener("DOMContentLoaded", function () {

    const eventForm = document.getElementById("createEventForm");

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
                    alert("❌ " + data.error);
                } else {
                    alert("✅ Event Created Successfully!");
                    eventForm.reset();
                }
            })
            .catch(error => {
                console.error("Fetch Error:", error);
                alert("❌ Failed to create event.");
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

    // ✅ Call fetchEvents on page load
    fetchEvents();

});



// document.addEventListener("DOMContentLoaded", function () {
//     const eventForm = document.getElementById("createEventForm");

//     eventForm.addEventListener("submit", function (event) {
//         event.preventDefault();

//         const formData = new FormData(eventForm);

//         // Fix date format to prevent shifting issues
//         function formatDate(dateString) {
//             let date = new Date(dateString);
//             date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); // Adjust for timezone offset
//             return date.toISOString().split("T")[0]; // Keep only YYYY-MM-DD
//         }

//         const startDate = document.getElementById("start_date").value;
//         const endDate = document.getElementById("end_date").value;

//         formData.set("start_date", formatDate(startDate));
//         formData.set("end_date", formatDate(endDate));

//         const xhr = new XMLHttpRequest();
//         xhr.open("POST", "http://localhost:5000/api/events/create", true);

//         xhr.onload = function () {
//             const response = JSON.parse(xhr.responseText);
//             if (xhr.status === 201) {
//                 alert("✅ Event Created Successfully!");
//                 eventForm.reset();
//             } else {
//                 alert("❌ " + response.error);
//             }
//         };

//         xhr.onerror = function () {
//             alert("❌ Failed to create event. Please check your connection.");
//         };

//         xhr.send(formData);
//     });

//     // Image Preview
//     document.getElementById("eventImageInput").addEventListener("change", function (event) {
//         const file = event.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onload = function (e) {
//                 document.getElementById("imagePreview").src = e.target.result;
//                 document.getElementById("imagePreview").style.display = "block";
//             };
//             reader.readAsDataURL(file);
//         }
//     });

// });
