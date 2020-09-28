const express = require('express');
const app = express();
const port  = 8080;
// const login = require('login');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



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

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
})

const server = app.listen(port, () => console.log('listening ', port));