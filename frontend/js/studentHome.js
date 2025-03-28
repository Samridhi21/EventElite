$(document).ready(function () {
    // Fetch student data from localStorage
    const studentData = localStorage.getItem("student");

    if (!studentData) {
        alert("No student logged in! Redirecting to login page...");
        window.location.href = "login.html";  // Redirect if no student found
        return;
    }

    const student = JSON.parse(studentData);
    console.log("🟢 Stored Student Data:", student); // Debugging

    if (!student.student_id || !student.name) {
        console.error("❌ Student ID or Name is missing!");
        return;
    }

    // Set student name in the main content (h1)
    $("#studentName").text(student.name);

    // Fetch updated student profile from the backend
    $.ajax({
        url: `http://localhost:3000/api/students/profile/${student.student_id}`,  // ✅ Fixed API path
        type: "GET",
        success: function (response) {
            console.log("✅ Student Profile Data:", response);
            $("#studentName").text(response.name);  // Update name in h1
        },
        error: function (xhr, status, error) {
            console.error("❌ Error fetching student profile:", xhr.responseJSON || error);
            alert("Failed to load student profile. Please try again.");
        }
    });

    // Fetch total events count
    $.ajax({
        url: "http://localhost:3000/api/events/count", // ✅ Ensure this route exists in backend
        type: "GET",
        success: function (response) {
            console.log("✅ Total Events Response:", response);
            $("#totalEvents").text(response.totalEvents);
        },
        error: function (xhr) {
            console.error("❌ Error fetching total events:", xhr.responseJSON || xhr.statusText);
        }
    });

    // Fetch student-specific enrolled events count
    $.ajax({
        url: `http://localhost:3000/api/students/${student.student_id}/enrolled-events`,
        type: "GET",
        success: function (response) {
            console.log("✅ Enrolled Events Count:", response);
            $("#myTotalEvents").text(response.enrolledEventsCount || 0); // Ensure count is displayed
        },
        error: function (xhr) {
            console.error("❌ Error fetching enrolled events:", xhr.responseJSON || xhr.statusText);
            $("#myTotalEvents").text("0"); // Default to 0 in case of error
        }
    });
    
    

    // Fetch pending event requests
    $.ajax({
        url: "http://localhost:3000/api/total-events",
        method: "GET",
        success: function (data) {
            $("#totalEvents").text(data.totalEvents);
        },
        error: function () {
            console.error("❌ Error fetching total events");
        }
    });

    // Handle click event for "My Registered Events" link
    $('a[href="../pages/myRegisterEvents.html"]').on("click", function (e) {
        e.preventDefault();

        $.ajax({
            url: `http://localhost:3000/api/student-events/${student.student_id}`,
            type: "GET",
            success: function (response) {
                console.log("✅ Student Registered Events:", response);

                if (response.success && response.events.length > 0) {
                    window.location.href = "../pages/myRegisterEvents.html";
                } else {
                    alert("You have not registered for any events yet.");
                }
            },
            error: function (xhr) {
                console.error("❌ Error checking registered events:", xhr.responseJSON || xhr.statusText);
            }
        });
    });
});
