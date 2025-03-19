const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");

// Student enrolls in an event
// router.post("/enroll", registrationController.enrollStudent);

// Route to handle student registration for an event
router.post("/register", registrationController.registerStudent);

// Route to get all registrations for a specific event
router.get("/registrations/:eventId", registrationController.getRegistrationsByEvent);

// Route to get all student registrations
router.get("/registrations", registrationController.getAllRegistrations);

router.get("/registered-students", registrationController.getRegisteredStudents);

router.get("/student-events/:studentId", registrationController.getStudentRegisteredEvents);

router.post("/approve-payment", registrationController.approvePayment);

router.get("/api/student-events/:student_id", (req, res) => {
    const student_id = req.params.student_id;
    const query = `
        SELECT 
            e.title, 
            e.start_date, 
            e.time, 
            e.venue, 
            e.fee, 
            r.registration_date, 
            r.payment_status,
            r.participation_status
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
            res.json({ success: false, events: [] });
        }
    });
});


module.exports = router;
