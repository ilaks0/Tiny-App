const bcrypt = require('bcrypt');
const saltRounds = 10;
module.exports = () => {
  const getUserByEmail = (email, db) => {
    for (const user in db) {
      if (db[user].email === email)
        return db[user];
    }
    return null;
  };

  const idHelper = (idCan, db) => {
    for (let id in db) {
      if (idCan === id)
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

  const hashed = password => bcrypt.hashSync(password, saltRounds); // takes password argument and returns hashed 
  
  const generateRandomString = () => Math.random().toString(36).substring(2, 8);

  return {
    getUserByEmail,
    idHelper,
    urlsForUser,
    urlPrefix,
    getEmailById,
    hashed,
    generateRandomString,
  };
}