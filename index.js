const express = require("express");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
require("dotenv").config();

console.log("The DBURL you provided is " + process.env.DBURL);

let digits = /[0-9]*/;

let unreadMessages = [];

const debugMode = false;
// Connect to the PostgreSQL database

const client = new Pool({
  connectionString:
    process.env.DBURL,
});

client.connect((err) => {
  if (err) {
    console.error("Error connecting to PostgreSQL database", err);
  } else {
    console.log("Connected to PostgreSQL database");
    refreshMessages();
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

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public"));

const port = process.env.PORT || 8080;

// EXPRESS JS MIDDLEWARE ------------------------------------------------------------------

app.use((req, res, next) => {
  if (debugMode) {
    console.log(`${req.method} request to ${req.url}`); 
  }

  next();
});

app.use(express.static(path.join(__dirname, "public")));

//EXPRES JS GET REQUESTS ------------------------------------------------------------------------

app.get("/", async (req, res) => {
  if (await authenticateUser(req)) {
    res.redirect("/dashboard");
  } else {
    res.render(path.join("home", "index"), { isSignedIn: false });
  }
});

app.get("/chat", async (req, res) => {
  if (await authenticateUser(req)) {
    res.render(path.join("chat", "index"), { isSignedIn: true });
  } else {
    res.render(path.join("chat", "index"), { isSignedIn: false });
  }
});

app.get("/account", async (req, res) => {
  if (await authenticateUser(req)) {
    let info = await getAccountInfo(id);
    res.render(path.join("account", "index"), { isSignedIn: true, username: info.username, email: info.email, password: info.pass });
  } else {
    res.render(path.join("account", "index"), {
      isSignedIn: false,
      username: "You dont exist?",
      email: "You dont exist?",
      password: "You dont exist?",
    });
  }
});

app.get("/donate", async (req, res) => {
  if (await authenticateUser(req)) {
    res.render(path.join("donate", "index"), { isSignedIn: true });
  } else {
    res.render(path.join("donate", "index"), { isSignedIn: false });
  }
});

app.get("/dashboard", async (req, res) => {
  if (await authenticateUser(req)) {
    res.render(path.join("dashboard", "index"), { isSignedIn: true, username: await getNameFromId(id) });
  } else {
    res.redirect("/");
  }
});

app.get("/questions", async (req, res) => {
  let question = await getQuestion(req.query.id);
  question.author = "- " + await getNameFromId(question.author);

  let replies = await getReplies(req.query.id);

  console.log(replies);

  res.render(path.join("questions", "index"), {
    isSignedIn: await authenticateUser(req),
    question,
    replies,
  });
});

app.get("/chat", async (req, res) => {
  if (await authenticateUser(req)) {
    res.render(path.join("chat", "index"), { isSignedIn: true });
  } else {
    res.render(path.join("chat", "index"), { isSignedIn: false });
  }
});

app.get("/login", async (req, res) => {
  if (await authenticateUser(req)) {
    res.render(path.join("login", "index"), {
      isSignedIn: true,
      errorMessage: "",
    });
  } else {
    res.render(path.join("login", "index"), {
      isSignedIn: false,
      errorMessage: "",
    });
  }
});

app.get("/signup", async (req, res) => {

  if (await authenticateUser(req)) {
    res.render(path.join("signup", "index"), {
      isSignedIn: true,
      errorMessage: "",
    });
  } else {
    res.redirect("/dashboard")
  }
});

app.get("/post-reply", async (req, res) => {
  if (await authenticateUser(req)) {
    res.render(path.join("post-reply", "index"), {
      isSignedIn: true,
      errorMessage: "",
    });
  } else {
    res.render(path.join("post-reply", "index"), {
      isSignedIn: false,
      errorMessage: "",
    });
  }
});

app.get("/signin", async (req, res) => {
  res.status(301).redirect("/signup")
});

// EXPRESS API REQUESTS -------------------------------------------------------------------
// these requests are depreciated, in favor of the server-side rendering (from ejs)

app.get("/name/load", async (req, res) => {
  let id = req.query.id;
  console.log(id);
  id = await getNameFromId(id);
  res.send(JSON.stringify({ body: id }));
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "images", "favicon.ico"));
});

app.get("/chat/load", (req, res) => {
  res.send(unreadMessages);
});

app.get("/question/load", async (req, res) => {
  const id = req.query.id.match(digits).join();
  let out = await getQuestion(id);
  if (digits.test(id) && out !== undefined && out && out !== null) {
    if (digits.test(out.author)) {
      out.author = await getNameFromId(out.author);
    } else {
      out.author = "User Not Found";
    }
    out.resolved = out.resolved == undefined ? false : out.resolved;
    out.title = out.title == undefined ? "not found" : out.title;
    res.send(
      JSON.stringify({
        resolved: `${out.resolved}`,
        title: `${out.title}`,
        body: `${out.body}`,
        posted_at: `${out.posted_at}`,
        author: `${out.author}`,
      })
    );
  } else {
    res.send(JSON.stringify({ body: "NOT_FOUND" }));
  }
});
app.get("/replies/load", async (req, res) => {
  const id = req.query.id.match(digits).join();
  // console.log(id)
  let replyIds = await client.query(
    "select reply_ids from apphysics1 where id = " + id + " limit 1;"
  );
  replyIds = replyIds == undefined ? [] : replyIds.rows[0].reply_ids;

  console.log(replyIds); //70
  //console.log(cardData + "siodhfgoasdhjgoias;gfjkfd")

  let replies = [];

  if (replyIds != null && replyIds != undefined) {
    let promises = replyIds.map(async (id) => {
      const reply = await client.query(
        "select * from replies where id =" + id + " limit 1;"
      );
      if (reply == undefined) {
      } else {
        if (reply.rows[0].author == undefined || reply.rows[0].author == null) {
          reply.rows[0].author = "Anonymous";
        } else {
          reply.rows[0].author = await getNameFromId(reply.rows[0].author);
        }
        replies.push({
          id: reply.rows[0].id,
          title: reply.rows[0].title,
          body: reply.rows[0].body,
          posted_at: reply.rows[0].posted_at,
          author: reply.rows[0].author,
        });
      }
    });

    await Promise.all(promises);
    //console.log(replies);
  }

  replies = JSON.stringify(replies);
  //console.log(replies)
  res.send(replies);
});

//EXPRESS POST REQ -------------------------------------------------------------------

app.post("/login-form", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log(`Username: ${username}, Password: ${password}`);

  //console.log(validateEmail(email));
  let id = await loginVerification(username, password);
  if (password.length <= 8) {
    //send to error page
    res.render(path.join("login", "index"), {
      isSignedIn: false,
      errorMessage: "Your password needs to be at least 8 characters",
    });
  } else if (!id) {
    res.render(path.join("login", "index"), {
      isSignedIn: false,
      errorMessage: "Please check your username and password",
    });
  } else {
    res.header("set-cookie", `userid=${id}`);
    res.send(
      `<body><script> sessionStorage.setItem("id", ${id}); window.location.href = window.location.origin;</script></body>`
    );
  }
});

