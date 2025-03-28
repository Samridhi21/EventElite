const express = require('express');
const multer = require("multer");
const path = require("path");
const router = express.Router();
const db = require("../config/db");
const eventController = require('../controllers/eventController'); // Import the controller as a whole
const { getPastEventsCount } = require("../controllers/eventController");


const uploadDir = path.join(__dirname, "../../uploads");
const fs = require("fs");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes
router.post("/events/create", eventController.createEvent);
router.post("/api/events/create", upload.single("image"),eventController.createEvent);  
router.get("/api/events", eventController.getAllEvents); 

router.get("/all", eventController.getEvents);

router.get("/events", (req, res) => {
    const query = "SELECT * FROM event ORDER BY start_date ASC"; 
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(results);
    });
});


router.get("/events/:id", eventController.getEventById); 
router.put("/events/:id", eventController.updateEvent);  
router.delete("/events/:id", eventController.deleteEvent);  


router.get("/api/pastEvents/count", (req, res) => {
    const sql = "SELECT COUNT(*) AS pastEventsCount FROM past_events WHERE end_date < CURDATE()";

    db.query(sql, (err, result) => {
        if (err) {
            console.error("❌ Error fetching past events count:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }

        console.log("✅ Past events count:", result);
        res.json({ count: result[0].pastEventsCount || 0 });
    });
});


// Fetch all past events
router.get("/pastEvents", (req, res) => {
    const sql = "SELECT * FROM past_events ORDER BY end_date DESC"; // Fetch past events in descending order

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error fetching past events:", err);
            return res.status(500).json({ error: "Failed to fetch past events" });
        }
        
        // Ensure results are always an array
        res.json(results || []);
    });
});

// Fetch total count of past events
router.get("/pastEvents/count", eventController.getPastEventsCount);

// Serve uploaded images
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Count total events
router.get("/count", async (req, res) => {
    try {
        const [result] = await db.promise().query("SELECT COUNT(*) AS total FROM event");
        res.json({ totalEvents: result[0].total });
    } catch (error) {
        console.error("Error fetching total events:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.get("/past-events-count", getPastEventsCount);





module.exports = router;
