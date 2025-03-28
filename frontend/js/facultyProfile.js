$(document).ready(function () {
    // Get faculty from localStorage
    const facultyData = localStorage.getItem("faculty");
    if (!facultyData) {
        alert("Unauthorized access! Redirecting to login.");
        window.location.href = "login.html";
        return;
    }

    const faculty = JSON.parse(facultyData);
    const facultyId = faculty.faculty_id; // Assuming faculty_id is stored in localStorage

    // Fetch Faculty Profile
    $.ajax({
        url: `http://localhost:3000/api/faculty/profile/${facultyId}`,
        type: "GET",
        success: function (response) {
            $("#facultyName").text(response.name);
            $("#facultyEmail").text(response.email);
            $("#facultyPhone").text(response.phone);
            $("#facultyDepartment").text(response.department);
        },
        error: function () {
            console.error("❌ Error fetching faculty profile.");
        }
    });

    // Logout
    $("#logoutBtn").click(function () {
        localStorage.removeItem("faculty");
        alert("Logged out successfully!");
        window.location.href = "login.html";
    });
});
