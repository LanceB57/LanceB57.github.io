const db = require("./db_connection");

// Add query request 
db.execute('SELECT 1 + 1 AS solution', 
    (error, results) => {
        if (error)
            throw error;
        console.log(results);
        console.log(`Solution: ${results[0].solution}`);
    }
);
//Optional: close the connection after queue is emptying.
db.end();