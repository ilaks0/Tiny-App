const bcrypt = require('bcrypt');

const getUserByEmail = (email, db) => {
  for (const user in db) {
    if (db[user].email === email)
      return db[user];
  }
  return null;
};

const idHelper = (idCan, users) => {
  for (let user in users) {
    if (idCan === users[user].id)
      return true;
  }
  return false;
};

const urlsForUser = (id, urlDatabase) => {
  let owned = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id)
      owned[url] = urlDatabase[url];
  }
  return owned;
};

const urlInDB = (url, db) => {
  for (const short in db) {
    if (short === url)
      return true
  }
  return false;
};

const urlPrefix = url => {
  let regexW = /^www/;
  let regexH = /^http/;
  if (regexH.test(url))
    return '';
  if (regexW.test(url))
    return 'http://';
  return 'http://www.';
};

const getEmailById = (id, users) => {
  if (idHelper(id, users))
    return users[id].email;
  return '';  
};
const hashed = password => bcrypt.hashSync(password, 10); // takes password argument and returns hashed 
let todaysDate = (new Date()).toUTCString();

const urlDatabase = { // Sample URL Database
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
    date: todaysDate,
    visits: {},
    totalVisits: 0
  },
  i3BoGr: {
    longURL: "https://www.google.ca", userID: "aJ48lW", date: todaysDate, visits: {},
    totalVisits: 0
  },
  sgq3y6: {
    longURL: 'http://www.youtube.com', userID: 'abcdef', date: todaysDate, visits: {},
    totalVisits: 0
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
  getUserByEmail,
  idHelper,
  urlsForUser,
  urlInDB,
  urlPrefix,
  getEmailById,
  hashed,
  urlDatabase,
  users
};