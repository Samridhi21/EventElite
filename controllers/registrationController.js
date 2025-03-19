const db = require("../config/db");

// ✅ Register a student for an event

exports.registerStudent = (req, res) => {
    const { eventId, studentName, email, phone, participation_status } = req.body;

    if (!eventId || !studentName || !email || !phone || !participation_status) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Step 1: Get student ID from email
    const getStudentIdQuery = "SELECT student_id FROM student WHERE email = ?";
    
    db.query(getStudentIdQuery, [email], (err, result) => {
        if (err) {
            console.error("❌ Database error (Fetching student ID):", err.sqlMessage || err);
            return res.status(500).json({ success: false, message: "Database error", error: err.sqlMessage || err });
        }

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found. Register as a student first!" });
        }

        const studentId = result[0].student_id;

        // Step 2: Check event fee
        const checkEventFeeQuery = "SELECT fee FROM event WHERE event_id = ?";

        db.query(checkEventFeeQuery, [eventId], (err, eventResult) => {
            if (err) {
                console.error("❌ Database error (Fetching event fee):", err.sqlMessage || err);
                return res.status(500).json({ success: false, message: "Database error", error: err.sqlMessage || err });
            }

            if (eventResult.length === 0) {
                return res.status(404).json({ success: false, message: "Event not found." });
            }

            const eventFee = eventResult[0].fee;
            const paymentStatus = eventFee === 0 ? "paid" : "pending"; // ✅ If fee is 0, set payment to 'paid'

            // Step 3: Insert into registration table
            const insertRegistrationQuery = `
                INSERT INTO registration (student_id, event_id, registration_date, payment_status, participation_status) 
                VALUES (?, ?, NOW(), ?, ?)
            `;

            db.query(insertRegistrationQuery, [studentId, eventId, paymentStatus, participation_status], (err, result) => {
                if (err) {
                    console.error("❌ Database error (Inserting registration):", err.sqlMessage || err);
                    return res.status(500).json({ success: false, message: "Database error", error: err.sqlMessage || err });
                }
                console.log("✅ Student registered successfully:", result);
                res.json({ success: true, message: "Registration successful!", paymentStatus });
            });
        });
    });
};





// ✅ Get all registrations for a specific event
exports.getRegistrationsByEvent = (req, res) => {
    const { eventId } = req.params;

    if (!eventId) {
        return res.status(400).json({ success: false, message: "Event ID is required" });
    }

    const query = "SELECT * FROM registration WHERE event_id = ?";
    
    connection.query(query, [eventId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching registrations:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        res.json({ success: true, registrations: results });
    });
};

// ✅ Get all student registrations
exports.getAllRegistrations = (req, res) => {
    const query = `
        SELECT r.registration_id, s.name AS student_name, s.email, e.title AS event_title, 
               r.registration_date, r.payment_status, r.participation_status  
        FROM registration r
        JOIN student s ON r.student_id = s.student_id
        JOIN event e ON r.event_id = e.event_id
        ORDER BY r.registration_date DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching registrations:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        res.json({ success: true, registrations: results });
    });
};


exports.getRegisteredStudents = (req, res) => {
    const query = `
        SELECT r.registration_id, s.name AS student_name, s.email, 
               e.title AS event_title, r.registration_date, 
               r.payment_status, r.participation_status,
               r.faculty_approval_status  
        FROM registration r
        JOIN student s ON r.student_id = s.student_id
        JOIN event e ON r.event_id = e.event_id
        ORDER BY r.registration_date DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Database error (Fetching registered students):", err.sqlMessage || err);
            return res.status(500).json({ success: false, message: "Database error", error: err.sqlMessage || err });
        }
        res.json({ success: true, students: results });
    });
};



exports.getStudentRegisteredEvents = (req, res) => {
    const { studentId } = req.params;

    const query = `
        SELECT e.event_id, e.title, e.start_date, e.end_date, e.time, e.venue, e.fee, 
               r.registration_date, r.payment_status, r.participation_status  
        FROM registration r
        JOIN event e ON r.event_id = e.event_id
        WHERE r.student_id = ?
        ORDER BY r.registration_date DESC
    `;

    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching student's registered events:", err);
            return res.status(500).json({ success: false, message: "Database error", error: err });
        }
        res.json({ success: true, events: results });
    });
};

exports.approvePayment = (req, res) => {
    const { registrationId, newStatus } = req.body;

    console.log(`🛠️ Received API request:`);
    console.log(`📌 Registration ID: ${registrationId}`);
    console.log(`📌 New Status: ${newStatus}`);

    if (!registrationId || !newStatus) {
        console.error("❌ Missing registration ID or status!");
        return res.status(400).json({ success: false, message: "Registration ID and status required" });
    }

    const allowedStatuses = ["pending", "paid", "rejected"];
    if (!allowedStatuses.includes(newStatus.trim().toLowerCase())) {
        console.error("❌ Invalid payment status:", newStatus);
        return res.status(400).json({ success: false, message: "Invalid payment status" });
    }

    const query = "UPDATE registration SET payment_status = ? WHERE registration_id = ?";

    db.query(query, [newStatus.trim(), registrationId], (err, result) => {
        if (err) {
            console.error("❌ Database error (Updating payment status):", err.sqlMessage || err);
            return res.status(500).json({ success: false, message: "Database error", error: err.sqlMessage || err });
        }

        if (result.affectedRows === 0) {
            console.error("❌ No rows updated (Invalid registration ID?)");
            return res.status(404).json({ success: false, message: "Registration ID not found" });
        }

        console.log(`✅ Payment status updated to '${newStatus}' for registration ID ${registrationId}`);
        res.json({ success: true, message: `Payment status updated to '${newStatus}'.` });
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