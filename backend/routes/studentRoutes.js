const express = require("express");
const router = express.Router();
const db = require('../config/db');
const studentController = require("../controllers/studentController");

router.post('/login',studentController.loginStudent);
router.post('/register',studentController.registerStudent)
router.get('/count',studentController.getTotalStudents);
// Route to get student profile
router.get("/profile/:id", studentController.getStudentProfile);

// Route to get total number of events
router.get("/events/count", studentController.getTotalEvents);

// Route to get enrolled events for a student
router.get("/:id/enrolled-events", studentController.getEnrolledEvents);

// Route to get pending event requests for a student
router.get("/:id/pending-requests", studentController.getPendingRequests);

router.get("/api/student-events/:student_id", (req, res) => {
    const student_id = req.params.student_id;
    
    const query = `
        SELECT e.title, e.start_date, e.time, e.venue, e.fee, r.registration_date, r.payment_status
        FROM registration r
        JOIN event e ON r.event_id = e.event_id
        WHERE r.student_id = ?`;

    db.query(query, [student_id], (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        
        if (results.length > 0) {
            res.json({ success: true, events: results });
        } else {
            res.json({ success: false, events: [] });  // ✅ Return empty list if no events
        }
    });
});

// Get all students
router.get("/students", (req, res) => {
    const sql = "SELECT student_id, name, roll_no, phone, father_name, email FROM student";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error fetching students:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ students: results });
    });
});

// 🔹 Fetch Total Number of Events
router.get("/total-events", (req, res) => {
    const sql = "SELECT COUNT(*) AS totalEvents FROM event";
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ totalEvents: result[0].totalEvents });
    });
});

// ✅ Route to get the total number of enrolled students
router.get("/:student_id/enrolled-events", (req, res) => {
    const studentId = req.params.student_id;

    const sql = `
        SELECT COUNT(*) AS enrolledEventsCount
        FROM registration
        WHERE student_id = ? AND payment_status = 'paid'
    `;

    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching enrolled events count:", err);
            return res.status(500).json({ success: false, message: "Database error", error: err });
        }

        res.json({ success: true, enrolledEventsCount: results[0].enrolledEventsCount });
    });
});






module.exports = router;
