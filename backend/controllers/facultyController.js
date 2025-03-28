const Faculty = require("../models/facultyModel");
const db = require("../config/db");


//faculty login
exports.facultyLogin = (req, res) => {
    const { name, password } = req.body;
    console.log("Faculty Login Attempt:", { name, password }); // Debugging

    Faculty.findByName(name, (err, faculty) => {
        if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!faculty) {
            console.error("Faculty Not Found in DB");
            return res.status(401).json({ error: "Invalid Faculty Name!" });
        }

        console.log("Faculty Found:", faculty); // Debugging

        // Ensure password is compared as a string
        if (String(faculty.password) !== String(password)) {
            console.error("Incorrect Password for:", faculty.name);
            return res.status(401).json({ error: "Invalid Password!" });
        }

        console.log("Faculty Login Successful:", faculty.name);
        res.json({ 
            message: `Welcome, ${faculty.name}!`, 
            faculty: faculty // Send full faculty object for frontend use
        });
    });
};



exports.getEventRequests = (req, res) => {
    const sql = `
        SELECT e.event_id, e.title, e.description, s.name AS student_name
        FROM event e
        JOIN student s ON e.organizer_id = s.student_id
        WHERE e.status = 'pending'
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching event requests:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
};

exports.updateEventStatus = (req, res) => {
    const { event_id, status } = req.body;
    const sql = "UPDATE event SET status = ? WHERE event_id = ?";

    db.query(sql, [status, event_id], (err) => {
        if (err) {
            console.error("Error updating event status:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Event status updated successfully!" });
    });
};



// ✅ Faculty can register a student
exports.registerStudent = (req, res) => {
    const { name, father_name, roll_no, studentClass, phone, email } = req.body;

    if (!name || !father_name || !roll_no || !studentClass || !phone || !email) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const password = Student.generateRandomPassword();

    const studentData = { name, father_name, roll_no, studentClass, phone, email, password };

    Student.registerStudent(studentData, (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });

        res.json({ message: "Student registered successfully!", student: { name, roll_no, email, password } });
    });
};

exports.approvePayment = (req, res) => {
    const { registrationId, approvalStatus } = req.body;

    if (!registrationId || !approvalStatus) {
        return res.status(400).json({ success: false, message: "Registration ID and approval status are required." });
    }

    const query = `
        UPDATE registration 
        SET faculty_approval_status = ?, payment_status = IF(? = 'approved', 'paid', 'pending') 
        WHERE registration_id = ?`;

    db.query(query, [approvalStatus, approvalStatus, registrationId], (err, result) => {
        if (err) {
            console.error("❌ Error updating payment status:", err);
            return res.status(500).json({ success: false, message: "Database error", error: err });
        }

        res.json({ success: true, message: "Payment status updated successfully!" });
    });
};


// ✅ Get Pending Approvals
exports.getPendingApprovals = (req, res) => {
    const query = `
         SELECT r.registration_id, s.name AS student_name, e.title AS event_title, r.payment_status
        FROM registration r
        JOIN student s ON r.student_id = s.student_id  -- ✅ Changed admin_id to student_id
        JOIN event e ON r.event_id = e.event_id
        WHERE r.payment_status = 'pending'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching pending approvals:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ approvals: results });
    });
};

// ✅ Get Upcoming Events Count
exports.getUpcomingEventsCount = (req, res) => {
    const query = `
        SELECT COUNT(*) AS totalUpcomingEvents 
        FROM event 
        WHERE start_date >= CURDATE()
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching upcoming events count:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ totalUpcomingEvents: results[0].totalUpcomingEvents });
    });
};

// ✅ Get Registered Students Count
exports.getRegisteredStudentsCount = (req, res) => {
    const query = `
        SELECT COUNT(*) AS totalRegisteredStudents 
        FROM registration 
        WHERE payment_status = 'paid'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching registered students count:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ totalRegisteredStudents: results[0].totalRegisteredStudents });
    });
};

// ✅ Get Pending Approvals Count
exports.getPendingApprovalsCount = (req, res) => {
    const query = `
        SELECT COUNT(*) AS pendingApprovals 
        FROM registration 
        WHERE payment_status = 'pending'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching pending approvals count:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json({ pendingApprovals: results[0].pendingApprovals });
    });
};








