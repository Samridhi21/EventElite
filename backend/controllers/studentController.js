const db = require("../config/db");
const Student = require("../models/studentModel");

// Function to generate a random password
const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) { // Generate an 8-character password
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Student Registration
exports.registerStudent = (req, res) => {
    const { name, father_name, roll_no, studentClass, phone, email } = req.body; 

    if (!name || !father_name || !roll_no || !studentClass || !phone || !email) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const password = generateRandomPassword(); // Generate random password

    const query = `INSERT INTO student (name, roll_no, class, phone, father_name, email, password) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [name, roll_no, studentClass, phone, father_name, email, password];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Database Error:", err.sqlMessage || err);
            return res.status(500).json({ error: "Database error" });
        }

        res.status(201).json({ 
            message: "Student registered successfully!", 
            student: { 
                student_id: result.insertId,
                name, 
                roll_no, 
                email, 
                password // Returning generated password
            } 
        });
    });
};

// Student Login
exports.loginStudent = (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: "Name and password are required" });
    }

    const sql = "SELECT * FROM student WHERE name = ? AND password = ?";

    db.query(sql, [name, password], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        console.log("Query Result:", results); // Debugging log
        
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid name or password" });
        }

        res.json({ 
            message: "Student login successful", 
            student: {
                student_id: results[0].student_id,
                name: results[0].name,
                father_name: results[0].father_name,
                roll_no: results[0].roll_no,
                phone: results[0].phone,
                email: results[0].email,
                class: results[0].class
                
            } 
        });
    });
};

// ✅ Fetch Total Students Count
exports.getTotalStudents = (req, res) => {
    const sql = "SELECT COUNT(*) AS totalStudents FROM student";  

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.length > 0) {
            res.json({ totalStudents: result[0].totalStudents });
        } else {
            res.json({ totalStudents: 0 });
        }
    });
};


// Get Student Profile
// exports.getStudentProfile = (req, res) => {
//     const student_id = req.params.id;
//     Student.getStudentById(student_id, (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json(result[0]);
//     });
// };


exports.getStudentProfile = (req, res) => {
    const studentId = req.params.id;

    console.log(`🔍 Fetching student profile for ID: ${studentId}`);

    const query = "SELECT * FROM student WHERE student_id = ?";
    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching student profile:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            console.log("⚠️ No student found with this ID.");
            return res.status(404).json({ error: "Student not found" });
        }

        console.log("✅ Student Profile Data:", results[0]);
        res.json(results[0]); 
    });
};

// Get total event count
exports.getTotalEvents = function (req, res) {
    Student.getTotalEvents(function (err, totalEvents) {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ totalEvents });
    });
};

// Get enrolled events for a student
exports.getEnrolledEvents = function (req, res) {
    const studentId = req.params.id;

    Student.getEnrolledEvents(studentId, function (err, enrolledEventsCount) {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ enrolledEventsCount });
    });
};

// Get pending requests for a student
exports.getPendingRequests = function (req, res) {
    const studentId = req.params.id;

    Student.getPendingRequests(studentId, function (err, pendingRequestsCount) {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ pendingRequestsCount });
    });
};

exports.getEnrolledEvents = (req, res) => {
    const studentId = req.params.student_id;

    const query = `
        SELECT e.event_id, e.title, e.start_date, e.end_date ,e.time, e.venue, e.fee, r.participation_status
        FROM registration r
        JOIN event e ON r.event_id = e.event_id
        WHERE r.student_id = ?
    `;

    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching enrolled events:", err.sqlMessage || err);
            return res.status(500).json({ success: false, message: "Database error", error: err.sqlMessage || err });
        }

        res.json({ success: true, enrolledEvents: results });
    });
};

// exports.getStudentEnrolledEventsCount = (req, res) => {
//     const { student_id } = req.params; // Get student ID from request URL

//     if (!student_id) {
//         return res.status(400).json({ success: false, message: "Student ID is required" });
//     }

//     const query = `
//         SELECT COUNT(*) AS enrolledEventsCount 
//         FROM registration 
//         WHERE student_id = ? AND payment_status = 'paid'`; // ✅ Fixed query

//     db.query(query, [student_id], (err, results) => {
//         if (err) {
//             console.error("❌ Error fetching enrolled events count:", err);
//             return res.status(500).json({ success: false, message: "Server error" });
//         }

//         res.json({ success: true, enrolledEventsCount: results[0].enrolledEventsCount || 0 });
//     });
// };

// exports.getStudentEnrolledEventsCount = (req, res) => {
//     const { student_id } = req.params; // Get student ID from request URL

//     if (!student_id) {
//         return res.status(400).json({ success: false, message: "Student ID is required" });
//     }

//     const query = `
//         SELECT COUNT(*) AS enrolledEventsCount 
//         FROM registration 
//         WHERE student_id = ? AND payment_status = 'paid'`; // ✅ Fixed query

//     db.query(query, [student_id], (err, results) => {
//         if (err) {
//             console.error("❌ Error fetching enrolled events count:", err);
//             return res.status(500).json({ success: false, message: "Server error" });
//         }

//         res.json({ success: true, enrolledEventsCount: results[0].enrolledEventsCount || 0 });
//     });
// };