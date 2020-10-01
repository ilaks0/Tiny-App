const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");

const { urlDatabase, users } = require('./db');
const usersRoutes = require('./routes/users_routes');
const dbHelpers = require('./helpers/dbHelpers')(urlDatabase, users);
const urlsRoutes = require('./routes/urls_routes');

const port = 8080;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['Secretkey', 'Supersecret'],
}));

app.set("view engine", "ejs");

app.use(usersRoutes(dbHelpers));
app.use('/urls', urlsRoutes(dbHelpers));

app.get('/', (req, res) => {
  if (dbHelpers.idHelper(req.session['user_id'], users))
    return res.redirect('/urls');
  res.redirect('/login');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/u/:id', (req, res) => {
  if (!dbHelpers.idHelper(req.params.id, urlDatabase))
    return res.redirect(404, '/urls');

  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // read client's ip address and store in visited url's props
  let cURL = urlDatabase[req.params.id];
  cURL.visits[ip] ? cURL.visits[ip]++ : cURL.visits[ip] = 1;
  cURL.totalVisits++;
  let visitorId = dbHelpers.generateRandomString();
  cURL.time[visitorId] = (new Date).toUTCString();
  const longURL = cURL.longURL;
  res.redirect(302, `${dbHelpers.urlPrefix(longURL)}${longURL}`);
});

app.listen(port, () => console.log('listening ', port));
