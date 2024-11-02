const express = require("express");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8080;

// Middleware for parsing JSON request bodies

app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});


// Middleware for asset requests
app.use(express.static(__dirname + "\\public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "\\client\\home\\index.html");
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(__dirname + "\\assets\\images\\favicon.ico");
});

app.get("/chat", (req, res) => {
  res.sendFile(__dirname + "\\client\\chat\\index.html");
});

app.get("/chat/load", (req, res) => {
  res.send(["<p>Loading<p>", "hi"]);
});

app.listen(port);
console.log("SERVER STARTED");
