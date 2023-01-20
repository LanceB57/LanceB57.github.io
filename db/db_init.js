const db = require("./db_connection");

/**** Delete existing table, if any ****/
const drop_list_table_sql = "DROP TABLE IF EXISTS `list`;"

db.execute(drop_list_table_sql);

/**** Create the table ****/
const create_list_table_sql = `
    CREATE TABLE list (
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(45) NOT NULL,
        subject VARCHAR(45) NOT NULL,
        priority INT,
        finish_by DATE,
        due_date DATE,
        description VARCHAR(150),
        archived BOOL DEFAULT FALSE,
        PRIMARY KEY (id)
    );
`

db.execute(create_list_table_sql);

/**** Populate the table ****/
const insert_list_table_sql = `
    INSERT INTO list
        (title, subject, priority, finish_by, due_date, description)
    VALUES
        (?, ?, ?, ?, ?, ?);
`

db.execute(insert_list_table_sql, ['Worksheet', 'Math', '1', '2023-01-20', '2023-01-23', 'Gradient Worksheet']);

db.execute(insert_list_table_sql, ['Read', 'Personal', '3', null, null, null]);

/**** Read the table ****/
const read_list_table_sql = "SELECT * FROM list;";

db.execute(read_list_table_sql,
    (error, results) => {
        if(error)
            throw error;
        console.log("Table 'list' initialized with:");
        console.log(results);
    }
);

db.end()