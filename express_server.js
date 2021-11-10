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
//shows hello on the home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// prints hello to page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});






//shows the page to create new short url
app.get("/urls/new", (req, res) => {
  const templateVariables = {username: req.cookies["username"]}
  res.render("urls_new", templateVariables);
});


//create link that shortURL leads to
app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL]
  
  res.redirect(longURL);
});







//shows the page that lists urls
app.get("/urls", (req, res) => {
  const templateVariables = {username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVariables);
});
//create shortURL
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()]= req.body.longURL
  console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${generateRandomString()}`);         // Respond with 'Ok' (we will replace this)
});








//shows short url page
app.get("/urls/:shortURL", (req, res) => {
  const templateVariables = {username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  
  res.render("urls_show", templateVariables);
});

//updates the long url and saves it 
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









/*       GIVE
          ME
          THE
        COOKIES
*/  


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