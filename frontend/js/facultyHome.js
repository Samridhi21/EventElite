document.addEventListener("DOMContentLoaded", function () {
    // Get faculty from localStorage
    const facultyData = localStorage.getItem("faculty");
    if (!facultyData) {
        window.location.href = "login.html"; // Redirect if not logged in
        return;
    }

    // Display Faculty Name
    const faculty = JSON.parse(facultyData);
    document.getElementById("facultyName").textContent = faculty.name;

    // Logout Function
    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("faculty");
        alert("Logged out successfully!");
        window.location.href = "login.html";
    });

    // Fetch Faculty Dashboard Data
    $.ajax({
        url: "http://localhost:5000/api/faculty/dashboard",
        type: "GET",
        dataType: "json",
        success: function (data) {
            $("#totalEvents").text(data.totalEvents);
            $("#totalStudents").text(data.totalStudents);
            $("#totalFeedback").text(data.totalFeedback);
        },
        error: function () {
            console.error("Error fetching faculty dashboard data.");
        }
    });
});

$(document).ready(function () {
    $.ajax({
        url: "http://localhost:3000/api/pending-approvals",
        type: "GET",
        success: function (response) {
            const approvalList = $("#approval-list");
            approvalList.empty();

            response.approvals.forEach(approval => {
                approvalList.append(`
                    <tr>
                        <td>${approval.student_name}</td>
                        <td>${approval.event_title}</td>
                        <td>${approval.payment_status === "paid" ? "✅ Paid" : "⌛ Pending"}</td>
                        <td>
                            <button class="approve" data-id="${approval.registration_id}">✅ Approve</button>
                            <button class="reject" data-id="${approval.registration_id}">❌ Reject</button>
                        </td>
                    </tr>
                `);
            });
        },
        error: function () {
            console.error("❌ Error fetching pending approvals.");
        }
    });

    $(document).on("click", ".approve, .reject", function () {
        const registrationId = $(this).data("id");
        const approvalStatus = $(this).hasClass("approve") ? "approved" : "rejected";

        $.ajax({
            url: "http://localhost:3000/api/approve-payment",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ registrationId, approvalStatus }),
            success: function (response) {
                alert(response.message);
                location.reload();
            },
            error: function () {
                console.error("❌ Error approving/rejecting payment.");
            }
        });
    });

    // ✅ Fetch Upcoming Events
    function fetchUpcomingEvents() {
        $.ajax({
            url: "http://localhost:3000/api/upcoming-events/count",
            type: "GET",
            success: function (response) {
                $("#totalEvents").text(response.totalUpcomingEvents || 0);
            },
            error: function () {
                console.error("❌ Error fetching upcoming events count.");
            }
        });
    }
    fetchUpcomingEvents();

    // ✅ Fetch Registered Students
    function fetchRegisteredStudents() {
        $.ajax({
            url: "http://localhost:3000/api/students/registered/count",
            type: "GET",
            success: function (response) {
                $("#totalStudents").text(response.totalRegisteredStudents || 0);
            },
            error: function () {
                console.error("❌ Error fetching registered students count.");
            }
        });
    }
    fetchRegisteredStudents();

    // ✅ Fetch Pending Approvals Count
    function fetchPendingApprovals() {
        $.ajax({
            url: "http://localhost:3000/api/pending-approvals/count",
            type: "GET",
            success: function (response) {
                $("#pendingPayments").text(response.pendingApprovals || 0);
            },
            error: function () {
                console.error("❌ Error fetching pending approvals count.");
            }
        });
    }
    fetchPendingApprovals();
});
