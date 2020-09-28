const express = require('express');
const app = express();
const server = app.listen(8080, null);
const login = require('login');
app.get('/', (req, res) => {
  res.send('');
  if (login) {
    app.route('/urls', (req, res) => {
      res.send('');
    })
  } else
    app.route('/urls', (req, res) => {
      res.send('');
    })
});
