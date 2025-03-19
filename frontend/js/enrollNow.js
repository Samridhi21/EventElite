document.addEventListener("DOMContentLoaded", () => {
    // Retrieve event details from localStorage
    const selectedEvent = localStorage.getItem("selectedEvent");
    let eventDetails;

    try {
        eventDetails = selectedEvent ? JSON.parse(selectedEvent) : null;
    } catch (error) {
        console.error("❌ Error parsing event details:", error);
        alert("Error loading event details.");
        window.location.href = "upcomingEvents.html";
        return;
    }

    if (!eventDetails) {
        alert("No event selected! Redirecting...");
        window.location.href = "upcomingEvents.html";
        return;
    }

    // ✅ Debug: Log event details
    console.log("📌 Event Details:", eventDetails);

    // Ensure eventId exists
    const eventId = eventDetails.eventId || eventDetails.id;
    if (!eventId) {
        alert("❌ Event ID is missing!");
        return;
    }

    // Display event details
    document.getElementById("eventTitle").textContent = eventDetails.eventTitle || "N/A";
    document.getElementById("eventDate").textContent = eventDetails.eventDate || "N/A";
    document.getElementById("eventTime").textContent = eventDetails.eventTime || "N/A";
    document.getElementById("eventVenue").textContent = eventDetails.eventVenue || "N/A";
    document.getElementById("eventFee").textContent = `₹${eventDetails.eventFee || "0"}`;

    // Handle form submission
    document.getElementById("registrationForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const studentName = document.getElementById("studentName").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const participationStatus = document.getElementById("participation")?.value || "no"; // ✅ Fix potential null issue
        const paymentStatus = document.getElementById("paymentStatus")?.value || "pending"; 

        if (!studentName || !email || !phone) {
            alert("⚠️ Please fill in all fields.");
            return;
        }

        const registrationData = {
            eventId,
            studentName,
            email,
            phone,
            participation_status: participationStatus,
            payment_status: paymentStatus
        };

        console.log("📤 Sending registration data:", registrationData); // ✅ Debugging

        // ✅ Make API request to backend
        fetch("http://localhost:3000/api/register", { // Adjust if backend route changed
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registrationData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Server Response:", data); // ✅ Debugging

            if (data.success) {
                alert("🎉 Registration successful!");
                localStorage.removeItem("selectedEvent"); // Clear stored event
                window.location.href = "upcomingEvents.html";
            } else {
                alert("❌ Registration failed: " + (data.message || "Unknown error"));
            }
        })
        .catch(error => {
            console.error("❌ Error registering:", error);
            alert("❌ Error registering for event. Please try again.");
        });
    });
});
