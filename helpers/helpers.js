const { urlDatabase } = require('../data/userData')

//generate random string
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

//create new user
const createNewUser = (users, userObject) => {
  if (!users[userObject.email]) {
    users[userObject.id] = userObject
    return userObject
  }
  return null
}

const findUserbyEmail = (email, users) => {
  for (let key in users) {
    //console.log("users key", users[key].email)
    if (users[key].email === email) {
      return key
    }
  } 
}
const urlsForUser = (id) => {
  let userUrls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key]
    }
  }
  return userUrls
}



module.exports = { generateRandomString, createNewUser, findUserbyEmail, urlsForUser }
