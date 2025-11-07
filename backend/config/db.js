const mysql = require('mysql2');
const multer = require('multer');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'samridhi@123',
    database: 'login_html',
    timezone: "+05:30", // ✅ Use numeric offset for IST
    dateStrings: true,
    waitForConnections: true,
    multipleStatements: true,
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

    // db.query("SET time_zone = '+05:30'", (err) => {
    //     if (err) console.error("Error setting time zone:", err);
    // });


    
});



// Set storage engine
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

// Init upload
const upload = multer({ storage: storage });




module.exports = db, upload;
