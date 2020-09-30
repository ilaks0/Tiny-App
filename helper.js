const getUserByEmail = (email, db) => {
  for (const user in db) {
    if (db[user].email === email)
      return user;
  }
  return null;
};

module.exports = { getUserByEmail }