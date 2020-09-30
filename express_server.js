const express = require('express');
const app = express();
const port = 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const generateRandomString = () => Math.random().toString(36).substring(2, 8);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
  b6UTxQ: { shortURL: 'b6UTxQ', longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { shortURL: 'i3BoGr', longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
const idHelper = idCan => {
  console.log(users,'USERS');
  for (let user in users) {
    if (idCan === users[user].id)
      return true;
  }
  return false;
};
app.set("view engine", "ejs");

app.get('/login', (req, res) => {
  let userId;
  idHelper(req.cookies['user_id']) ? userId = users[req.cookies['user_id']].email : userId = '';
  const templateVars = {
    user: userId
  }
  res.render('user_login', templateVars);
});

app.post('/login', (req, res) => {
  for (let user in users) {
    if (req.body.email === users[user].email && req.body.password === users[user].password) {
      res.cookie('user_id', user);
      res.redirect(200, '/urls');
      return;
    }
  }
  res.redirect(403, '/login');
});

app.get('/', (req, res) => {
  res.send('Welcome to Ian\' Tiny App!');
});

app.get('/urls', (req, res) => {
  // console.log(users, 'USERS');
  console.log(req.cookies, 'COOKIES');
  let userId;
  idHelper(req.cookies['user_id']) ? userId = users[req.cookies['user_id']].email : userId = '';
  const templateVars = {
    urls: urlDatabase,
    user: userId
  }
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  // console.log(req.cookies, 'request cookies...');
  // if (!idHelper(req.cookies['user_id'])) {
  //   console.log(idHelper(req.cookies['user_id']), req.cookies, users);
  //   res.redirect(200,'/login');
    // return;
  // } else {
    console.log(idHelper(req.cookies['user_id']), 'RESULT');

    let userId;
    idHelper(req.cookies['user_id']) ? userId = users[req.cookies['user_id']].email : userId = '';
    const templateVars = {
      urls: urlDatabase,
      user: userId
    }
    res.render('urls_new', templateVars);
  // }
});

app.post('/urls', (req, res) => {
  let newStr = generateRandomString();
  urlDatabase[newStr] = req.body.longURL;
  res.redirect(300, `/urls/${newStr}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(200, `/urls/`);
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
  const obj = {id: randId, email: req.body.email, password: req.body.password};
  users[obj.id] = obj;
  res.redirect(200, '/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = {};
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect(300, `/urls/`);
});

app.get('/u/:shortURL', (req, res) => {
  if (req.params.shortURL === 'undefined') {
    res.send('404 Page Not Found');
    res.statusCode = 404;
    return;
  }
  else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(300, `${longURL}`);
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(200, '/urls');
});

app.get('/urls/:shortURL', (req, res) => {
  let userId;
  idHelper(req.cookies['user_id']) ? userId = users[req.cookies['user_id']].email : userId = '';
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: userId
  }
  res.render('urls_show', templateVars)
});

const server = app.listen(port, () => console.log('listening ', port));
