const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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
  const templateVariables = { urls: urlDatabase };
  res.render("urls_index", templateVariables);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVariables = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVariables);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});