const saltRounds = 10;
const bcrypt = require('bcrypt');

const hashed = password => bcrypt.hashSync(password, saltRounds);

let todaysDate = (new Date()).toUTCString();

const urlDatabase = { // Sample URL Database
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    date: todaysDate,
    visits: {},
    totalVisits: 0,
    time: {}
  },
  i3BoGr: {
    longURL: "https://www.google.ca", userID: "aJ48lW", date: todaysDate, visits: {},
    totalVisits: 0,
    time: {}
  },
  sgq3y6: {
    longURL: 'http://www.youtube.com', userID: 'abcdef', date: todaysDate, visits: {},
    totalVisits: 0,
    time: {}
  }
};

const users = { // Sample User Database
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hashed('purple-monkey-dinosuar')
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "user2@example.com",
    password: hashed("dishwasher-funk")
  },
  "abcdef": {
    id: 'abcdef',
    email: 'test@test.ca',
    password: hashed('asd')
  }
};

module.exports = {
  urlDatabase,
  users
};