const express = require("express");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

// Connect to the PostgreSQL database

const client = new Pool({
  user: "postgres",
  host: "localhost",
  database: "local-test",
  password: "test",
  port: 5432
});

client.connect();

client.query("SELECT * FROM apphysics1", (err, res) => {
  console.log(res);
});

const app = express();
const port = process.env.PORT || 8080;

// Middleware for parsing JSON request bodies

app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

// Middleware for asset requests
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home", "index.html"));
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "assets", "images", "favicon.ico"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "chat", "index.html"));
});

app.get("/chat/load", (req, res) => {
  res.send(["<p>Loading<p>", "hi"]);
});

app.listen(port);
console.log("SERVER STARTED");
