// set up server
const express = require("express");
const logger = require("morgan");
const app = express();
const port = 8080;

// middleware for logging requests
app.use((logger("dev")));

// middleware for static resources; goes to public
app.use(express.static(`${__dirname}/public`));

// home page
app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/views/index.html`);
});

// list
app.get("/list", (req, res) => {
    res.sendFile(`${__dirname}/views/list.html`);
});

// item
app.get("/list/item", (req, res) => {
    res.sendFile(`${__dirname}/views/item.html`);
});

// archive
app.get("/archive", (req, res) => {
    res.sendFile(`${__dirname}/views/archive.html`);
});

// start server
app.listen(port, () => {
    console.log(`App server listening on ${port}. (Go to http://localhost:${port})`);
});