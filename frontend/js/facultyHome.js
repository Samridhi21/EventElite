$(document).ready(function () {
    const approvalList = $("#approval-list");
    const messageBox = $("#message-box");
    const eventRequestsContainer = $("#eventRequestsContainer");

    function showMessage(message, type) {
        messageBox.html(`<p class="${type}">${message}</p>`).fadeIn();
        setTimeout(() => messageBox.fadeOut(), 3000);
    }

    function showLoading(container, colspan = 1) {
        container.html(`<tr><td colspan='${colspan}'>Loading...</td></tr>`);
    }

    function fetchPendingApprovals() {
        showLoading(approvalList, 4);
        $.ajax({
            url: "http://localhost:3000/api/pending-approvals",
            type: "GET",
            success: function (response) {
                approvalList.empty();
    
                // Ensure response.approvals exists and is an array
                if (!response || !Array.isArray(response.approvals)) {
                    // console.error("Invalid response format:", response);
                    approvalList.html("<tr><td colspan='4'>Error loading pending approvals.</td></tr>");
                    return;
                }
    
                if (response.approvals.length === 0) {
                    approvalList.html("<tr><td colspan='4'>No pending approvals.</td></tr>");
                } else {
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
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching pending approvals:", error);
                approvalList.html("<tr><td colspan='4'>Failed to load pending approvals.</td></tr>");
            }
        });
    }

    $(document).on("click", ".approve, .reject", function () {
        const registrationId = $(this).data("id");
        const approvalStatus = $(this).hasClass("approve") ? "approved" : "rejected";

        $.ajax({
            url: "http://localhost:3000/api/approve-payment",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ registrationId, approvalStatus }),
            success: function (response) {
                showMessage(response.message, "success");
                fetchPendingApprovals();
            },
            error: function () {
                showMessage("Approval failed. Try again!", "error");
            }
        });
    });

    function fetchPendingEventRequests() {
        eventRequestsContainer.html("<p>Loading event requests...</p>");
        $.ajax({
            url: "http://localhost:3000/api/pending-event-requests",
            type: "GET",
            success: function (response) {
                eventRequestsContainer.empty();
                if (response.eventRequests.length === 0) {
                    eventRequestsContainer.append("<p>No pending event requests.</p>");
                } else {
                    response.eventRequests.forEach(request => {
                        eventRequestsContainer.append(`
                            <div class="event-request-card">
                                <p><strong>Student Name:</strong> ${request.student_name}</p>
                                <p><strong>Class:</strong> ${request.student_class}</p>
                                <p><strong>Event Title:</strong> ${request.event_title}</p>
                                <p><strong>Description:</strong> ${request.description}</p>
                                <p><strong>Start Date:</strong> ${request.start_date}</p>
                                <p><strong>End Date:</strong> ${request.end_date}</p>
                                <p><strong>Time:</strong> ${request.time}</p>
                                <p><strong>Venue:</strong> ${request.venue}</p>
                                <button class="approve-event" data-id="${request.request_id}">✅ Approve</button>
                                <button class="reject-event" data-id="${request.request_id}">❌ Reject</button>
                            </div>
                            <hr>
                        `);
                    });
                }
            },
            error: function () {
                showMessage("Error fetching event requests. Please try again.", "error");
            }
        });
    }

    $(document).on("click", ".approve-event, .reject-event", function () {
        const eventRequestId = $(this).data("id");
        const approvalStatus = $(this).hasClass("approve-event") ? "approved" : "rejected";

        $.ajax({
            url: "http://localhost:3000/api/approve-event-request",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ eventRequestId, approvalStatus }),
            success: function (response) {
                showMessage(response.message, "success");
                fetchPendingEventRequests();
            },
            error: function () {
                showMessage("Failed to process event request. Try again!", "error");
            }
        });
    });

    fetchPendingApprovals();
    fetchPendingEventRequests();
});
