const getUserByEmail = (email, db) => {
  for (const user in db) {
    if (db[user].email === email)
      return user;
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
  let cpy = {};
  for (let short in urlDatabase) {
    if (urlDatabase[short].userID === id)
      cpy[short] = urlDatabase[short];
  }
  return cpy;
}

const urlInDB = (url, db) => {
  for (const short in db) {
    if (short === url)
      return true
  }
  return false;
}

module.exports = {
  getUserByEmail,
  idHelper,
  urlsForUser,
  urlInDB
}