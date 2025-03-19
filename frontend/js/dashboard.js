document.addEventListener("DOMContentLoaded", function () {
    // ✅ Fetch student details from localStorage
    const studentData = localStorage.getItem("student");

    if (!studentData) {
        alert("No student data found! Please log in.");
        window.location.href = "login.html";
        return;
    }

    const student = JSON.parse(studentData);
    console.log("Loaded Student Data:", student); // Debugging

    // Function to safely update text content
    function setTextContent(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value ? value : "N/A";
        }
    }

    // ✅ Populate student details correctly
    setTextContent("studentName", student.name);
    setTextContent("studentId", student.student_id);
    setTextContent("rollNo", student.roll_no);
    setTextContent("fatherName", student.father_name);
    setTextContent("phone", student.phone);
    setTextContent("email", student.email);
    setTextContent("studentClass", student.class);

    // ✅ Logout function
    document.getElementById("logoutBtn").addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("student");
        alert("Logged out successfully!");
        window.location.href = "login.html";
    });
});
