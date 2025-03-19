document.getElementById("studentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3000/api/students/register", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    var studentData = {
        name: document.getElementById("name").value,
        father_name: document.getElementById("father_name").value,
        roll_no: document.getElementById("roll_no").value,
        studentClass: document.getElementById("class").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value
    };

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 201) {
                alert("Student Registered Successfully!");
                document.getElementById("studentForm").reset();
            } else {
                try {
                    var errorData = JSON.parse(xhr.responseText);
                    alert("Error: " + (errorData.error || "Unknown Error"));
                } catch (e) {
                    alert("Failed to register student. Server error.");
                }
            }
        }
    };

    xhr.send(JSON.stringify(studentData));
});
