document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:3000/api/events")
        .then(response => response.json())
        .then(events => {
            const eventsContainer = document.getElementById("eventsContainer");

            if(!eventsContainer){
                console.log("Error: #eventsContainer is missing in the HTML.");
                return;
            }

            if(!events || events.length === 0){
                eventsContainer.innerHTML = "<p> No events available. </p>";
                return;
            }

            events.forEach(event => {
                const eventCard = document.createElement("div");
                eventCard.classList.add("event-card");
                eventsContainer.appendChild(eventCard);
            });
        })
        .catch(error => console.error("Error loading events:", error));
});

        $(document).ready(function () {
            const adminData = JSON.parse(localStorage.getItem("admin"));
            if (!adminData) {
                alert("Unauthorized access! Redirecting to login.");
                window.location.href = "login.html";
            } else {
                $("#adminName").text(adminData.name);
            }

            // ✅ Fetch Dashboard Data (Example API Calls)
            function fetchDashboardStats() {
                $.ajax({
                    url: "http://localhost:3000/api/admin/dashboard",
                    type: "GET",
                    success: function (response) {
                        $("#totalEvents").text(response.totalEvents || 0);
                        $("#totalUsers").text(response.totalUsers || 0);
                        $("#pendingPayments").text(response.pendingPayments || 0);
                    },
                    error: function () {
                        console.error("Error fetching dashboard data");
                    }
                });
            }
            fetchDashboardStats();

            function fetchTotalEvents() {
                $.ajax({
                    url: "http://localhost:3000/api/events/count",  // API to fetch total events
                    type: "GET",
                    success: function (response) {
                        $("#totalEvents").text(response.totalEvents || 0);
                    },
                    error: function () {
                        console.error("Error fetching total events count");
                    }
                });
            }
            fetchTotalEvents();

            // ✅ Fetch Total Students Count
        function fetchTotalStudents() {
            $.ajax({
                url: "http://localhost:3000/api/students/count",  // API to fetch total students
                type: "GET",
                success: function (response) {
                    $("#totalUsers").text(response.totalStudents || 0);
                },
                error: function () {
                    console.error("Error fetching total students count");
                }
            });
        }
        fetchTotalStudents();

        //✅ Fetch Total Past Events
        function fetchPastEvents() {
            $.ajax({
                url: "http://localhost:3000/api/past-events-count",
                type: "GET",
                success: function (response) {
                    console.log("✅ Past Events Count:", response.pastEvents); // Debugging log
                    $("#pastEventsCount").text(response.pastEvents || 0);
                },
                error: function (xhr) {
                    console.error("❌ Error fetching past events count:", xhr.responseJSON || xhr.statusText);
                }
            });
        }
        
        fetchPastEvents();

        function fetchPendingPayments() {
            $.ajax({
                url: "http://localhost:3000/api/pending-payments",
                type: "GET",
                success: function (response) {
                    console.log("✅ Pending Payments:", response.pendingPayments); // Debugging log
                    $("#pendingPayments").text(response.pendingPayments || 0);
                },
                error: function (xhr) {
                    console.error("❌ Error fetching pending payments:", xhr.responseJSON || xhr.statusText);
                }
            });
        }
        
        fetchPendingPayments();
        

            // ✅ Logout Functionality
            $("#logout").click(function () {
                localStorage.removeItem("admin");
                alert("Logged out successfully!");
                window.location.href = "login.html";
            });
        });