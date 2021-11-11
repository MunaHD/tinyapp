const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { 
  generateRandomString, 
  createNewUser, 
  findUserbyEmail
} = require('./helpers/helpers')

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


const urlDatabase = {
  "b6UTxQ": {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
  },
  "i3BoGr": {
        longURL: "http://www.google.com",
        userID: "aJ48lW"
  }
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





const urlsForUser = (id) => {
  let userUrl = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
       userUrl[key] = urlDatabase[key]
    }
  }
  return userUrl
}




app.get("/register", (req,res) => {
  const userCookieId = req.session.user_id 
  //if user is looged in redirect to urls
  if (userCookieId) {
    return res.redirect("/urls")
  }

  const templateVariables = {user: users[userCookieId]}
  res.render("register", templateVariables);
});


app.post("/register", (req, res) => {
  let id = generateRandomString();
  const { email, password}= req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const userObject = {
    id: id,
    email: req.body.email,
    password: hashedPassword,
  }

   //check if the password and email are empty
  if (email === '' || password === ''){
    return res.status(400).send('Email/Password is empty. Please try again!');
  }


   //console.log("user email", user.email)
  if(findUserbyEmail(email, users)) {

    return res.status(400).send(' A user already exists with this email!');
  }
  //create user 
  const user = createNewUser(users, userObject)
  
  users[id] = userObject
  



  //when we create a user then assign cookie
  if (user) {
   
    req.session.user_id = user.id;

   
  
    return res.redirect("/urls")
  }
  
  res.redirect("/register")

});












//shows hello on the home page
app.get("/", (req, res) => {
  res.send("Hello! This is the home page");
});

// // prints hello to page
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

//shows the page to create new short url
app.get("/urls/new", (req, res) => {
   //if user is looged in redirect to urls
   const userCookieId = req.session.user_id 
   if (!userCookieId) {
    return res.redirect("/login")
  }
  
  const templateVariables = {user: users[userCookieId]}
  res.render("urls_new", templateVariables);
});


//create link that shortURL leads to
app.get("/u/:shortURL", (req, res) => {
  
  const longURL = urlDatabase[req.params.shortURL].longURL

  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("The shortURL you are trying to reach does not exist")
  }

  res.redirect(longURL);
});









//shows the page that lists urls
app.get("/urls", (req, res) => {
   const userCookieId = req.session.user_id 
   //if user is looged in redirect to urls
   if (!userCookieId) {
    return res.status(401).send("Please login before accessing this page")
  }

  const templateVariables = {user: users[userCookieId], urls: urlsForUser(userCookieId) };

  res.render("urls_index", templateVariables);
});
//create shortURL

       
app.post("/urls", (req, res) => {
  let random = generateRandomString()
  const userCookieId = req.session.user_id 

  urlDatabase[random]= {longURL: req.body.longURL, userID: userCookieId }
  //console.log(req.body); 
  
  
  res.redirect("/urls") ///${random}
  
});








//shows short url page
app.get("/urls/:shortURL", (req, res) => {
  const userCookieId = req.session.user_id 
  let userUrls = urlsForUser(userCookieId)

  const templateVariables = {user: users[userCookieId], shortURL: req.params.shortURL, longURL: userUrls.longURL };
  
  // //if user is not logged in
  // if (!userCookieId ) {
  //   //throw new Error('Please log in')
  //   return res.status(401).send("Please login before accessing this page")
  // }
  
  // //if the short URL does not exist at all in any database
  // if (!userUrls[req.params.shortURL] || urlDatabase[req.params.shortURL]){
  //   return res.status(404).send("This ShortURL does not exist")
  // }
  //if user is signed in but this is not their url
  if(userCookieId) {
    if (!userUrls[req.params.shortURL]) {
      //throw new Error('This shortURL does not belong to you!')
      return res.status(403).send("This shortURL does not belong to you!")
    }
  }

  res.render("urls_show", templateVariables);
});

//updates the long url and saves it 
app.post("/urls/:shortURL", (req, res) => {
  const userCookieId = req.session.user_id 
   //if user is looged in return error message
   if (!userCookieId ) {
    throw new Error('Can\'t edit URL until you log in')
  }

  
  const shortURL = req.params.shortURL;
  //const long = req.body.longURL;
  //console.log(long)

  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: userCookieId }
  res.redirect("/urls")
});







//delete urls
app.post("/urls/:shortURL/delete", (req, res)=> {
  const userCookieId = req.session.user_id 
  if (!userCookieId) {
    throw new Error('Can\'t delete URL since you don\'t own it!')
  }
   let shortURL = req.params.shortURL;

   delete urlDatabase[shortURL];
   res.redirect("/urls")
});






app.get("/login", (req, res) => { 
  const userCookieId = req.session.user_id 
   //if user is looged in redirect to urls
   if (userCookieId) {
    return res.redirect("/urls")
  }
  const templateVariables = {user: users[userCookieId]}
  res.render("login", templateVariables);
});


//add cookie (user_id)
app.post("/login", (req, res)=> {
  const email = req.body.email;
  const password = req.body.password;
  //const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === '' || password === ''){
    return res.status(400).send('Email/Password is empty. Please try again!');
  }
 
  if(!findUserbyEmail(email, users)) {
    return res.status(403).send(' A user with this email does not exist');
  }

  const userValue = findUserbyEmail(email, users)
  //if the email exists then check the password
 
  
  if(userValue) {
    
    //if (req.body.password !== userValue.password){
    if (!bcrypt.compareSync(password, users[userValue].password)){

      return res.status(403).send(' The pasword is incorrect!');
    }
    
  }
  

  //after succssful login assign cookie
  req.session.user_id = users[userValue].id;

  res.redirect("/urls")
});





//delete cookie (user
app.post("/logout", (req, res)=> {
 
  
  req.session.user_id = null;

  res.redirect("/login") 
  //previously redirected to /urls but when logged out it doesn't display the page
  // and returns error 'please login' so I  redirected to login so it could complete
  // the logout and open a new page

});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});