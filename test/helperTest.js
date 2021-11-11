const { assert } = require('chai');
const {  findUserbyEmail } = require('../helpers/helpers');

const testUsers = {
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
};

//console.log( "line 17 function:------", findUserbyEmail("user@example.com", testUsers))

describe(' findUserbyEmail', function() {
  it('should return a user with valid email', function() {
    const user =  findUserbyEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
  
    assert.equal( user, expectedUserID);
  });
  it('should return a undefined when the email does not exist', function() {
    const user =  findUserbyEmail("use@example.com", testUsers)
    const expectedUserID = undefined;
  
    assert.equal( user, expectedUserID);
  });
});