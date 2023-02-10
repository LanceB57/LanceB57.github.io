// set up server
const express = require("express");
const logger = require("morgan");
const app = express();
const moment = require("moment");
const helmet = require("helmet");
const port = process.env.PORT || 8080;

// database connection
const db = require("./db/db_pool");

// ejs
app.set("views", `${__dirname}/views`);
app.set("view engine", "ejs");

// POST requests
app.use( express.urlencoded({ extended: false }) );

// middleware for logging requests
app.use((logger("dev")));

// middleware for static resources; goes to public
app.use(express.static(`${__dirname}/public`));

// home page
app.get("/", (req, res) => {
    res.render("index");
});

// set up helmet middleware for protection
app.use(helmet())


// get list
const read_list_info_sql = `
    SELECT 
        id, title, subject, priority, finish_by, due_date 
    FROM 
        list
    WHERE
        archived = 0;`;

app.get("/list", (req, res) => {
    db.execute(read_list_info_sql, (error, results) => {
        if(error){
            res.status(500).send(error);
        }
        else{
            res.render("list", {moment : moment, inventory : results});
        }
    });
});

// get archive
const read_archived_info_sql = `
    SELECT 
        id, title, subject, priority, finish_by, due_date 
    FROM 
        list
    WHERE
        archived = 1;`;

app.get("/archive", (req, res) => {
    db.execute(read_archived_info_sql, (error, results) => {
        if(error){
            res.status(500).send(error);
        }
        else{
            res.render("archive", {moment : moment, inventory : results});
        }
    });
});



const read_item_info_sql = `
    SELECT 
        id, title, subject, priority, finish_by, due_date, description, archived 
    FROM 
        list
    WHERE
        id = ?;`;

// item
app.get("/list/item/:id", (req, res) => {
    db.execute(read_item_info_sql, [req.params.id], (error, results) => {
        if(error){
            res.status(500).send(error);
        }
        else if(results.length === 0){
            res.status(404).send(`No item found with id = '${req.params.id}'`);
        }
        else{
            let data = results[0];
            res.render("item", {item : data, moment : moment});
        }
    });
});


const delete_item_sql = `
    DELETE
    FROM
        list
    WHERE
        id = ?;`;

// delete
app.get("/list/item/:id/delete", (req, res) => {
    db.execute(delete_item_sql, [req.params.id], (error, results) => {
        if(error){
            res.status(500).send(error);
        }
        else if(results.length === 0){
            res.status(404).send(`No item found with id = '${req.params.id}'`);
        }
        else{
            res.redirect("/list")
        }
    });
});

app.get("/list/item/:id/delete/archive", (req, res) => {
    db.execute(delete_item_sql, [req.params.id], (error, results) => {
        if(error){
            res.status(500).send(error);
        }
        else if(results.length === 0){
            res.status(404).send(`No item found with id = '${req.params.id}'`);
        }
        else{
            res.redirect("/archive")
        }
    });
});

// create new items
const create_item_sql = `
    INSERT INTO list
        (title, subject, priority, finish_by, due_date, description)
    VALUES
        (?, ?, ?, ?, ?, ?);`;

app.post("/list", (req, res) => {
    db.execute(create_item_sql, [req.body.title, req.body.subject, req.body.priority, 
        req.body.finish, req.body.due, req.body.description], (error, results) => {
        if(error){
            console.log(req);
            res.status(500).send(error);
        }
        else{
            res.redirect("/list");
        }
    });
});

// update item
const update_item_sql = `
    UPDATE list
    SET
        title = ?,
        subject = ?,
        priority = ?,
        finish_by = ?,
        due_date = ?,
        description = ?
    WHERE
        id = ?`

app.post("/list/item/:id/update", (req, res) => {
    db.execute(update_item_sql, [req.body.title, req.body.subject, req.body.priority, 
        req.body.finish, req.body.due, req.body.description, req.params.id], (error, results) => {
        if(error){
            console.log(req);
            res.status(500).send(error);
        }
        else{
            res.redirect(`/list/item/${req.params.id}`);
        }
    });
});

// archive
const archive_item_sql = `
    UPDATE list
    SET
        archived = 1
    WHERE
        id = ?`

app.get("/list/item/:id/archive", (req, res) => {
    db.execute(archive_item_sql, [req.params.id], (error, results) => {
        if(error){
            console.log(req);
            res.status(500).send(error);
        }
        else{
            res.redirect("/list");
        }
    });
});

// unarchive
const unarchive_item_sql = `
    UPDATE list
    SET
        archived = FALSE
    WHERE
        id = ?`

app.get("/list/item/:id/unarchive", (req, res) => {
    db.execute(unarchive_item_sql, [req.params.id], (error, results) => {
        if(error){
            console.log(req);
            res.status(500).send(error);
        }
        else{
            res.redirect("/archive");
        }
    });
});

// start server
app.listen(port, () => {
    console.log(`App server listening on ${port}. (Go to http://localhost:${port})`);
});