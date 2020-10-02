const bcrypt = require('bcrypt');
const saltRounds = 10;
module.exports = () => {
  
  const getUserByEmail = (email, db) => {
    for (const user in db)
      if (db[user].email === email) return db[user];
    return null;
  };

  const idHelper = (idCandidate, db) => {
    for (let id in db)
      if (idCandidate === id) return true;
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
    const regexW = /^www\./; // check for 'www.' at beginning of url - addresses bug when redirecting to example.com
    const regexH = /^http:/; // similar to above with 'http'
    if (regexH.test(url)) return ''; // no correction needed when url starts with 'http'
    if (regexW.test(url)) return 'http://'; // adds 'http://' if url starts with 'www.' to enable redirect
    return 'http://www.'; // if url is in form of example.com, will later add 'http://www.' to beginning
  };

  const getEmailById = (id, users) => {
    if (idHelper(id, users)) return users[id].email;
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
};