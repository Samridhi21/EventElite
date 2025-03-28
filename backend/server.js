const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const mysql = require("mysql2");
const cron = require("node-cron");

const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require("./routes/facultyRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({origin:"*"}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'samridhi@123',
    database: 'login_html',
    timezone: "+05:30", 
    dateStrings: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database');
    connection.release();
});

// Static folder for uploaded images
const upload = multer({
    dest: "uploads/", // Uploads folder where images will be stored
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const mimeType = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimeType && extname) {
            return cb(null, true);
        }
        return cb(new Error("Only image files are allowed"));
    },
});

//  Serve static files (HTML, CSS, JS, Images)
app.use(express.static(path.join(__dirname, '../frontend')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname,'../frontend/pages/home.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/about.html'));
});

app.get('/event.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/event.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/register.html'));
});

app.get('/upcominEvents', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/upcominEvents.html'));
});

// Route to fetch events
app.get("/api/events", (req, res) => {
    const sql = "SELECT * FROM event ORDER BY start_date ASC"; // Fetch in ascending order
    db.query(sql, (err, result) => {
        if (err) {
            console.error("❌ Error fetching events:", err);
            return res.status(500).json({ error: "Failed to fetch events" });
        }

        // Ensure correct image URL
        result = result.map(event => ({
            ...event,
            image: event.image && !event.image.startsWith("http")  
                ? `http://localhost:3000/uploads/${event.image}`  
                : event.image 
        }));

        res.json(result);
    });
});


app.use('/api/admin',adminRoutes);
app.use('/api/students',studentRoutes);
app.use('/api/faculty',facultyRoutes);
app.use("/admin/api", adminRoutes);
app.use("/api",adminRoutes);
app.use("/admin/api", eventRoutes);
app.use("/events", eventRoutes);
app.use("/api", eventRoutes);
app.use("/api", registrationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api",studentRoutes);
app.use("/api",facultyRoutes);

// Auto-delete expired events (Runs every night at 12:00 AM)
cron.schedule("0 0 * * *", function () {
    console.log("🗑️ Running event cleanup task...");
    deleteExpiredEvents();
});

cron.schedule("0 0 * * *", () => {
    console.log("🔄 Running scheduled cleanup...");
    deleteExpiredEvents();
    adminController.deleteExpiredRegistrations();
});

app.get("/api/deleteExpiredEvents", (req, res) => {
    deleteExpiredEvents();
    res.json({ message: "✅ Expired events cleanup triggered successfully." });
});

// Function to delete expired events
function deleteExpiredEvents() {
    console.log("🔄 Checking for expired events...");

    const moveEventsQuery = `
        INSERT INTO past_events (event_id, title, description, start_date, end_date, time, venue)
        SELECT event_id, title, description, start_date, end_date, time, venue 
        FROM event 
        WHERE end_date < CURDATE();
    `;

    db.query(moveEventsQuery, (err, result) => {
        if (err) {
            console.error("❌ Error moving expired events:", err);
            return;
        }
        console.log(`✅ Moved ${result.affectedRows} expired events to archive.`);

        // ✅ Count total past events
        db.query("SELECT COUNT(*) AS total FROM past_events", (err, countResult) => {
            if (err) {
                console.error("❌ Error counting past events:", err);
                return;
            }
            console.log(`📊 Total past events stored: ${countResult[0].total}`);
        });
    });

    const deleteRegistrationsQuery = `
        DELETE r FROM registration r
        JOIN event e ON r.event_id = e.event_id
        WHERE e.end_date < CURDATE();
    `;

    db.query(deleteRegistrationsQuery, (err, result) => {
        if (err) {
            console.error("❌ Error deleting expired registrations:", err);
            return;
        }
        console.log(`🗑️ Deleted ${result.affectedRows} expired registrations.`);
    });

    const deleteEventsQuery = `
        DELETE FROM event WHERE end_date < CURDATE();
    `;

    db.query(deleteEventsQuery, (err, result) => {
        if (err) {
            console.error("❌ Error deleting expired events:", err);
            return;
        }
        console.log(`🗑️ Deleted ${result.affectedRows} expired events from main table.`);
    });
}




app.listen(PORT, (req, res) => {
    console.log(`Server running on port ${PORT}`);
});
