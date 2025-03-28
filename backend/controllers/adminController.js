const db = require("../config/db");
const multer = require("multer");
const fs = require('fs');
const sendEmail = require('../utils/emailService');


// Function to generate a random password
const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) { // Generate an 8-character password
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// ✅ Admin Login
exports.adminLogin = (req, res) => {
    const { name, password } = req.body;

    db.query("SELECT * FROM admin WHERE name = ?", [name], (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "Invalid name or password" });
        }

        const admin = results[0];

        // Directly compare plain text passwords
        if (password !== admin.password) { 
            return res.status(400).json({ error: "Invalid name or password" });
        }

        console.log(`✅ Admin Logged In: ${admin.name}`);

        res.json({ message: `Welcome, ${admin.name}!`, adminId: admin.admin_id });
    });
};

exports.getEvents = (req, res) => {
    db.query("SELECT * FROM event", (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Server error",
                error: err.message
            });
        }
        if (!Array.isArray(results)) {
            return res.status(500).json({
                success: false,
                message: "Invalid data format",
                error: "Database returned non-iterable response"
            });
        }
        res.json({ success: true, events: results });
    });
};

//faculty login
exports.facultyLogin = (req, res) => {
    const { name, password } = req.body;

    Faculty.findByName(name, (err, faculty) => {
       if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!faculty || faculty.password !== password) {
            return res.status(401).json({ error: "Invalid name or password" });
       }

       res.json({ message: `Welcome, ${faculty.name}!`, facultyName: faculty.name });
    });
};

// Student Registration by Admin or faculty
exports.registerStudent = (req, res) => {
    const { name, father_name, roll_no, studentClass, phone, email } = req.body;

    if (!name || !father_name || !roll_no || !studentClass || !phone || !email ) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const password = generateRandomPassword(); // Generate random password

    const query = "INSERT INTO student (name, father_name, roll_no, class, phone, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [name, father_name, roll_no, studentClass, phone, email, password];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json({ message: "Student registered successfully!", student: { name, roll_no, email, password } });
    });
};

// ✅ Student Login
exports.studentLogin = (req, res) => {
    const { name, password } = req.body;

    const sql = "SELECT * FROM student WHERE name = ? AND password = ?";
    
    db.query(sql, [name, password], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid name or password" });
        }

        const student = results[0];

        res.json({ 
            message: "Student login successful", 
            student: {
                student_id: student.student_id,
                name: student.name,
                roll_no: student.roll_no,
                father_name: student.father_name,
                phone: student.phone,
                email: student.email,
                class: student.class
               
            }
        });
    });
};

exports.createEvent = async (req, res) => {
    try {
        const { title, description, start_date, end_date, time, venue, category, fee, status, image } = req.body;

        // Ensure image exists
        if (!image) {
            return res.status(400).json({ error: "Event image is required." });
        }

        await Event.create(title, description, start_date, end_date, time, venue, category, fee, status, image);
        res.status(201).json({ message: "Event created successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addEvent = async (eventData) => {
    const { title, description, start_date, end_date, time, venue, category, fee, status, image } = eventData;
    const sql = "INSERT INTO event (title, description, start_date, end_date, time, venue, category, fee, status, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [title, description, start_date, end_date, time, venue, category, fee, status, image];
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, result) => {
            if (err) reject(err);
            resolve({ id: result.insertId, ...eventData });
        });
    });
};

exports.getEvents = async () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM event", (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};


exports.deleteExpiredRegistrations = () => {
    const query = `
        DELETE r FROM registration r
        JOIN event e ON r.event_id = e.event_id
        WHERE e.date < CURDATE();
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error deleting expired registrations:", err);
            return;
        }
        console.log(`🗑️ Deleted ${results.affectedRows} expired registrations.`);
    });
};

// Fetch Pending Approvals
exports.getPendingApprovals = (req, res) => {
    const sql = `
        SELECT r.registration_id, s.name AS student_name, e.title AS event_title, r.payment_status 
        FROM registration r
        JOIN student s ON r.student_id = s.student_id
        JOIN event e ON r.event_id = e.event_id
        WHERE r.payment_status = 'pending';
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Database Error:", err);
            return res.status(500).json({ error: "Database error. Please try again." });
        }
        res.status(200).json({ approvals: results });
    });
};

// Approve/Reject Payment
exports.approvePayment = (req, res) => {
    const { registrationId, approvalStatus } = req.body;
    
    const sql = `UPDATE registration SET payment_status = ? WHERE registration_id = ?`;
    db.query(sql, [approvalStatus, registrationId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(200).json({ message: `Payment ${approvalStatus} successfully!` });
    });
};

exports.sendEventConfirmation = async (req, res) => {
    const { email, name, eventTitle, eventDescription, startDate, endDate, eventTime, eventVenue } = req.body;

    try {
        await sendEmail(email, name, eventTitle, eventDescription, startDate, endDate, eventTime, eventVenue);
        res.json({ success: true, message: "Email sent successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send email." });
    }
};

// exports.createEvent = (req, res) => {
//     const { title, description, date, time, venue, organizer_id, fee, status } = req.body;

//     // Insert event into the database
//     const insertQuery = "INSERT INTO event (title, description, date, time, venue, organizer_id, fee, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
//     db.query(insertQuery, [title, description, date, time, venue, organizer_id, fee, status], (err, result) => {
//         if (err) {
//             console.error("Error creating event:", err);
//             res.status(500).json({ message: "Error creating event" });
//             return;
//         }

//         console.log("Event Created Successfully!");

//         // Fetch student emails from database
//         const studentQuery = "SELECT email FROM student";
//         db.query(studentQuery, (err, students) => {
//             if (err) {
//                 console.error("Error fetching student emails:", err);
//                 res.status(500).json({ message: "Error fetching student emails" });
//                 return;
//             }

//             // Send email notifications
//             const subject = `New Event Created: ${title}`;
//             const text = `Dear Student,\n\nA new event "${title}" has been created.\nYou can enroll now!\n\nEvent Details:\n- Date: ${date}\n- Time: ${time}\n- Venue: ${venue}\n\nBest Regards,\nEventElite Team`;

//             students.forEach((student) => {
//                 sendEmail(student.email, subject, text, (err, info) => {
//                     if (err) {
//                         console.error(`Failed to send email to ${student.email}:`, err);
//                     } else {
//                         console.log(`Notification sent to ${student.email}`);
//                     }
//                 });
//             });

//             res.status(201).json({ message: "Event created and notifications sent!" });
//         });
//     });
// };
