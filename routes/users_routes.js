const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { users } = require('../db');

module.exports = ({ idHelper, getEmailById, hashed, generateRandomString }) => {
  
  router.get('/login', (req, res) => {
    if (idHelper(req.session['user_id'], users)) return res.status(401).render('error_page', {error: '401: You are already logged in.'});
    const user = getEmailById(req.session['user_id'], users);
    const templateVars = { user, error:'' };
    res.render('user_login', templateVars);
  });

  router.post('/login', (req, res) => {
    for (const user in users) {
      if (req.body.email === users[user].email &&
        bcrypt.compareSync(req.body.password, users[user].password)) {
        req.session['user_id'] = user;
        return res.redirect('/urls');
      }
    }
    res.render('user_login', { user:'', error: "Failed login attempt" });
  });

  router.get('/register', (req, res) => {
    if (idHelper(req.session['user_id'], users)) return res.status(401).render('error_page', {error: '401: You are already logged in, log out to register'});
    const user = getEmailById(req.session['user_id'], users);
    const templateVars = { user, error:'' };
    res.render('user_registration', templateVars);
  });

  router.post('/register', (req, res) => {
    if (!(req.body.email) || !(req.body.password)) return res.render('user_registration', {user: '', error: 'Email and password fields cannot be empty'});
    for (const user in users)
      if (req.body.email === users[user].email) return res.render('user_registration', {user: '', error: 'Email already in use'});
    const id = generateRandomString();
    req.session['user_id'] = id;
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
};