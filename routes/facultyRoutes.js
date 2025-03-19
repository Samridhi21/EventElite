const express = require("express");
const router = express.Router();
const db = require("../config/db");
const facultyController = require("../controllers/facultyController");

// Faculty Login
router.post("/login", facultyController.facultyLogin);

// Faculty Registers a Student
router.post("/register-student", facultyController.registerStudent);

router.post("/approve-payment", facultyController.approvePayment);

// router.get("/pending-event-requests", facultyController.getPendingEventRequests);

// router.post("/api/approve-event-request", facultyController.approveEventRequest);


// // Fetch all pending event requests
// router.get("/api/faculty/event-requests", (req, res) => {
//     const sql = "SELECT * FROM event_requests WHERE status = 'pending'";
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ error: "Database error!" });
//         }
//         res.status(200).json(results);
//     });
// });

// // Approve event request
// router.put("/api/faculty/approve-event/:id", (req, res) => {
//     const requestId = req.params.id;
//     const sql = "UPDATE event_requests SET status = 'approved' WHERE request_id = ?";
    
//     db.query(sql, [requestId], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ error: "Database error!" });
//         }
//         res.status(200).json({ message: "Event approved successfully!" });
//     });
// });

// Reject event request
// router.put("/api/faculty/reject-event/:id", (req, res) => {
//     const requestId = req.params.id;
//     const sql = "UPDATE event_requests SET status = 'rejected' WHERE request_id = ?";
    
//     db.query(sql, [requestId], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ error: "Database error!" });
//         }
//         res.status(200).json({ message: "Event rejected!" });
//     });
// });

// router.get("/api/pending-event-requests", (req, res) => {
//     const query = `
//     SELECT er.request_id, s.name AS student_name, s.class AS student_class,
//            er.title AS event_title, -- ✅ This should be from event_requests table
//            er.description, er.start_date, er.end_date, er.time, er.venue
//     FROM event_requests er
//     JOIN student s ON er.student_id = s.student_id
//     WHERE er.status = 'pending'
// `;

//     db.query(query, (err, results) => {
//         if (err) {
//             console.error("Error fetching event requests:", err);
//             return res.status(500).json({ error: "Database error" });
//         }

//         console.log("Pending Requests Data:", results); // DEBUGGING OUTPUT
//         res.json({ eventRequests: results });
//     });
// });


module.exports = router;
