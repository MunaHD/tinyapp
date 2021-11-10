const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { generateRandomString, createNewUser} = require('./helpers/user_authentication')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }

}



const findUserbyEmail = (email) => {
  for (key in users) {
    console.log("users key", users[key].email)
    if (users[key].email === email) {
      return users[key]
    }
  } return false;
}









app.get("/register", (req,res) => {
  const templateVariables = {user: users[req.cookies["user_id"]]}
  res.render("register", templateVariables);
});


app.post("/register", (req, res) => {
  let id = generateRandomString();

  const userObject = {
    id: id,
    email: req.body.email,
    password: req.body.password,
  }
  
  

  if (req.body.email === '' || req.body.password === ''){
    
    return res.status(400).send('Email/Password is empty. Please try again!');
  }
   //console.log("user email", user.email)
  if(findUserbyEmail(req.body.email)) {

    return res.status(400).send(' A user already exists with this email!');
  }
  const user = createNewUser(users, userObject)
  users[id] = userObject
  //if user exists then assign cookie
  if (user) {
    res.cookie("user_id", user.id)

    console.log(res.cookie)
    return res.redirect("/urls")
  }
  //let templateVar = {}
  res.redirect("/register")

});












//shows hello on the home page
app.get("/", (req, res) => {
  res.send("Hello! This is the home page");
});

// prints hello to page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//shows the page to create new short url
app.get("/urls/new", (req, res) => {
  const templateVariables = {user: users[req.cookies["user_id"]]}
  res.render("urls_new", templateVariables);
});


//create link that shortURL leads to
app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL]
  
  res.redirect(longURL);
});









//shows the page that lists urls
app.get("/urls", (req, res) => {
  const templateVariables = {user: users[req.cookies["user_id"]], urls: urlDatabase };
  //res.json(users)
  //res.json(users[req.cookies["user_id"]])
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
  const templateVariables = {user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  
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






app.get("/login", (req, res) => { 
  const templateVariables = {user: users[req.cookies["user_id"]]}
  res.render("login", templateVariables);
});


//add cookie (user_id)
app.post("/login", (req, res)=> {
  

  if(!findUserbyEmail(req.body.email)) {
    return res.status(403).send(' A user with this email does not exist');
  }

  const userValue = findUserbyEmail(req.body.email)

  if(findUserbyEmail(req.body.email)) {
    if (req.body.password !== userValue.password)
    return res.status(403).send(' The pasword is incorrect!');
  }
  

  //after succssful login assign cookie
  res.cookie("user_id", userValue.id)
  res.redirect("/urls")
});





//delete cookie (user
app.post("/logout", (req, res)=> {
 
  
  res.clearCookie('user_id')

  res.redirect("/urls")
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});