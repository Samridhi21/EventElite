const express = require("express");
const router = express.Router();
const db = require("../config/db");
const facultyController = require("../controllers/facultyController");

// Faculty Login
router.post("/login", facultyController.facultyLogin);

// Faculty Registers a Student
router.post("/register-student", facultyController.registerStudent);

router.post("/approve-payment", facultyController.approvePayment);

// ✅ Route to get pending approvals
router.get("/pending-approvals", facultyController.getPendingApprovals);

// ✅ Route to get upcoming events count
router.get("/upcoming-events/count", facultyController.getUpcomingEventsCount);

// ✅ Route to get registered students count
router.get("/students/registered/count", facultyController.getRegisteredStudentsCount);

// ✅ Route to get pending approvals count
router.get("/pending-approvals/count", facultyController.getPendingApprovalsCount);

// Faculty Profile API
router.get("/profile/:faculty_id", (req, res) => {
    const facultyId = req.params.faculty_id;

    const sql = "SELECT name, email, phone, department FROM faculty WHERE faculty_id = ?";
    db.query(sql, [facultyId], (err, result) => {
        if (err) {
            console.error("Error fetching faculty profile:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        res.json(result[0]); // Return faculty profile
    });
});

module.exports = router;
