if (typeof jQuery == "undefined") {
    console.error("jQuery is not loaded!");
} else {
    console.log("jQuery is loaded successfully!");
}



$(document).ready(function () {
    $("#loginForm").submit(function (event) {
        event.preventDefault(); // Prevent form submission

        const name = $("#name").val();
        const password = $("#password").val();

        function resetForm() {
            $("#loginForm")[0].reset();
        }

        console.log("Attempting Login...");

        // ✅ Try Admin Login
        $.ajax({
            url: "http://localhost:3000/api/admin/login",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ name, password }),
            success: function (response) {
                console.log("Admin Login Response:", response);
                alert(response.message);

                if (response.adminId) { // ✅ Check for adminId instead of admin
                    localStorage.setItem("admin", JSON.stringify({ name: name }));
                    console.log("Admin stored in localStorage:", localStorage.getItem("admin"));
                    resetForm();
                    window.location.href = "adminHome.html"; // ✅ Redirect Admin
                } else {
                    console.error("Admin data not found in response");
                }
            },

            error: function () {
                console.log("Admin Login Failed. Trying Faculty Login...");
                // ✅ Try Faculty Login if Admin fails
                $.ajax({
                    url: "http://localhost:3000/api/faculty/login",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({ name, password }),
                    success: function (response) {
                        console.log("Faculty Login Response:", response);
                        alert(response.message);

                        if (response.faculty) { // ✅ Check if faculty object exists
                            localStorage.setItem("faculty", JSON.stringify(response.faculty)); // Store faculty details
                            window.location.href = "facultyHome.html"; // Redirect Faculty
                        } else {
                            console.error("Faculty data missing in response");
                        }
                    },
                    error: function () {
                        console.log("Faculty Login Failed. Trying Student Login...");
                        // ✅ Try Student Login if Faculty fails
                        $.ajax({
                            url: "http://localhost:3000/api/students/login",
                            type: "POST",
                            contentType: "application/json",
                            data: JSON.stringify({ name, password }),
                            success: function (response) {
                                console.log("Student Login Response:", response);
                                alert(response.message);
                        
                                if (response.student) {
                                    // ✅ Store full student object in localStorage
                                    localStorage.setItem("student", JSON.stringify(response.student)); 
                                    console.log("Stored Student Data:", localStorage.getItem("student")); 
                                    resetForm();
                        
                                    setTimeout(() => {
                                        window.location.href = "studentHome.html";
                                    }, 500);
                                } else {
                                    console.error("Student data not found in response");
                                }
                            },
                            error: function (xhr) {
                                alert(xhr.responseJSON ? xhr.responseJSON.error : "Login failed. Please try again.");
                            }
                        });
                    }
                });
            }
        });
    });
});