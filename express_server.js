const express = require('express');
const {
  getUserByEmail,
  idHelper,
  urlsForUser,
  urlInDB
} = require('./helper');
const app = express();
const port = 8080;
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['Secretkey', 'Supersecret'],
  // maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
let todaysDate = new Date();

const generateRandomString = () => Math.random().toString(36).substring(2, 8);
const hashed = password => bcrypt.hashSync(password, 10);
const urlDatabase = {
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
const users = {
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
}
app.set("view engine", "ejs");
app.get('/login', (req, res) => {
  if (idHelper(req.session['user_id'], users, users))
    return res.redirect('/urls');
  let userId;
  idHelper(req.session['user_id'], users, users) ? userId = users[req.session['user_id']].email : userId = '';
  const templateVars = {
    user: userId
  }
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
  if (idHelper(req.session['user_id'], users, users))
    return res.redirect('/urls')
  else
    return res.redirect('/login');
});

app.get('/urls', (req, res) => {
  let userId;
  idHelper(req.session['user_id'], users, users) ? userId = users[req.session['user_id']].email : userId = '';
  let newDB = {};
  if (idHelper(req.session['user_id'], users, users))
    newDB = urlsForUser(req.session['user_id'], urlDatabase);
  const templateVars = {
    urls: newDB,
    user: userId
  }
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let userId;
  if (idHelper(req.session['user_id'], users)) {
    userId = users[req.session['user_id']].email
  }
  else {
    return res.redirect('/login');
  }
  const templateVars = {
    urls: urlDatabase,
    user: userId
  }
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let newStr = generateRandomString();
  let newDate = new Date();
  urlDatabase[newStr] = {};
  urlDatabase[newStr].longURL = req.body.longURL;
  urlDatabase[newStr].userID = req.session['user_id'];
  urlDatabase[newStr].date = newDate;
  urlDatabase[newStr].visits = {};
  urlDatabase[newStr].totalVisits = 0;
  res.redirect(302, `/urls/${newStr}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (idHelper(req.session['user_id'], users)) {
    if (urlDatabase[req.params.shortURL].userID === req.session['user_id']) {
      delete urlDatabase[req.params.shortURL];
      return res.redirect(`/urls/`);
    }
  } else
    res.redirect(404, '/urls');
});
app.get('/register', (req, res) => {
  let userId;
  idHelper(req.session['user_id'], users) ? userId = users[req.session['user_id']].email : userId = '';
  const templateVars = {
    user: userId
  }
  res.render('user_registration', templateVars);
});

app.post('/register', (req, res) => {
  if (!(req.body.email) || !(req.body.password)) {
    res.redirect(400, '/register');
    return;
  }
  for (let user in users) {
    if (req.body.email === users[user].email) {
      res.redirect(400, '/register');
      return;
    }
  }
  let randId = generateRandomString();
  const obj = { id: randId, email: req.body.email, password: hashed(req.body.password) };
  users[obj.id] = obj;
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  if (idHelper(req.session['user_id'], users)) {
    if (urlDatabase[req.params.shortURL].userID === req.session['user_id']) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      return res.redirect(`/urls/`);
    }
  } else
    res.redirect(404, '/urls');
});

app.get('/u/:shortURL', (req, res) => {
  if (req.params.shortURL === 'undefined') {
    res.send('404 Page Not Found');
    return res.statusCode = 404;
  }
  else if (!urlInDB(req.params.shortURL, urlDatabase))
    return res.redirect(400, '/urls');
  else {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    urlDatabase[req.params.shortURL].visits[ip] ? urlDatabase[req.params.shortURL].visits.ip++
      : urlDatabase[req.params.shortURL].visits.ip = 1;
    urlDatabase[req.params.shortURL].totalVisits++;
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(302, `${longURL}`);
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => {
  if (!urlInDB(req.params.shortURL, urlDatabase))
    return res.redirect(400, '/urls');
  let userEmail = '';
  let userId = '';
  if (idHelper(req.session['user_id'], users)) {
    userEmail = users[req.session['user_id']].email;
    userId = req.session['user_id'];
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: userEmail,
    id: userId,
    list: urlDatabase
  }
  res.render('urls_show', templateVars)
});

const server = app.listen(port, () => console.log('listening ', port));
