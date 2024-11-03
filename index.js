const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

const debugMode = false;

// Middleware for parsing JSON request bodies

app.use((req, res, next) => {
  // Change debugMode to true to see requests
  if (debugMode){
    console.log(`${req.method} request to ${req.url}`);
  }
  next();
});


// Middleware for asset requests
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home", "index.html"));
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "images", "favicon.ico"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat", "index.html"));
});

app.get("/chat/load", (req, res) => {
  res.send(["<p>Loading<p>", "hi"]);
});

app.listen(port);
console.log("SERVER STARTED at port: " + port);
