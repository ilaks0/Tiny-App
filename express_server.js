const express = require('express');
const {
  idHelper,
  urlsForUser,
  urlInDB,
  urlPrefix,
  getEmailById,
  hashed,
  urlDatabase,
  users
} = require('./helper');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const port = 8080;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['Secretkey', 'Supersecret'],
}))

const generateRandomString = () => Math.random().toString(36).substring(2, 8);

app.set("view engine", "ejs");
app.get('/login', (req, res) => {
  if (idHelper(req.session['user_id'], users))
    return res.redirect(401, '/urls');
  let user = getEmailById(req.session['user_id'], users);
  const templateVars = { user };
  res.render('user_login', templateVars);
});

app.post('/login', (req, res) => {
  for (let user in users) {
    if (req.body.email === users[user].email &&
      bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session['user_id'] = user;
      return res.redirect('/urls');
    }
  }
  res.redirect(403, '/login');
});

app.get('/', (req, res) => {
  if (idHelper(req.session['user_id'], users))
    return res.redirect('/urls');
  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  let user = getEmailById(req.session['user_id'], users);
  let urls = {};
  if (idHelper(req.session['user_id'], users))
    urls = urlsForUser(req.session['user_id'], urlDatabase);
  const templateVars = { urls, user };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
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

app.post('/urls', (req, res) => {
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

app.post('/urls/:id/delete', (req, res) => {
  if (idHelper(req.session['user_id'], users)) {
    if (urlDatabase[req.params.id].userID === req.session['user_id']) { // if the url's creator is the current user 
      delete urlDatabase[req.params.id]; // then delete the url
      return res.redirect(`/urls/`);
    }
  } else
    res.redirect(401, '/urls');
});

app.get('/register', (req, res) => {
  if (idHelper(req.session['user_id'], users))
    return res.redirect(401, '/urls');
  let user = getEmailById(req.session['user_id'], users);
  const templateVars = { user };
  res.render('user_registration', templateVars);
});

app.post('/register', (req, res) => {
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

app.post('/urls/:id', (req, res) => {
  if (idHelper(req.session['user_id'], users)) {
    if (urlDatabase[req.params.id].userID === req.session['user_id']) {
      urlDatabase[req.params.id].longURL = req.body.longURL;
      return res.redirect(`/urls/`);
    }
  } else
    res.redirect(401, '/urls');
});

app.get('/urls.json', (req, res) => { res.json(urlDatabase) });
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  if (!urlInDB(req.params.id, urlDatabase))
    return res.redirect(404, '/urls');

  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // read client's ip address and store in visited url's props
  let cURL = urlDatabase[req.params.id];
  cURL.visits[ip] ? cURL.visits.ip++ : cURL.visits.ip = 1;
  cURL.totalVisits++;
  const longURL = cURL.longURL;
  res.redirect(302, `${urlPrefix(longURL)}${longURL}`);
});

app.get('/urls/:id', (req, res) => {
  if (!urlInDB(req.params.id, urlDatabase))
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

app.listen(port, () => console.log('listening ', port));
