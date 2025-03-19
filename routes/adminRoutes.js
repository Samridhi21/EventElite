const express = require('express');
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const { getPendingApprovals, approvePayment } = require("../controllers/adminController");
const { addEvent, getEvents, updateEvent } = require("../controllers/adminController");
const adminController = require('../controllers/adminController');
// const studentController = require('../controllers/studentController')

const storage = multer.memoryStorage(); // Store image in memory
const upload = multer({ storage: storage });

router.post("/api/events/create", upload.single("image"), adminController.createEvent);

router.post("/create-event", upload.single("image"), async (req, res) => {
  try {
      const { title, description, start_date, end_date, time, venue, category, fee, status } = req.body;
      const image = req.file ? req.file.buffer.toString("base64") : null;

      const newEvent = await addEvent({ title, description, start_date, end_date, time, venue, category, fee, status, image });
      res.status(201).json(newEvent);
  } catch (error) {
      res.status(500).json({ error: "Error creating event" });
  }
});

router.get("/events", async (req, res) => {
  try {
      const events = await getEvents();
      res.status(200).json(events);
  } catch (error) {
      res.status(500).json({ error: "Error fetching events" });
  }
});

router.put("/update-event/:id", upload.single("image"), async (req, res) => {
  try {
      const { title, description, start_date, end_date, time, venue, category, fee, status } = req.body;
      const image = req.file ? req.file.buffer.toString("base64") : null;

      const updatedEvent = await updateEvent(req.params.id, { title, description, start_date, end_date, time, venue, category, fee, status, image });
      res.status(200).json(updatedEvent);
  } catch (error) {
      res.status(500).json({ error: "Error updating event" });
  }
});

router.post("/login",adminController.adminLogin);

router.post("/create-admin, adminController.createAdmin");

router.get("/api/events", (req, res) => {
  db.getConnection((err, connection) => {
      if (err) {
          console.error("❌ Database connection failed:", err.message);
          return res.status(500).json({
              success: false,
              message: "Database connection failed",
              error: err.message
          });
      }

      connection.query("SELECT * FROM event", (err, results) => {
          connection.release(); // Release the connection back to the pool

          if (err) {
              console.error("❌ Error fetching events:", err.message);
              return res.status(500).json({
                  success: false,
                  message: "Server error",
                  error: err.message
              });
          }

          res.json({ success: true, events: results });
      });
  });
});

// Route to check user role by password
router.post('/verify', async (req, res) => {
  console.log("✅ Received request at /verify");
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    console.log("Received Password:", password); // ✅ Debugging log

    // Check Admin Table
    const [admin] = await db.promise().query(`SELECT * FROM admin WHERE password = ?`, [password]);
    if (admin.length > 0) {
      return res.json({ role: "admin", name: admin[0].name });
    }

    // Check Faculty Table
    const [faculty] = await db.promise().query(`SELECT * FROM faculty WHERE password = ?`, [password]);
    if (faculty.length > 0) {
      return res.json({ role: "faculty", name: faculty[0].name });
    }

    // Check Student Table
    const [student] = await db.promise().query(`SELECT * FROM student WHERE password = ?`, [password]);
    if (student.length > 0) {
      return res.status(403).json({ error: `${student[0].name} does not have access to create an event.` });
    }

    return res.status(401).json({ error: "Invalid credentials" });

  } catch (error) {
    console.error("Error verifying password:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// Delete an event by ID
router.delete("/events/:id", (req, res) => {
  const eventId = req.params.id;

  db.query("DELETE FROM event WHERE event_id = ?", [eventId], (err, result) => {
      if (err) {
          console.error("Error deleting event:", err);
          return res.status(500).json({ error: "Internal Server Error" });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Event not found" });
      }

      res.status(200).json({ message: "Event deleted successfully" });
  });
});

router.get("/dashboard", (req, res) => {
  // Fetch total number of events
  db.query("SELECT COUNT(*) AS totalEvents FROM event", (err, events) => {
      if (err) {
          console.error("Error fetching total events:", err);
          return res.status(500).json({ message: "Error fetching total events" });
      }

      // Fetch total number of students
      db.query("SELECT COUNT(*) AS totalStudents FROM student", (err, students) => {
          if (err) {
              console.error("Error fetching total students:", err);
              return res.status(500).json({ message: "Error fetching total students" });
          }

          // Fetch pending payments
          db.query(
              "SELECT COUNT(*) AS pendingPayments FROM payment WHERE transaction_status = 'pending'",
              (err, payments) => {
                  if (err) {
                      console.error("Error fetching pending payments:", err);
                      return res.status(500).json({ message: "Error fetching pending payments" });
                  }

                  res.json({
                      totalEvents: events[0].totalEvents,
                      totalStudents: students[0].totalStudents,
                      pendingPayments: payments[0].pendingPayments,
                  });
              }
          );
      });
  });
});


// router.get("/api/pending-event-requests", (req, res) => {
//   const sql = `
//       SELECT er.request_id, s.name AS student_name, s.class AS student_class,
//              er.title AS event_title, -- ✅ Correct title from event_requests table
//              er.description, er.start_date, er.end_date, er.time, er.venue
//       FROM event_requests er
//       JOIN student s ON er.student_id = s.student_id
//       WHERE er.status = 'pending'
//   `;

//   db.query(sql, (err, results) => {
//       if (err) {
//           console.error("Error fetching event requests:", err);
//           return res.status(500).json({ error: "Database error" });
//       }
//       res.json({ eventRequests: results });
//   });
// });

// router.get("/pending-approvals", (req, res) => {
//   const query = "SELECT * FROM event WHERE status = 'pending'";

//   db.query(query, (err, results) => {
//       if (err) {
//           return res.status(500).json({ error: "Database query error" });
//       }
//       res.status(200).json(results); 
//   });
// });



// router.post("/api/approve-payment", approvePayment);




module.exports = router;
