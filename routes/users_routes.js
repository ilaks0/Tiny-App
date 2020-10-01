const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { urlDatabase, users } = require('../db');

module.exports = ({ idHelper, getEmailById, hashed, generateRandomString }) => {
  router.get('/login', (req, res) => {
    if (idHelper(req.session['user_id'], users))
      return res.redirect(401, '/urls');
    let user = getEmailById(req.session['user_id'], users);
    const templateVars = { user };
    res.render('user_login', templateVars);
  });

  router.post('/login', (req, res) => {
    for (let user in users) {
      if (req.body.email === users[user].email &&
        bcrypt.compareSync(req.body.password, users[user].password)) {
        req.session['user_id'] = user;
        return res.redirect('/urls');
      }
    }
    res.redirect(403, '/login');
  });

  router.get('/register', (req, res) => {
    if (idHelper(req.session['user_id'], users))
      return res.redirect(401, '/urls');
    let user = getEmailById(req.session['user_id'], users);
    const templateVars = { user };
    res.render('user_registration', templateVars);
  });

  router.post('/register', (req, res) => {
    if (!(req.body.email) || !(req.body.password))
      return res.redirect(400, '/register');
    for (let user in users) {
      if (req.body.email === users[user].email) {
        return res.redirect(400, '/register');
      }
    }
    let id = generateRandomString();
    const obj = {
      id,
      email: req.body.email,
      password: hashed(req.body.password)
    };
    users[obj.id] = obj;
    res.redirect('/urls');
  });

  router.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/urls');
  });

  return router;
}