const express = require('express');
const app = express();
const port = 8080;
// const login = require('login');
const generateRandomString = () => Math.random().toString(36).substring(2, 8);

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

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

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase
  }
  res.render('urls_index', templateVars);
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})
app.post('/urls', (req, res) => {
  // console.log(req.body);
  let newStr = generateRandomString();
  urlDatabase[newStr] = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(300, `/urls/${newStr}`);
  // res.end();
})

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(200, `/urls/`);
});
app.post('/urls/:shortURL', (req, res) => {
  console.log(req.params);
  console.log(req.body);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(300, `/urls/`);
})

app.get('/u/:shortURL', (req, res) => {
  // console.log(req.params);
  console.log(req.params);
  if (req.params.shortURL === 'undefined') {
    res.send('404 Page Not Found');
    res.statusCode = 404;
    return;
  }
  else {
    const longURL = urlDatabase[req.params.shortURL];
    // console.log(longURL);
    res.redirect(300, `${longURL}`);
  }
})

app.get('/urls.json', (req, res) => {
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