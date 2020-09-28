const express = require('express');
const app = express();
const port  = 8080;
// const login = require('login');
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})
app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok');
})

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
})
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  }
  res.render('urls_show', templateVars)
})


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

const server = app.listen(port, () => console.log('listening ', port));