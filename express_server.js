const express = require('express');
const app = express();
const port = 8080;
const cookieParser = require('cookie-parser');

const bodyParser = require("body-parser");
const generateRandomString = () => Math.random().toString(36).substring(2, 8);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls/');
});

app.set("view engine", "ejs");

app.get('/', (req, res) => {
  res.send('Hello!');
});
app.get('/urls', (req, res) => {
  let username = req.cookies.username || '';
  const templateVars = {
    urls: urlDatabase,
    username: username
  }
  res.render('urls_index', templateVars);
})
app.get('/urls/new', (req, res) => {
  let username = req.cookies.username || '';
  const templateVars = {
    urls: urlDatabase,
    username: username
  }
  res.render('urls_new', templateVars);
})
app.post('/urls', (req, res) => {
  let newStr = generateRandomString();
  urlDatabase[newStr] = req.body.longURL;
  res.redirect(300, `/urls/${newStr}`);
})

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(200, `/urls/`);
});
app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(300, `/urls/`);
})
app.get('/u/:shortURL', (req, res) => {
  if (req.params.shortURL === 'undefined') {
    res.send('404 Page Not Found');
    res.statusCode = 404;
    return;
  }
  else {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(300, `${longURL}`);
  }
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect(200, '/urls');
})

app.get('/urls/:shortURL', (req, res) => {
  let username = req.cookies.username || '';
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: username
  }
  res.render('urls_show', templateVars)
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.use(bodyParser.urlencoded({ extended: true }));
const server = app.listen(port, () => console.log('listening ', port));
