const Faculty = require("../models/facultyModel");
const db = require("../config/db");


//faculty login
exports.facultyLogin = (req, res) => {
    const { name, password } = req.body;
    console.log("Faculty Login Attempt:", { name, password }); // Debugging

    Faculty.findByName(name, (err, faculty) => {
        if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!faculty) {
            console.error("Faculty Not Found in DB");
            return res.status(401).json({ error: "Invalid Faculty Name!" });
        }

        console.log("Faculty Found:", faculty); // Debugging

        // Ensure password is compared as a string
        if (String(faculty.password) !== String(password)) {
            console.error("Incorrect Password for:", faculty.name);
            return res.status(401).json({ error: "Invalid Password!" });
        }

        console.log("Faculty Login Successful:", faculty.name);
        res.json({ 
            message: `Welcome, ${faculty.name}!`, 
            faculty: faculty // Send full faculty object for frontend use
        });
    });
};



exports.getEventRequests = (req, res) => {
    const sql = `
        SELECT e.event_id, e.title, e.description, s.name AS student_name
        FROM event e
        JOIN student s ON e.organizer_id = s.student_id
        WHERE e.status = 'pending'
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching event requests:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
};

exports.updateEventStatus = (req, res) => {
    const { event_id, status } = req.body;
    const sql = "UPDATE event SET status = ? WHERE event_id = ?";

    db.query(sql, [status, event_id], (err) => {
        if (err) {
            console.error("Error updating event status:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Event status updated successfully!" });
    });
};



// ✅ Faculty can register a student
exports.registerStudent = (req, res) => {
    const { name, father_name, roll_no, studentClass, phone, email } = req.body;

    if (!name || !father_name || !roll_no || !studentClass || !phone || !email) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const password = Student.generateRandomPassword();

    const studentData = { name, father_name, roll_no, studentClass, phone, email, password };

    Student.registerStudent(studentData, (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.json({ message: "Student registered successfully!", student: { name, roll_no, email, password } });
    });
};

exports.approvePayment = (req, res) => {
    const { registrationId, approvalStatus } = req.body;

    if (!registrationId || !approvalStatus) {
        return res.status(400).json({ success: false, message: "Registration ID and approval status are required." });
    }

    const query = `
        UPDATE registration 
        SET faculty_approval_status = ?, payment_status = IF(? = 'approved', 'paid', 'pending') 
        WHERE registration_id = ?`;

    db.query(query, [approvalStatus, approvalStatus, registrationId], (err, result) => {
        if (err) {
            console.error("❌ Error updating payment status:", err);
            return res.status(500).json({ success: false, message: "Database error", error: err });
        }

        res.json({ success: true, message: "Payment status updated successfully!" });
    });
};


// Fetch all pending event requests


// exports.getPendingEventRequests = (req, res) => {
//     const sql = `SELECT * FROM event_requests WHERE status = 'pending' ORDER BY start_date ASC`;

//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error("❌ Database Error (Fetching Pending Requests):", err);
//             return res.status(500).json({ error: "Database error. Please try again." });
//         }

//         res.status(200).json(results);
//     });
// };



// exports.approveEventRequest = (req, res) => {
//     const { request_id } = req.body;

//     const getEventSQL = `SELECT * FROM event_requests WHERE request_id = ? AND status = 'pending'`;

//     db.query(getEventSQL, [request_id], (err, results) => {
//         if (err) {
//             console.error("❌ Database Error (Fetching Request):", err);
//             return res.status(500).json({ error: "Database error. Please try again." });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ error: "Event request not found or already processed." });
//         }

//         const event = results[0];

//         // Move to 'event' table
//         const insertEventSQL = `
//             INSERT INTO event (title, description, start_date, end_date, time, venue, status)
//             VALUES (?, ?, ?, ?, ?, ?, 'approved')
//         `;

//         db.query(insertEventSQL, 
//             [event.title, event.description, event.start_date, event.end_date, event.time, event.venue], 
//             (err, result) => {
//                 if (err) {
//                     console.error("❌ Database Error (Inserting Event):", err);
//                     return res.status(500).json({ error: "Database error. Please try again." });
//                 }

//                 // Remove from event_requests
//                 const deleteSQL = `DELETE FROM event_requests WHERE request_id = ?`;

//                 db.query(deleteSQL, [request_id], (err, deleteResult) => {
//                     if (err) {
//                         console.error("❌ Database Error (Deleting Request):", err);
//                         return res.status(500).json({ error: "Database error. Please try again." });
//                     }
//                     res.status(200).json({ message: "Event request approved and moved to upcoming events." });
//                 });
//             }
//         );
//     });
// };










