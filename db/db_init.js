const db = require("./db_connection");

/**** Delete existing table, if any ****/
const drop_list_table_sql = "DROP TABLE IF EXISTS `list`;"
db.execute(drop_list_table_sql);

const drop_subjects_table_sql = "DROP TABLE IF EXISTS `subjects`;"
db.execute(drop_subjects_table_sql);

const create_subjects_table_sql = `
    CREATE TABLE subjects (
        subject_id INT NOT NULL AUTO_INCREMENT,
        subject_title VARCHAR(45),
        user_id VARCHAR(45),
        PRIMARY KEY (subject_id)
    );
`
db.execute(create_subjects_table_sql);



/**** Create the table ****/
const create_list_table_sql = `
    CREATE TABLE list (
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(45) NOT NULL,
        subject_id INT,
        priority INT,
        finish_by DATE,
        due_date DATE,
        description VARCHAR(150),
        archived BOOL DEFAULT FALSE,
        user_id VARCHAR(50) NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
            ON DELETE CASCADE
    );
`

db.execute(create_list_table_sql);

/**** Populate the table ****/
const insert_subject_table_sql = `
    INSERT INTO subjects
        (subject_id, subject_title, user_id)
    VALUES
        (?, ?, ?);
`
db.execute(insert_subject_table_sql, [1, "Personal", "lanbae23@bergen.org"],
        (error, results) => {
            if(error)
                throw error;
            console.log("Table 'list' initialized with:");
            console.log(results);
        }
    );

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