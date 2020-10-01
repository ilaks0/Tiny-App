const express = require('express');
const router = express.Router();
const { urlDatabase, users } = require('../db');

module.exports = ({ idHelper, urlsForUser, getEmailById, generateRandomString }) => {

  router.get('/', (req, res) => {
    let user = getEmailById(req.session['user_id'], users);
    let urls = {};
    if (idHelper(req.session['user_id'], users))
      urls = urlsForUser(req.session['user_id'], urlDatabase);
    const templateVars = { urls, user };
    res.render('urls_index', templateVars);
  });

  router.get('/new', (req, res) => {
    let user;
    if (idHelper(req.session['user_id'], users)) {
      user = users[req.session['user_id']].email
    } else
      return res.redirect('/login');
    const templateVars = {
      urls: urlDatabase,
      user
    };
    res.render('urls_new', templateVars);
  });

  router.post('/', (req, res) => {
    if (idHelper(req.session['user_id'], users)) {
      let uniqueShort = generateRandomString();
      let newDate = (new Date()).toUTCString();
      let newURL = {
        longURL: req.body.longURL,
        userID: req.session['user_id'],
        date: newDate,
        visits: {},
        totalVisits: 0
      };
      urlDatabase[uniqueShort] = newURL;
      return res.redirect(302, `/urls/${uniqueShort}`);
    }
    else
      res.redirect(401, '/urls');
  });

  router.post('/:id/delete', (req, res) => {
    if (idHelper(req.session['user_id'], users)) {
      if (urlDatabase[req.params.id].userID === req.session['user_id']) { // if the url's creator is the current user 
        delete urlDatabase[req.params.id]; // then delete the url
        return res.redirect(`/urls/`);
      }
    } else
      res.redirect(401, '/urls');
  });

  router.post('/:id', (req, res) => {
    if (idHelper(req.session['user_id'], users)) {
      if (urlDatabase[req.params.id].userID === req.session['user_id']) {
        urlDatabase[req.params.id].longURL = req.body.longURL;
        return res.redirect(`/urls/`);
      }
    } else
      res.redirect(401, '/urls');
  });

  router.get('/:id', (req, res) => {
    if (!(idHelper(req.params.id, urlDatabase)))
      return res.redirect(400, '/urls');
    let user = ''; // user email, can be blank in case of no login
    let id = ''; // user id, similar case to email
    if (idHelper(req.session['user_id'], users)) {
      user = users[req.session['user_id']].email;
      id = req.session['user_id'];
    }
    const templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user,
      id,
      list: urlDatabase,
      date: urlDatabase[req.params.id].date,
      totalVisits: urlDatabase[req.params.id].totalVisits,
      uniqueVisits: Object.keys(urlDatabase[req.params.id].visits).length
    }
    res.render('urls_show', templateVars)
  });

  return router;
}