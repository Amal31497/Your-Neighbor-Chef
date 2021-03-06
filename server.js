// DEPENDENCIES *UNCOMMENT*
const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const routes = require('./controllers');
const helpers = require('./utils/helpers');

// Set up Sequelize *UNCOMMENT*
const sequelize = require('./config/connection');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const PORT = process.env.PORT || 3001;

// Set up Handlebars.js engine with custom helpers
const hbs = exphbs.create();

// Session structure for Authentication *UNCOMMENT*
const sess = {
  secret: 'Super secret secret',
  cookie: {},
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize
  })
};

// Turn on Session *UNCOMMENT*
app.use(session(sess));

// Inform Express.js on which template engine to use *UNCOMMENT*
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Turn on Express.json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Turn on Express.static to serve public folder (js/css)
app.use(express.static('public'))

// Turn on Express Routes
app.use(routes);


// Set up PORT
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log('Now listening'));
});
