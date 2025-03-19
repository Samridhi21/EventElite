const express = require("express");
const router = express.Router();
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


// router.get("/get-student/:name", (req, res) => {
//     const studentName = req.params.name;

//     if (!studentName) {
//         return res.status(400).json({ message: "Student name is required." });
//     }

//     db.query("SELECT student_id, name, class FROM student WHERE name = ?", [studentName], (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ message: "Internal Server Error" });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ message: "Student not found." });
//         }
//         res.json(results[0]); // Send student ID, name, and class
//     });
// });

// router.get("/get-event-requests", (req, res) => {
//     const sql = `
//         SELECT er.request_id, er.title, er.description, er.start_date, er.end_date, 
//                er.time, er.venue, er.status, s.name AS student_name, s.class 
//         FROM event_requests er
//         JOIN student s ON er.student_id = s.student_id
//         ORDER BY er.request_id DESC;
//     `;

//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error("Database error:", err);
//             return res.status(500).json({ message: "Internal Server Error" });
//         }
//         res.json(results);
//     });
// });
module.exports = router;
