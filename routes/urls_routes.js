const express = require('express');
const router = express.Router();
const { urlDatabase, users } = require('../db');
const methodOverride = require('method-override');

module.exports = ({ idHelper, urlsForUser, getEmailById, generateRandomString }) => {

  router.use(methodOverride('_method')); // query _method in url for DELETE or PUT override

  router.get('/', (req, res) => {
    if (!idHelper(req.session['user_id'], users)) return res.status(401).render('error_page', { error: '401: You must log in to view URLs' });
    const user = getEmailById(req.session['user_id'], users);
    const urls = urlsForUser(req.session['user_id'], urlDatabase);
    const templateVars = { urls, user };
    res.render('urls_index', templateVars);
  });

  router.get('/new', (req, res) => {
    let user;
    if (idHelper(req.session['user_id'], users)) user = users[req.session['user_id']].email;
    else return res.redirect('/login');
    const templateVars = {
      urls: urlDatabase,
      user
    };
    res.render('urls_new', templateVars);
  });

  router.post('/', (req, res) => { // create new url in db 
    if (idHelper(req.session['user_id'], users)) {
      const uniqueShort = generateRandomString();
      const newDate = (new Date()).toUTCString();
      const newURL = {
        longURL: req.body.longURL,
        userID: req.session['user_id'],
        date: newDate,
        visits: {},
        totalVisits: 0,
        time: {}
      };
      urlDatabase[uniqueShort] = newURL;
      return res.redirect(302, `/urls/${uniqueShort}`);
    } else
      res.status(401).render('error_page', { error: '401: You must log in to create URLS' });
  });

  router.delete('/:id', (req, res) => {
    if (idHelper(req.session['user_id'], users)) {
      if (urlDatabase[req.params.id].userID === req.session['user_id']) { // verify url's creator is the current user
        delete urlDatabase[req.params.id]; // then delete the url
        return res.redirect(`/urls/`);
      } else
        return res.status(401).render('error_page', { error: '401: You do not own the URL, delete failed' });
    } else
      res.status(401).render('error_page', { error: '401: Log in to delete URL' });
  });

  router.put('/:id', (req, res) => {
    if (idHelper(req.session['user_id'], users)) {
      if (urlDatabase[req.params.id].userID === req.session['user_id']) {
        urlDatabase[req.params.id].longURL = req.body.longURL; // assign updated destination to url
        return res.redirect(`/urls/`);
      } else
        return res.status(401).render('error_page', { error: '401: You do not own this URL' });
    } else
      res.status(401).render('error_page', { error: '401: Log in to edit URL' });
  });

  router.get('/:id', (req, res) => {
    if (!idHelper(req.params.id, urlDatabase)) return res.status(404).render('error_page', { error: '404: URL not found in database' });
    if (req.session['user_id'] === urlDatabase[req.params.id].userID) {
      const templateVars = { //stage specific url with props before rendering
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: users[req.session['user_id']].email,
        id: req.session['user_id'],
        list: urlDatabase,
        date: urlDatabase[req.params.id].date,
        totalVisits: urlDatabase[req.params.id].totalVisits,
        uniqueVisits: Object.keys(urlDatabase[req.params.id].visits).length,
        times: urlDatabase[req.params.id].time
      };
      return res.render('urls_show', templateVars);
    } else
      res.status(401).render('error_page', { error: '401: You do not own this URL' });

  });

  return router;
};