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
app.use('/urls', urlsRoutes(dbHelpers)); // use default router to /urls

app.get('/', (req, res) => {
  if (dbHelpers.idHelper(req.session['user_id'], users)) return res.redirect('/urls');
  res.redirect('/login');
});


// app.get('/urls.json', (req, res) => { // send url database
//   res.json(urlDatabase);
// });

app.get('/u/:id', (req, res) => {
  if (!dbHelpers.idHelper(req.params.id, urlDatabase)) return res.status(404).render('error_page',{error: '404: URL does not exist in database'});

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // read client's ip address and store in visited url's props
  let visitURL = urlDatabase[req.params.id];
  visitURL.visits[ip] ? visitURL.visits[ip]++ : visitURL.visits[ip] = 1;
  visitURL.totalVisits++;
  const visitorId = dbHelpers.generateRandomString();
  visitURL.time[visitorId] = (new Date).toUTCString();
  const longURL = visitURL.longURL;
  res.redirect(302, `${dbHelpers.urlPrefix(longURL)}${longURL}`); // applies url correction depending on http://, www. format
});

app.listen(port, () => console.log('listening ', port));
