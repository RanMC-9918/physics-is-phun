const express = require("express");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const bodyParser = require('body-parser')


 let digits = /[0-9]*/;

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

refreshMessages(); 


const app = express();
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
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

app.get("/loggedin", (req,res) => {
  
  res.sendFile(path.join(__dirname, "public", "loggedin", "index.html"));
})

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "images", "favicon.ico"));
});

app.get("/chat/load", (req, res) => {

  res.send(unreadMessages);
  
});
app.get("/question/load", async (req,res) => {
  const id = req.query.id.match(digits).join();
  let out = await getQuestion(id);
  if(digits.test(id) && out !== undefined && out && out !== null) {
    
    if(digits.test(out.author)){
      out.author = await getNameFromId(out.author)
    }
    else{
      out.author = "User Not Found"
    }
    res.send(JSON.stringify({resolved: `${out.resolved}`, title: `${out.title}`,body: `${out.body}`,posted_at: `${out.posted_at}`,author: `${out.author}`}))
  }
  else{
    res.send(JSON.stringify({ body: "NOT_FOUND" }))
  }
})
app.get("/replies/load", async (req, res) => {
  const id = req.query.id.match(digits).join();
  // console.log(id)
  let cardData = await getReplies(id);
  //console.log(cardData + "siodhfgoasdhjgoias;gfjkfd")
  let replies = [];
  let promises = cardData.map(
    async (element) => {
      replies.push(await formatReply(element.reply));
    }
  );

  await Promise.all(promises)
  //console.log(replies);
  
  replies = JSON.stringify(replies);
  //console.log(replies)
  res.send(replies);
  
});



app.post('/signin-form', (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  

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
    //console.log(id);
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




app.post('/add-message-form', (req, res) => {
  console.log(req.body);
  const title = req.body.title;
  const question = req.body.message;
  const author = req.body.id;

  //console.log(`Title: ${title}, Question: ${question}`)

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0]
  let id = generate10DigitRandomNumber();
  while (checkDuplicateId1(id)){
    id = generate10DigitRandomNumber();
  }
  client.query(`
    INSERT INTO apphysics1 (resolved, title, body, posted_at, reply, author, id) 
    VALUES ($1, $2, $3, $4, ROW($5, $6, $7, $8), $9, $10)
  `, [
    false, 
    title, 
    question, 
    formattedDate, 
    `This is a reply for id: ${id}`, 
    formattedDate, 
    author, 
    0, 
    author, 
    id
  ], (err, res) => {
    if (err) {
      console.error("Error inserting new message into PostgreSQL database", err);
    } else {
      console.log("New message posted with id: " + `${id}`);
    }
  });

  client.query(
  "SELECT * FROM apphysics1",
  (err, result) => {
    if (err) {
      console.error("Error fetching messages from PostgreSQL database", err);
    } else {
    }
  })

  
  // res.redirect('/loggedIn-chat');

  // if (title.length > 50){
  //   res.sendFile(path.join(__dirname, "public", "add-message", "index_error.html"));
  // }else{
    
  // }
})

app.listen(port);
console.log("Server started on port: " + port);

setInterval(() => {
  //unreadMessages = client.query("SELECT * FROM apphysics1 ORDER BY likes DESC LIMIT 7");
}, 5000);

//methords

async function loginVerification(username,password){
  return new Promise((resolve, reject) => {
    client.query('SELECT id FROM accounts WHERE pass = $1 AND username = $2;', [password, username], (err, res) => {
      if (err) {
        reject(err);
      } else if (res.rows.length > 0) {
        resolve(res.rows[0].id);
      } else {
        resolve(false); // Login failed
      }
    });
  });
}
async function getNameFromId(id){
  return new Promise((resolve, reject) => {
    client.query('SELECT username FROM accounts WHERE id = $1;', [id], (err, res) => {
      if (err || res.rows.length < 0 || res.rows[0] === undefined) {
        resolve("User not found");
      }else{
        resolve(res.rows[0].username);
      }
    });
  });
}
async function getReplies(id) {
  if(!digits.test(id))
  {
    console.log("ID INVALID");
    return [];
  }
  else{
    const res = await client.query('SELECT reply FROM apphysics1 WHERE id = ' + id + ';');
    return res.rows;
  }
  
}
async function getQuestion(id) {
  if(digits.test(id)){
    const res = await client.query('SELECT * FROM apphysics1 WHERE id = $1;', [id]);
    return res.rows[0];
  }else{
    console.log("ID INVALID");
    return {};
  }
}
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generate10DigitRandomNumber() {
  const min = -2000000000; // 10-digit minimum number
  const max = 2000000000; // 10-digit maximum number

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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


function refreshMessages() {
    client.query("SELECT * FROM apphysics1 LIMIT 50", async (err, req) => {
      if (err) {
        console.error(
          "Error fetching unread messages from PostgreSQL database",
          err
        );
      } else {
        let cardData = req.rows;
        for (let i = 0; i < cardData.length; i++) {
          // console.log(cardData[i].author);
          if (cardData[i].author != null) {
            await getNameFromId(cardData[i].author).then((name) => {
              cardData[i].author = name;
            });
          } else {
            cardData[i].author = "Anonymous";
          }
        }
        console.log("refreshed messages");
        unreadMessages = cardData;
      }
    });
}

async function formatReply(data) {
  let body = data.substring(
    2,
    data.indexOf(",") - 1
  );
  data = data.substring(
    data.indexOf(",") + 1
  );
  let date = data.substring(0, data.indexOf(","));
  data = data.substring(
    data.indexOf(",") + 1
  );
  let author = data.substring(0, data.indexOf(","));
  data = data.substring(
    data.indexOf(",") + 1
  );
  let likes = data.substring(0, data.indexOf(")"));
  author = await getNameFromId(author);
  return {body: body, posted_at: date, likes: likes, author: author};
}

setInterval(refreshMessages, 30000);