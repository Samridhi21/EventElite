const eventModel = require("../models/eventModel");
const db = require("../config/db");
// const upload = require("../middlewares/uploadMiddleware");
const multer = require('multer');
const path = require('path');
const fs = require("fs");
const {sendEmail} = require('../utils/emailService');

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Storage setup
const storage = multer.diskStorage({
    destination: "./uploads", // Ensure "uploads" directory exists
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage }).single("image");
 

exports.createEvent = (req, res) => {
    console.log("📌 Received request to create event");

    upload(req, res, (err) => {
        if (err) {
            console.error("❌ Image upload failed:", err);
            return res.status(500).json({ error: "Image upload failed" });
        }

        const { title, description, start_date, end_date, time, venue, category, fee, status } = req.body;
        const imagePath = req.file ? req.file.filename : null;
        
        console.log("📌 Event Details Received:", { title, start_date, end_date });

        // ✅ Check if event date is already booked
        const checkDateSQL = `SELECT * FROM event WHERE (start_date BETWEEN ? AND ?) OR (end_date BETWEEN ? AND ?)`;
        db.query(checkDateSQL, [start_date, end_date, start_date, end_date], (err, results) => {
            if (err) {
                console.error("❌ Database error while checking dates:", err);
                return res.status(500).json({ error: "Database error while checking dates" });
            }

            if (results.length > 0) {
                console.warn("⚠️ Event date conflict detected!");
                return res.status(400).json({ error: "Event date already booked! Please choose another date." });
            }

            // ✅ Insert event
            const insertSQL = `INSERT INTO event (title, description, start_date, end_date, time, venue, category, fee, status, image) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [title, description, start_date, end_date, time, venue, category, fee, status, imagePath];

            db.query(insertSQL, values, (err, result) => {
                if (err) {
                    console.error("❌ Failed to create event:", err);
                    return res.status(500).json({ error: "Failed to create event" });
                }
                
                console.log("✅ Event created successfully, Event ID:", result.insertId);

                // ✅ Fetch students for email notification
                const studentQuery = "SELECT email, name FROM student";
                db.query(studentQuery, (err, students) => {
                    if (err) {
                        console.error("❌ Error fetching student emails:", err);
                        return res.status(500).json({ error: "Error fetching student emails." });
                    }

                    if (students.length === 0) {
                        console.warn("⚠️ No students found!");
                        return res.status(201).json({ message: "Event created, but no students to notify!" });
                    }

                    console.log("📧 Sending emails to students...");

                    const subject = `New Event Created: ${title}`;
                    const text = `Dear Student,\n\nA new event \"${title}\" has been created.\nYou can enroll now!\n\nDate: ${start_date} - ${end_date}\nTime: ${time}\nVenue: ${venue}\n\nBest Regards,\nEventElite Team`;

                    let emailsSent = 0;
                    students.forEach((student) => {
                        sendEmail(student.email, student.name, title, description, start_date, end_date, time, venue, (emailErr, info) => {
                            if (emailErr) {
                                console.error(`❌ Failed to send email to ${student.email}:`, emailErr);
                            } else {
                                console.log(`✅ Email sent to ${student.email}:`, info.response);
                            }

                            emailsSent++;
                            if (emailsSent === students.length) {
                                return res.status(201).json({ message: "Event created & notifications sent!" });
                            }
                        });
                    });
                });
            });
        });
    });
};




exports.getUpcomingEvents = (req, res) => {
    const sql = `
        SELECT * FROM event_request
        WHERE status = 'approved' 
        ORDER BY start_date ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Database Error (Fetching Events):", err);
            return res.status(500).json({ error: "Database error. Please try again." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No upcoming events found." });
        }

        res.status(200).json(results);
    });
};








exports.getEvents = (req, res) => {
    db.query("SELECT * FROM event", (err, results) => {
        if (err) {
            console.error("Error fetching events:", err);
            return res.status(500).json({ error: "Failed to fetch events" });
        }
        res.json(results);
    });
};


exports.getEventById = (req, res) => {
    const eventId = req.params.id;
    db.query("SELECT * FROM event WHERE event_id = ?", [eventId], (err, result) => {
        if (err) throw err;
        res.json(result[0]);
    });
};

// Get all events
exports.getAllEvents = function (req, res) {
    eventModel.getAllEvents(function (err, events) {
        if (err) {
            console.error("Error fetching events:", err);
            return res.status(500).json({ success: false, message: "Failed to fetch events" });
        }
        res.json({ success: true, events });
    });
};

// Update Event
exports.updateEvent = function (req, res) {
    const eventId = req.params.id;
    const updatedEvent = req.body;

    eventModel.updateEvent(eventId, updatedEvent, function (err, result) {
        if (err) {
            console.error("Error updating event:", err);
            return res.status(500).json({ success: false, message: "Failed to update event" });
        }
        res.json({ success: true, message: "Event updated successfully" });
    });
};

// Delete Event
exports.deleteEvent = function (req, res) {
    const eventId = req.params.id;

    eventModel.deleteEvent(eventId, function (err, result) {
        if (err) {
            console.error("Error deleting event:", err);
            return res.status(500).json({ success: false, message: "Failed to delete event" });
        }
        res.json({ success: true, message: "Event deleted successfully" });
    });
};

exports.getPastEvents = (req, res) => {
    const query = "SELECT COUNT(*) AS pastEventsCount FROM past_events WHERE end_date < CURDATE()";


    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching past events:", err);
            return res.status(500).json({ success: false, message: "Database error", error: err.message });
        }
        res.json(results);
    });
};

// ✅ Fetch total count of past events
exports.getPastEventsCount = (req, res) => {
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    const query = `SELECT COUNT(*) AS pastEvents FROM past_events WHERE end_date < ?`;

    db.query(query, [today], (err, results) => {
        if (err) {
            console.error("Error fetching past events count:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        res.json({ pastEvents: results[0].pastEvents });
    });
};

