const express = require('express');
const app = express();
const port = 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const generateRandomString = () => Math.random().toString(36).substring(2, 8);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

let todaysDate = new Date();
const hashed = password => bcrypt.hashSync(password, 10);
const urlDatabase = {
  b6UTxQ: { 
    longURL: "https://www.tsn.ca", 
    userID: "aJ48lW", 
    date: todaysDate, 
    visits: {},
  uniqueVisits: function() {
    return Object.keys(this.visis).reduce((a, val) => a + val, 0);
  }
 },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW", date: todaysDate, visits: {} },
  sgq3y6: { longURL: 'http://www.youtube.com', userID: 'abcdef', date: todaysDate, visits: {} }
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
const idHelper = idCan => {
  for (let user in users) {
    if (idCan === users[user].id)
      return true;
  }
  return false;
};

const urlsForUser = id => {
  let cpy = {};
  for (let short in urlDatabase) {
    if (urlDatabase[short].userID === id)
      cpy[short] = urlDatabase[short];
  }
  return cpy;
}


app.set("view engine", "ejs");

app.get('/login', (req, res) => {
  if(idHelper(req.cookies['user_id']))
    return res.redirect('/urls');
  let userId;
  idHelper(req.cookies['user_id']) ? userId = users[req.cookies['user_id']].email : userId = '';
  const templateVars = {
    user: userId
  }
  res.render('user_login', templateVars);
});

app.post('/login', (req, res) => {
  for (let user in users) {
    if (req.body.email === users[user].email && bcrypt.compareSync(req.body.password, users[user].password)) {
      res.cookie('user_id', user);
      return res.redirect('/urls');
    }
  }
  res.redirect(403, '/login');
});

app.get('/', (req, res) => {
  if (idHelper(req.cookies['user_id']))
    return res.redirect('/urls')
  else
    return res.redirect('/login');
});

app.get('/urls', (req, res) => {
  let userId;
  idHelper(req.cookies['user_id']) ? userId = users[req.cookies['user_id']].email : userId = '';
  let newDB = {};
  if (idHelper(req.cookies['user_id']))
    newDB = urlsForUser(req.cookies['user_id']);
  const templateVars = {
    urls: newDB,
    user: userId
  }
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let userId;
  if (idHelper(req.cookies['user_id'])) {
    userId = users[req.cookies['user_id']].email
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
  urlDatabase[newStr].userID = req.cookies['user_id'];
  urlDatabase[newStr].date = newDate;
  res.redirect(302, `/urls/${newStr}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (idHelper(req.cookies['user_id'])) {
    if (urlDatabase[req.params.shortURL].userID === req.cookies['user_id']) {
      delete urlDatabase[req.params.shortURL];
      return res.redirect(`/urls/`);
    }
  } else
    res.redirect(404, '/urls');
});
app.get('/register', (req, res) => {
  let userId;
  idHelper(req.cookies['user_id']) ? userId = users[req.cookies['user_id']].email : userId = '';
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
  if (idHelper(req.cookies['user_id'])) {
    if (urlDatabase[req.params.shortURL].userID === req.cookies['user_id']) {
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
  else {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    urlDatabase[req.params.shortURL].visits.ip ? urlDatabase[req.params.shortURL].visits.ip++
      : urlDatabase[req.params.shortURL].visits.ip = 1;
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(302, `${longURL}`);
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => {
  let userEmail = '';
  let userId = '';
  if (idHelper(req.cookies['user_id'])) {
    userEmail = users[req.cookies['user_id']].email;
    userId = req.cookies['user_id'];
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
