const { assert } = require('chai');
const { urlDatabase, users } = require('../db');
const dbHelpers = require('../helpers/dbHelpers')(urlDatabase, users);

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = dbHelpers.getUserByEmail("user@example.com", testUsers);
    const expectedOutput = testUsers["userRandomID"];
    assert.strictEqual(user, expectedOutput);
    // Write your assert statement here
  });
  it('should return null with invalid email', function() {
    const user = dbHelpers.getUserByEmail('bad@email.com', testUsers);
    const expectedOutput = null;
    assert.strictEqual(user, expectedOutput);
  });
});