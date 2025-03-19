const db = require('../config/db');

// Find Admin by username
const getAdminByName = (name, callback) => {
    db.query('SELECT * FROM admin WHERE name = ?', [name], (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results[0]);
    });
};

// Create a new Admin
const createAdmin = (name, password, callback) => {
    db.query('INSERT INTO admin (name, password) VALUES (?, ?)', 
    [name, password], 
    (err, results) => {
        if (err) return callback(err, null);
        return callback(null, results);
    });
};

module.exports = { getAdminByName, createAdmin };