app.post("/signin-form", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  console.log(`Username: ${username}, Email: ${email}, Password: ${password}`);

  //console.log(validateEmail(email));

  if (password.length <= 8 || !validateEmail(email)) {
    //send to error page
    res.sendFile(path.join(__dirname, "public", "signin", "index_error.html"));
  } else {
    let id = generate10DigitRandomNumber();
    while (checkDuplicateId(id)) {
      id = generate10DigitRandomNumber();
    }
    //console.log(id);
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    client.query(
      `INSERT INTO accounts (username, pass, email, creation_date, id) VALUES ('${username}', '${password}', '${email}', '${formattedDate}', ${id});`,
      (err, res) => {
        if (err) {
          console.error(
            "Error inserting new user into PostgreSQL database",
            err
          );
        } else {
          console.log("New user inserted into PostgreSQL database");
        }
      }
    );

    res.redirect("/");
  }
});

app.post("/add-message-form", (req, res) => {
  //console.log(req.body);
  const title = req.body.title;
  const question = req.body.message;
  const author = req.body.id;

  //console.log(`Title: ${title}, Question: ${question}`)

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];
  let id = generate10DigitRandomNumber();
  while (checkDuplicateId1(id)) {
    id = generate10DigitRandomNumber();
  }
  client.query(
    `
    INSERT INTO apphysics1 (resolved, title, body, posted_at, author) 
    VALUES ($1, $2, $3, $4, $5, $6)
  `,
    [false, title, question, formattedDate, author],
    (err, res) => {
      if (err) {
        console.error(
          "Error inserting new message into PostgreSQL database",
          err
        );
      } else {
        console.log("New message posted with id: " + `${id}`);
      }
    }
  );

  client.query("SELECT * FROM apphysics1", (err, result) => {
    if (err) {
      console.error("Error fetching messages from PostgreSQL database", err);
    } else {
    }
  });

  // res.redirect('/loggedIn-chat');

  // if (title.length > 50){
  //   res.sendFile(path.join(__dirname, "public", "add-message", "index_error.html"));
  // }else{

  // }
});

