const db = require("../config/db");


// Function to find faculty by name
// exports.findByName = (name, callback) => {
//     db.query("SELECT * FROM faculty WHERE name = ?", [name], (err, results) => {
//         if (err) return callback(err, null);
//         callback(null, results.length > 0 ? results[0] : null);
//     });
// };


const Faculty = {
    findByName: (name, callback) => {
        const sql = "SELECT * FROM faculty WHERE name = ?";
        db.query(sql, [name], (err, results) => {
            if (err) {
                console.error("Database Error:", err);
                return callback(err, null);
            }
            
            console.log("Faculty Search Results:", results); // Debugging
            callback(null, results.length > 0 ? results[0] : null);
        });
    }
};


// Function to register a student (faculty has permission)
exports.registerStudent = (studentData, callback) => {
    const { name, father_name, roll_no, studentClass, phone, email, department } = studentData;
    const password = Math.random().toString(36).slice(-8); // Generate random password

    const query = "INSERT INTO student (name, father_name, roll_no, class, phone, email, department, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [name, father_name, roll_no, studentClass, phone, email, department, password];

    db.query(query, values, (err, result) => {
        if (err) return callback(err, null);
        callback(null, { id: result.insertId, name, roll_no, email, password });
    });
};

module.exports = Faculty;