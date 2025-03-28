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

router.get("/past-events-count", (req, res) => {
  const query = "SELECT COUNT(*) AS pastEvents FROM past_events WHERE end_date < CURDATE()";

  db.query(query, (err, result) => {
      if (err) {
          console.error("❌ Error fetching past events:", err);
          return res.status(500).json({ error: "Internal Server Error", details: err.message });
      }
      console.log("✅ Past Events Count:", result[0].pastEvents); // Debugging log
      res.json({ pastEvents: result[0].pastEvents });
  });
});


// ✅ Fetch Pending Payments Count
router.get("/pending-payments", (req, res) => {
  const query = "SELECT COUNT(*) AS pendingPayments FROM registration WHERE payment_status = 'pending'";

  db.query(query, (err, result) => {
      if (err) {
          console.error("❌ Error fetching pending payments:", err);
          return res.status(500).json({ error: "Internal Server Error", details: err.message });
      }

      console.log("✅ Pending Payments Count:", result[0].pendingPayments);
      res.json({ pendingPayments: result[0].pendingPayments });
  });
});


router.get("/latest-event", (req, res) => {
  console.log("Fetching latest event title..."); // ✅ Debugging log

  const query = `
    SELECT title 
    FROM event 
    WHERE start_date >= CURDATE() 
    ORDER BY start_date ASC 
    LIMIT 1
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("❌ Error fetching latest event title:", error);
      return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }

    console.log("Database query executed:", results); // ✅ Debugging log

    if (results.length > 0) {
      res.json({ title: results[0].title }); // ✅ Send only the title
    } else {
      res.json({ message: "No upcoming events found" });
    }
  });
});

router.post("/send-event-confirmation", adminController.sendEventConfirmation);

// router.get("/workshop-events", async (req, res) => {
//   try {
//       const [events] = await db.execute("SELECT * FROM event WHERE category = 'Workshop'");

//       if (!Array.isArray(events)) {
//           return res.status(500).json({ error: "Invalid data format: Expected an array." });
//       }

//       res.status(200).json(events);
//   } catch (error) {
//       console.error("❌ Error fetching workshop events:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//   }
// });







module.exports = router;
