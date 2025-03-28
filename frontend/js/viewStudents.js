$(document).ready(function () {
    $.ajax({
        url: "http://localhost:3000/api/students", // Ensure this matches your backend route
        type: "GET",
        dataType: "json",
        success: function (response) {
            const studentList = $("#studentList");
            studentList.empty();

            response.students.forEach(student => {
                studentList.append(`
                    <tr>
                        <td>${student.student_id}</td>
                        <td>${student.name}</td>
                        <td>${student.roll_no}</td>
                        <td>${student.phone}</td>
                        <td>${student.father_name}</td>
                        <td>${student.email}</td>
                    </tr>
                `);
            });
        },
        error: function (xhr) {
            console.error("❌ Error fetching students:", xhr.responseText);
        }
    });
});
