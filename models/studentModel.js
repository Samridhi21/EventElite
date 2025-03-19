const db = require("../config/db");

// const Student = {
//     create: (studentData, callback) => {
//         const { name, father_name, roll_no, studentClass, phone, email, password, department } = studentData;
//         const query = "INSERT INTO student (name, father_name, roll_no, class, phone, email, password, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
//         const values = [name, father_name, roll_no, studentClass, phone, email, password, department];

//         db.query(query, values, callback);
//     },

//     findByName: (name, callback) => {
//         const query = "SELECT * FROM student WHERE name = ?";
//         db.query(query, [name], callback);
//     },

//     findByCredentials: (name, password, callback) => {
//         const query = "SELECT * FROM student WHERE name = ? AND password = ?";
//         db.query(query, [name, password], callback);
//     }
// };

// Get student by ID
exports.getStudentById = function (studentId, callback) {
    db.query("SELECT * FROM student WHERE student_id = ?", [studentId], function (err, results) {
        if (err) return callback(err, null);
        callback(null, results.length ? results[0] : null);
    });
};

// Get total event count
exports.getTotalEvents = function (callback) {
    db.query("SELECT COUNT(*) AS totalEvents FROM event", function (err, results) {
        if (err) return callback(err, null);
        callback(null, results[0].totalEvents);
    });
};

// Get enrolled event count for a student
exports.getEnrolledEvents = function (studentId, callback) {
    db.query("SELECT COUNT(*) AS enrolledEventsCount FROM registration WHERE admin_id = ?", [studentId], function (err, results) {
        if (err) return callback(err, null);
        callback(null, results[0].enrolledEventsCount);
    });
};

// Get pending event requests count
exports.getPendingRequests = function (studentId, callback) {
    db.query("SELECT COUNT(*) AS pendingRequestsCount FROM event WHERE organizer_id = ? AND status = 'pending'", [studentId], function (err, results) {
        if (err) return callback(err, null);
        callback(null, results[0].pendingRequestsCount);
    });
};