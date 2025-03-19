const fs = require('fs');
const db = require('./db'); // Import database connection

// Read schema.sql file
const schema = fs.readFileSync(__dirname + '/schema.sql', 'utf8');

// Execute schema.sql queries
db.query(schema, (err, result) => {
    if (err) {
        console.error('❌ Error executing schema.sql:', err);
    } else {
        console.log('✅ Database setup complete!');
    }
    process.exit(); // Exit script after execution
});
