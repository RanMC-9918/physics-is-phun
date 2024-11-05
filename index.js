const express = require("express");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const bodyParser = require('body-parser')

let unreadMessages = [];

const debugMode = false;
// Connect to the PostgreSQL database

const client = new Pool({
  connectionString: "postgresql://admin:hA21G16w37ZYcQisAFcpSrbpdAfQGKLa@dpg-csk6578gph6c73a6vfjg-a.oregon-postgres.render.com/physicsdb?ssl=true"
});


client.connect((err) => {
  if (err) {
    console.error("Error connecting to PostgreSQL database", err);
  } else {
    console.log("Connected to PostgreSQL database");
  }
});

// client.query(
//   fs.readFileSync("./sql/createtables.sql", "utf-8"),
//   (err, result) => {
//     if (err) {
//       console.error("Error sending SQL file to PostgreSQL database", err);
//     } else {
//       console.log("SQL file sent to PostgreSQL database");
//     }
//   }
// )

client.query(
  "SELECT * FROM apphysics1",
  (err, result) => {
    if (err) {
      console.error("Error fetching unread messages from PostgreSQL database", err);
    } else {
      unreadMessages = result.rows;
    }
  }
)


const app = express();
app.use(bodyParser.urlencoded({ extended: false}));
const port = process.env.PORT || 8080;

// EXPRESS JS MIDDLEWARE ------------------------------------------------------------------

app.use((req, res, next) => {
  if(debugMode) {
    console.log(`${req.method} request to ${req.url}`);
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")));

//EXPRES JS GET REQUESTS ------------------------------------------------------------------------

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "home", "index.html"));
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "images", "favicon.ico"));
});

app.get("/chat/load", (req, res) => {
  
  client.query("SELECT * FROM apphysics1", (err, req) => {
    if (err) {
      console.error("Error fetching unread messages from PostgreSQL database", err);
    } else {
      unreadMessages = req.rows;
      res.send(unreadMessages);
    }
  });
});

//EXPRESS JS POST REQUESTS ------------------------------------------------------------------------

app.post('/login-form', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log(`Username: ${username}, Password: ${password}`)
  if (username.length > 50){
    res.sendFile(path.join(__dirname, "public", "login", "index_error.html"));
  }else{
    res.redirect('/');
  }
  
})




app.post('/signin-form', (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function generate10DigitRandomNumber() {
    const min = -2000000000; // 10-digit minimum number
    const max = 2000000000; // 10-digit maximum number
  
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  console.log(`Username: ${username}, Email: ${email}, Password: ${password}`)

  //console.log(validateEmail(email));

  if (password.length <= 8 || !validateEmail(email)){
    //send to error page
    res.sendFile(path.join(__dirname, "public", "signin", "index_error.html"));
  }
  else
  {
    let id = generate10DigitRandomNumber();
    while (checkDuplicateId(id)){
      id = generate10DigitRandomNumber();
    }
    console.log(id);
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]
    client.query(`INSERT INTO accounts (username, pass, email, creation_date, id) VALUES ('${username}', '${password}', '${email}', '${formattedDate}', ${id});`, (err, res) => {
      if (err) {
        console.error("Error inserting new user into PostgreSQL database", err);
      } else {
        console.log("New user inserted into PostgreSQL database");
      }
    })

    res.redirect('/');
  }
})


function checkDuplicateId(id) {
  client.query(`SELECT * FROM accounts WHERE id = ${id}`, (err, result) => {
        if (err) {
          console.error("Error fetching user from PostgreSQL database", err);
        } else {
          if(result.rows.length > 0){
            return true;
          }
          return false;
        }
      })
}


app.post('/add-message-form', (req, res) => {
  const title = req.body.title;
  const question = req.body.question;

  //console.log(`Title: ${title}, Question: ${question}`)

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0]

  client.query(`INSERT INTO apphysics1 (body, title, likes, posted_at) VALUES ('${question}', '${title}', 0, '${formattedDate}' );`, (err, res) => {
      if (err) {
        console.error("Error inserting new message into PostgreSQL database", err);
      } else {
        console.log("New message posted");
      }
    })

  client.query(
  "SELECT * FROM apphysics1",
  (err, result) => {
    if (err) {
      console.error("Error fetching messages from PostgreSQL database", err);
    } else {
      console.log(result.rows);
    }
  }
)

  if (title.length > 50){
    res.sendFile(path.join(__dirname, "public", "add-message", "index_error.html"));
  }else{
    res.redirect('/chat');
  }
})

app.listen(port);
console.log("Server started on port: " + port);

setInterval(() => {
  //unreadMessages = client.query("SELECT * FROM apphysics1 ORDER BY likes DESC LIMIT 7");
}, 5000);


