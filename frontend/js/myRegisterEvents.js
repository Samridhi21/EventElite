$(document).ready(function () {
    // ✅ Fetch student data from localStorage
    const studentData = localStorage.getItem("student");

    // if (!studentData) {
    //     alert("No student logged in! Redirecting to login page...");
    //     window.location.href = "login.html";
    //     return;
    // }

    const student = JSON.parse(studentData);
    console.log("🟢 Stored Student Data:", student);

    if (!student.student_id) {
        console.error("❌ Student ID missing!");
        return;
    }

    // ✅ Fetch registered events
    $.ajax({
        url: `http://localhost:3000/api/student-events/${student.student_id}`,
        type: "GET",
        success: function (response) {
            console.log("✅ Student Events Response:", response);

            if (response.success && response.events.length > 0) {
                const eventList = $("#event-list");
                eventList.empty(); // Clear previous data
                
                response.events.forEach(event => {
                    // ✅ Check if the event is free
                    let paymentStatusDisplay = event.fee == 0 ? "🆓 Free" : (event.payment_status === "paid" ? "✅ Paid" : "⌛ Pending");

                    eventList.append(`
                        <tr>
                            <td>${event.title}</td>
                            <td>${event.start_date}</td>
                            <td>${event.time}</td>
                            <td>${event.venue}</td>
                            <td>₹${event.fee}</td>
                            <td>${event.participation_status === "yes" ? "✅ Yes" : "❌ No"}</td>
                            <td>${event.registration_date}</td>
                            <td>${paymentStatusDisplay}</td>
                        </tr>
                    `);
                });
            } else {
                // ✅ Show message if no events are registered
                $("#event-list").html(`<tr><td colspan="8">No registered events found.</td></tr>`);
            }
        },
        error: function (xhr) {
            console.error("❌ Error fetching registered events:", xhr.responseJSON || xhr.statusText);
        }
    });
});
