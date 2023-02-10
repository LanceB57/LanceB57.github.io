const db = require("./db_connection");

/**** Delete existing table, if any ****/
const drop_list_table_sql = "DROP TABLE IF EXISTS `list`;"

db.execute(drop_list_table_sql);

/**** Create the table ****/
const create_list_table_sql = `
    CREATE TABLE list (
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(45) NOT NULL,
        subject VARCHAR(45),
        priority INT,
        finish_by DATE,
        due_date DATE,
        description VARCHAR(150),
        archived BOOL DEFAULT FALSE,
        PRIMARY KEY (id)
    );
`

db.execute(create_list_table_sql);

// /**** Populate the table ****/
// const insert_list_table_sql = `
//     INSERT INTO list
//         (title, subject, priority, finish_by, due_date, description)
//     VALUES
//         (?, ?, ?, ?, ?, ?);
// `

// /**** Read the table ****/
// const read_list_table_sql = "SELECT * FROM list;";

// db.execute(read_list_table_sql,
//     (error, results) => {
//         if(error)
//             throw error;
//         console.log("Table 'list' initialized with:");
//         console.log(results);
//     }
// );

db.end()