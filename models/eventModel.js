const db = require("../config/db");

// class Event {
//     static async create(title, description, start_date, end_date, time, venue, category, fee, status, image) {
//         const sql = "INSERT INTO event (title, description, start_date, end_date, time, venue, category, fee, status, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
//         return await db.query(sql, [title, description, start_date, end_date, time, venue, category, fee, status, image]);
//     }

//     static async getAll() {
//         const sql = "SELECT * FROM event";
//         return new Promise((resolve, reject) => {
//             db.query(sql, (err, results) => {
//                 if (err) reject(err);
//                 else resolve(results);
//             });
//         });
//     }

//     static update(id, updatedEvent) {
//         return db.query("UPDATE event SET ? WHERE event_id = ?", [updatedEvent, id]);
//     }

//     static async delete(id) {
//         const sql = "DELETE FROM event WHERE event_id=?";
//         return await db.query(sql, [id]);
//     }
// }


// Get All Events
exports.getAllEvents = function (callback) {
    db.query("SELECT * FROM event", function (err, results) {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

// Update Event
exports.updateEvent = function (eventId, updatedEvent, callback) {
    const sql = "UPDATE event SET title=?, description=?, start_date=?, end_date=?, time=?, venue=?, category=?, fee=?, status=? WHERE event_id=?";
    const values = [
        updatedEvent.title, updatedEvent.description, updatedEvent.start_date, updatedEvent.end_date,
        updatedEvent.time, updatedEvent.venue, updatedEvent.category, updatedEvent.fee, updatedEvent.status, eventId
    ];

    db.query(sql, values, function (err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
};

// Delete Event
exports.deleteEvent = function (eventId, callback) {
    db.query("DELETE FROM event WHERE event_id = ?", [eventId], function (err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
};
// module.exports = Event;
