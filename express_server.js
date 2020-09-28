const express = require('express');
const app = express();
const port  = 8080;
// const login = require('login');
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.set("view engine", "ejs");

app.get('/', (req, res) => {
  res.send('Hello!');
  // if (login) {
  //   app.route('/urls', (req, res) => {
  //     res.send('');
  //   })
  // } else
  // app.route('/urls', (req, res) => {
  //   res.send('');
  // })
});

app.get('/urls', (req,res) => {
  const templateVars = {
    urls: urlDatabase
  }
  res.render('urls_index', templateVars);
})

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  }
  res.render('urls_show', templateVars)
})
app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
})
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

const server = app.listen(port, () => console.log('listening ', port));