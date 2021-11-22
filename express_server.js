const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { 
  generateRandomString, 
  createNewUser, 
  findUserbyEmail,
  urlsForUser
} = require('./helpers/helpers')
const { urlDatabase, users } = require('./data/userData')

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["hello try to hack me", "thought you could make it, too bad you didn\'t"],

}))



//shows hello on the home page
app.get("/", (req, res) => {
   //if user is looged in redirect to urls
   const userId = req.session.user_id 
   if (!userId) {
    return res.redirect("/login")
  }
  res.redirect("/urls");
});


//register page
app.get("/register", (req,res) => {
  const userId = req.session.user_id 
  //if user is logged in redirect to urls
  if (userId) {
    return res.redirect("/urls")
  }

  const templateVariables = {user: users[userId]}
  res.render("register", templateVariables);
});


//login page
app.get("/login", (req, res) => { 
  const userId = req.session.user_id 
   //if user is logged in redirect to urls
   if (userId) {
    return res.redirect("/urls")
  }
  const templateVariables = {user: users[userId]}
  res.render("login", templateVariables);
});


//shows the page to create new short url
app.get("/urls/new", (req, res) => {
   //if user is looged in redirect to urls
   const userId = req.session.user_id 
   if (!userId) {
    return res.redirect("/login")
  }
  
  const templateVariables = {user: users[userId]}
  res.render("urls_new", templateVariables);
});


//create link that shortURL leads to
app.get("/u/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL
  
  if (!urlDatabase[shortUrl]) {
    return res.status(404).send("The shortURL you are trying to reach does not exist")
  }

  const longURL = urlDatabase[shortUrl].longURL
  res.redirect(longURL);
});


//shows the page that lists urls
app.get("/urls", (req, res) => {
   const userId = req.session.user_id 
  

   //if user is looged in redirect to urls
   if (!userId) {
    return res.status(401).send("Please <a href='/login'>login</a> before accessing this page!")
  }
  

  const templateVariables = {user: users[userId], urls: urlsForUser(userId) };
  res.render("urls_index", templateVariables);
});


//shows short url page
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id 
  const shortURL = req.params.shortURL; 


  const templateVariables = {
    user: users[userId],
    shortURL: shortURL , 
    longURL: urlDatabase[shortURL].longURL 
  };
  
  res.render("urls_show", templateVariables);
});


app.post("/register", (req, res) => {
  let id = generateRandomString();
  const { email, password}= req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  
  //check if the password and email are empty
  if (email === '' || password === ''){
    return res.status(400).send('Email/Password is empty. Please try again!');
  }
  
  // if the email
  if(findUserbyEmail(email, users)) {
    return res.status(400).send(' A user already exists with this email!');
  }

  //create user 
  const userObject = {
    id: id,
    email: req.body.email,
    password: hashedPassword,
  }
  const user = createNewUser(users, userObject)

  //when we create a user then assign cookie
  if (user) { 
    req.session.user_id = user.id;
    return res.redirect("/urls")
  }
  
  res.redirect("/register")

});


//add cookie (user_id)
app.post("/login", (req, res)=> {
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === ''){
    return res.status(400).send('Email/Password is empty. Please try again!');
  }
 
  if(!findUserbyEmail(email, users)) {
    return res.status(403).send(' A user with this email does not exist');
  }


  const userId = findUserbyEmail(email, users)
  //check the existing users ID to see if it maches the given one
  if(userId) {
    
    //the value of 'users[userId].password' is the hashed password
    if (!bcrypt.compareSync(password, users[userId].password)){
      return res.status(403).send(' The pasword is incorrect!');
    }  
  }
  //after succssful login assign cookie
  req.session.user_id = users[userId].id;

  res.redirect("/urls")
});


//create shortURL
app.post("/urls", (req, res) => {
  const userId = req.session.user_id 
  let shortURL = generateRandomString()
  
    //if user is not logged in
    if (!userId ) {
      return res.status(401).send("Please <a href='/login'>login</a> before accessing this page")
    } else {
      urlDatabase[shortURL]= {longURL: req.body.longURL, userID: userId }
      res.redirect(`/urls/${shortURL}`)
    }
    
    //if the shortURL does not exist
     if (!urlDatabase[shortURL]) {

       
      return res.status(404).send("ShortURL does not exist")
     }
  
    //if user is logged in doesnt own url 
    if(userId !== urlDatabase[shortURL].userID) {

        return res.status(403).send("This shortURL does not belong to you!")
    
    }
  
   
  
});


//updates the long url and saves it 
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id 
  const shortURL = req.params.shortURL;

  //if user isn't logged in return Error
  if (!userId ) {
    return res.status(401).send("Please <a href='/login'>login</a> before accessing this page")
  }
   //if user is logged in  but doesn't own URL return error message
   if (userId && (userId === urlDatabase[shortURL].userID)) {
     //updates the shortURL
    urlDatabase[shortURL]= {longURL: req.body.longURL, userID: userId } 
    return res.redirect("/urls")
    
    } else {
      return res.status(401).send('Can\'t edit URL because you do not own it')
    }
  
});


//delete urls
app.post("/urls/:shortURL/delete", (req, res)=> {
  const userId = req.session.user_id 
  const shortURL = req.params.shortURL;
  
  //if user isn't loged in 
  if (!userId) {
    return res.status(401).send('Can\'t delete URL because you are not logged in!')
  }
  
  //if user is logged in but soen't own URL
  if (userId && userId !== urlDatabase[shortURL].userID) {
    return res.status(401).send('Can\'t delete URL because you do not own it')
  }

  delete urlDatabase[shortURL];

   res.redirect("/urls")
});


//delete cookie (user
app.post("/logout", (req, res)=> {
  //delete cookie
  req.session.user_id = null;

  res.redirect("/urls") 
  //previously redirected to /logins because when logged out urls doesn't display the page
  // and returns error 'please login'

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});