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



const findUserbyEmail = (email) => {
  for (key in users) {
    //console.log("users key", users[key].email)
    if (users[key].email === email) {
      return users[key]
    }
  } return false;
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



// function belongs to user
// //checks current users urls if the shorturl user  wants to delete is not there's
// //then we return error
// const belongToUser = (shortURL, )





app.get("/register", (req,res) => {
  //if user is looged in redirect to urls
  if (req.cookies["user_id"]) {
    return res.redirect("/urls")
  }

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
  
   //check if the password and email are empty
  if (req.body.email === '' || req.body.password === ''){
    return res.status(400).send('Email/Password is empty. Please try again!');
  }


   //console.log("user email", user.email)
  if(findUserbyEmail(req.body.email)) {

    return res.status(400).send(' A user already exists with this email!');
  }
  //create user 
  const user = createNewUser(users, userObject)
  users[id] = userObject


  //if user exists then assign cookie
  if (user) {
    res.cookie("user_id", user.id)

    console.log(res.cookie)
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
   if (!req.cookies["user_id"] ) {
    return res.redirect("/login")
  }

  const templateVariables = {user: users[req.cookies["user_id"]]}
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
  
   //if user is looged in redirect to urls
   if (!req.cookies["user_id"] ) {
    return res.status(401).send("Please login before accessing this page")
  }

  

  // console.log(users[req.cookies["user_id"]])
  const templateVariables = {user: users[req.cookies["user_id"]], urls: urlsForUser(req.cookies["user_id"]) };
  //res.json(users)
  //res.json(users[req.cookies["user_id"]])
  res.render("urls_index", templateVariables);
});
//create shortURL

       
app.post("/urls", (req, res) => {
  let random = generateRandomString()

  urlDatabase[random]= {longURL: req.body.longURL, userID: req.cookies["user_id"] }
  //console.log(req.body); 
  
  
  res.redirect("/urls") ///${random}
  
});








//shows short url page
app.get("/urls/:shortURL", (req, res) => {
  let userUrls = urlsForUser(req.cookies["user_id"])

  const templateVariables = {user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: userUrls.longURL };
  
  // //if user is not logged in
  // if (!req.cookies["user_id"] ) {
  //   //throw new Error('Please log in')
  //   return res.status(401).send("Please login before accessing this page")
  // }
  
  // //if the short URL does not exist at all in any database
  // if (!userUrls[req.params.shortURL] || urlDatabase[req.params.shortURL]){
  //   return res.status(404).send("This ShortURL does not exist")
  // }
  //if user is signed in but this is not their url
  if(req.cookies["user_id"]) {
    if (!userUrls[req.params.shortURL]) {
      //throw new Error('This shortURL does not belong to you!')
      return res.status(403).send("This shortURL does not belong to you!")
    }
  }

  res.render("urls_show", templateVariables);
});

//updates the long url and saves it 
app.post("/urls/:shortURL", (req, res) => {
   //if user is looged in return error message
   if (!req.cookies["user_id"] ) {
    throw new Error('Can\'t edit URL until you log in')
  }

  
  const shortURL = req.params.shortURL;
  //const long = req.body.longURL;
  //console.log(long)

  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"] }
  res.redirect("/urls")
});







//delete urls
app.post("/urls/:shortURL/delete", (req, res)=> {
  if (!req.cookies["user_id"] ) {
    throw new Error('Can\'t delete URL since you don\'t own it!')
  }
   let shortURL = req.params.shortURL;

   delete urlDatabase[shortURL];
   res.redirect("/urls")
});






app.get("/login", (req, res) => { 
   //if user is looged in redirect to urls
   if (req.cookies["user_id"] ) {
    return res.redirect("/urls")
  }
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