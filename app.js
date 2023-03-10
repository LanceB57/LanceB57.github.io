// set up server
const express = require("express");
const logger = require("morgan");
const app = express();
const moment = require("moment");
const helmet = require("helmet");
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const dotenv = require("dotenv")

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

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.oidc.isAuthenticated();
    res.locals.user = req.oidc.user;
    next()
})

// set up helmet middleware for protection
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'cdnjs.cloudflare.com']
        }
    }
}));

app.get('/authtest', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});


// home page
app.get("/", (req, res) => {
    res.render("index");
});

// get list
const read_list_info_sql = `
    SELECT 
        id, title, subject, priority, finish_by, due_date 
    FROM 
        list
    WHERE
        archived = 0 AND user_id = ?;`;

app.get("/list", requiresAuth(), (req, res) => {
    db.execute(read_list_info_sql, [req.oidc.user.email], (error, results) => {
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
        archived = 1 AND user_id = ?;`;

app.get("/archive", requiresAuth(), (req, res) => {
    db.execute(read_archived_info_sql, [req.oidc.user.email], (error, results) => {
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
        id = ? AND user_id = ?;`;

// item
app.get("/list/item/:id", requiresAuth(), (req, res) => {
    db.execute(read_item_info_sql, [req.params.id, req.oidc.user.email], (error, results) => {
        if(error){
            res.status(500).send(error);
        }
        else if(results.length === 0){
            res.status(404).send(`No item found with id = '${req.params.id}'`);
        }
        else{
            let data = results[0];
            data.due_date = moment(data.due_date).format('YYYY-MM-DD');
            data.finish_by = moment(data.finish_by).format('YYYY-MM-DD');
            console.log(data.due_date);
            res.render("item", {item : data});
        }
    });
});


const delete_item_sql = `
    DELETE
    FROM
        list
    WHERE
        id = ? AND user_id = ?;`;

// delete
app.get("/list/item/:id/delete", requiresAuth(), (req, res) => {
    db.execute(delete_item_sql, [req.params.id, req.oidc.user.email], (error, results) => {
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

app.get("/list/item/:id/delete/archive", requiresAuth(), (req, res) => {
    db.execute(delete_item_sql, [req.params.id, req.oidc.user.email], (error, results) => {
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
        (title, subject, priority, finish_by, due_date, description, user_id)
    VALUES
        (?, ?, ?, ?, ?, ?, ?);`;

app.post("/list", requiresAuth(), (req, res) => {
    db.execute(create_item_sql, [req.body.title, req.body.subject, req.body.priority, 
        req.body.finish, req.body.due, req.body.description, req.oidc.user.email], 
        (error, results) => {
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
        id = ? AND user_id = ?`

app.post("/list/item/:id/update", requiresAuth(), (req, res) => {
    db.execute(update_item_sql, [req.body.title, req.body.subject, req.body.priority, 
        req.body.finish, req.body.due, req.body.description, req.params.id, req.oidc.user.email], 
        (error, results) => {
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
        id = ? AND user_id = ?`

app.get("/list/item/:id/archive", requiresAuth(), (req, res) => {
    db.execute(archive_item_sql, [req.params.id, req.oidc.user.email], (error, results) => {
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
        id = ? AND user_id = ?`

app.get("/list/item/:id/unarchive", requiresAuth(), (req, res) => {
    db.execute(unarchive_item_sql, [req.params.id, req.oidc.user], (error, results) => {
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