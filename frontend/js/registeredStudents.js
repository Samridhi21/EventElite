$(document).ready(function () {
    // ✅ Fetch registered students
    $.ajax({
        url: "http://localhost:3000/api/registered-students",
        type: "GET",
        success: function (response) {
            console.log("✅ Registered Students:", response);
            if (response.success && response.students.length > 0) {
                const studentList = $("#student-list");
                studentList.empty();

                response.students.forEach(student => {
                    studentList.append(`
                        <tr>
                            <td>${student.student_name}</td>
                            <td>${student.email}</td>
                            <td>${student.event_title}</td>
                            <td>${student.registration_date}</td>
                            <td>${student.payment_status === "paid" ? "✅ Paid" : "⌛ Pending"}</td>
                            <td id="status-${student.registration_id}">
                                ${student.payment_status === "paid" ? "✅ Approved" : "⌛ Pending"}
                            </td>
                            <td>
                                ${student.payment_status === "paid" ? 
                                    "✅ Approved" : 
                                    `<button class="approve-btn" data-id="${student.registration_id}" data-status="paid">✅ Approve</button>
                                     <button class="reject-btn" data-id="${student.registration_id}" data-status="rejected">❌ Reject</button>`}
                            </td>
                        </tr>
                    `);
                });

                // ✅ Approve Payment
                $(".approve-btn").click(function () {
                    updatePaymentStatus($(this).data("id"), "paid");
                });

                // ❌ Reject Payment
                $(".reject-btn").click(function () {
                    updatePaymentStatus($(this).data("id"), "rejected");
                });
            } else {
                $("#student-list").html("<tr><td colspan='7'>No registered students found.</td></tr>");
            }
        },
        error: function (xhr) {
            console.error("❌ Error fetching registered students:", xhr.responseJSON || xhr.statusText);
        }
    });

    function updatePaymentStatus(registrationId, newStatus) {
        console.log(`🔄 Sending request to update payment status...`);
        console.log(`📌 Registration ID: ${registrationId}, New Status: ${newStatus}`);
    
        $.ajax({
            url: "http://localhost:3000/api/approve-payment",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ 
                registrationId, 
                newStatus: newStatus.trim()  // ✅ Ensure proper format
            }),
            success: function (response) {
                console.log("✅ Payment status updated:", response);
                $(`#status-${registrationId}`).html(newStatus === "paid" ? "✅ Approved" : "❌ Rejected");
                location.reload(); // Refresh UI
            },
            error: function (xhr) {
                console.error("❌ Error updating approval status:", xhr.responseJSON || xhr.statusText);
            }
        });
    }
});