app.post("/post-reply-form", async (req, res) => {
  let messageId = req.query.id.match(digits).join(); //match only numbers and join array to string

  let author = parseCookies(req.headers.cookie).userid

  let title = req.body.title;

  let body = req.body.body;

  let date = new Date();

  let username = await getNameFromId(author);

  let replyId = await client.query(
    "select id from replies order by id desc limit 1;"
  );

  if (replyId != undefined || replyId != null) {
    replyId = replyId.rows[0].id + 1;
    //console.log("message: " + replyId);
  } else {
    replyId = 1;
    console.log("WARNING: REPLY SYSTEM NOT WORKING");
  }

  await client.query(
    `INSERT INTO replies (title, body, posted_at, author, id, username) VALUES ($1, $2, $3, $4, $5, $6);`,
    [title, body, date, author, replyId, username]
  );

  await client.query(
    `update apphysics1 set reply_ids = array_append(reply_ids, ${replyId}) where id = ${messageId}`
  );

  console.log("reply added: " + title + " by " + getNameFromId(author));

  refreshMessages();

  res.redirect("/");
});

//404 PAGE MIDDLEWARE
app.use(async (req, res) => {
  if (await authenticateUser(req)) {
    res.render(path.join("404", "index"), { isSignedIn: true });
  } else {
    res.render(path.join("404", "index"), { isSignedIn: false });
  }
});

//SERVER PROCCESING FUNCTIONS

async function loginVerification(username, password) {
  return new Promise((resolve, reject) => {
    client.query(
      "SELECT id FROM accounts WHERE pass = $1 AND username = $2;",
      [password, username],
      (err, res) => {
        if (err) {
          reject(err);
        } else if (res.rows.length > 0) {
          resolve(res.rows[0].id);
        } else {
          resolve(false); // Login failed
        }
      }
    );
  });
}

async function getNameFromId(id) {
  let name = await client.query(
    "SELECT username FROM accounts WHERE id = $1;",
    [id]
  );
  return name.rows[0] == undefined ? "Anonymous" : name.rows[0].username;
}
async function getReplies(id) {
  let replyIds = await client.query(
    "select reply_ids from apphysics1 where id = " + id + " limit 1;"
  );
  replyIds = replyIds == undefined ? [] : replyIds.rows[0].reply_ids;

  let replies = [];

  if (replyIds != null && replyIds != undefined) {
    let promises = replyIds.map(async (id) => {
      const reply = await client.query(
        "select * from replies where id =" + id + " limit 1;"
      );

      replies.push({
        id: reply.rows[0].id,
        title: reply.rows[0].title,
        body: reply.rows[0].body,
        posted_at: reply.rows[0].posted_at,
        author: "- " + reply.rows[0].username,
      });
    });

    await Promise.all(promises);

    return replies;
  } else {
    return [];
  }
}
async function getQuestion(id) {
  if (digits.test(id)) {
    const res = await client.query("SELECT * FROM apphysics1 WHERE id = $1;", [
      id
    ]);
    if (!res.rows[0].body) {
      console.log(`Question ${id} not found.`);
      return {};
    }
    return res.rows[0];
  } else {
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
      if (result.rows.length > 0) {
        return true;
      }
      return false;
    }
  });
}

async function getAccountInfo(id) {
  const result = await client.query("SELECT * FROM accounts WHERE id = $1;", [
    id
  ]);
  return result.rows[0];
}

async function refreshMessages() {
  client.query(
    "SELECT * FROM apphysics1 order by id desc LIMIT 50",
    async (err, req) => {
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
          //console.log(cardData[i].reply_ids);
          if (cardData[i].reply_ids) {
            cardData[i].reply = cardData[i].reply_ids.length;
          } else {
            cardData[i].reply = 0;
          }
        }
        console.log("The main chat messages have been refreshed.");
        unreadMessages = cardData;
      }
    }
  );
}

async function authenticateUser(req) {
  let id = parseCookies(req.header.cookie).userid;
  if (id) {
    return true;
  }
  return false;
}

function parseCookies(cookies) {
  let ans = {};
  if (cookies) {
    cookies.split(";").forEach((pair) => {
      let key = pair.split("=")[0];
      let value = pair.split("=")[1];
      key.trim();
      value.trim();
      ans[key] = value;
    });
  }
  return ans;
}

app.listen(port, () => {
  console.log("Server started on port: " + port);
  setInterval(refreshMessages, 18000000); //5mins = 1000 * 60 * 60 * 5
  console.log("Service ready!, local server link: http://localhost:" + port);
});
