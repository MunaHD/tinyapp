const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  // how many times I want to run the loop
  let loop = 2; 
  //variable to hold the random string
  let randomStr = ''
  while(loop > 0) {
   //random uppercase letter
   let randomUpperLett = String.fromCharCode(97+Math.floor(Math.random() * 26));
   //random number between 0 -9
   let randomNum = Math.floor(Math.random() * 10);
   //random lowercase letter
   let randomLowerLett = String.fromCharCode(65+Math.floor(Math.random() * 26));
   //add all them to the random string (with this we have 3 out of 6 characters)
   randomStr += randomUpperLett + randomNum + randomLowerLett;
   loop --; 
  }
  return randomStr;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVariables = {username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVariables);
});

app.get("/urls/new", (req, res) => {
  const templateVariables = {username: req.cookies["username"]}
  res.render("urls_new", templateVariables);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVariables = {username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  
  res.render("urls_show", templateVariables);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL]
  
  res.redirect(longURL);
});

//create shortURL
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()]= req.body.longURL
  console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${generateRandomString()}`);         // Respond with 'Ok' (we will replace this)
});

//create link that shortURL leads to
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const long = req.body.longURL;
  //console.log(long)

  urlDatabase[shortURL] = long
  res.redirect("/urls")
});

//delete urls
app.post("/urls/:shortURL/delete", (req, res)=> {
   let shortURL = req.params.shortURL;

   delete urlDatabase[shortURL];
   res.redirect("/urls")
});




// gimme the COOOOOKIES

//add cookie (username)
app.post("/login", (req, res)=> {
  //let username = ;
  let username = req.body.username
  res.cookie("username", username)
  //read the cookies console.log(req.cookies['username'])
  res.redirect("/urls")
});

//delete cookie (username)
app.post("/logout", (req, res)=> {
  let username = req.body.username
  res.clearCookie('username', username)

  res.redirect("/urls")
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});