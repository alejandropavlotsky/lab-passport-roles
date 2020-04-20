require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const session = require("express-session")
const bcrypt = require("bcrypt")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const flash = require("connect-flash")
const User = require("./models/User.model")


//no volver a cometer error de pasar otro nombre que en seed.js
mongoose
  .connect('mongodb://localhost/passport-roles', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(x => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
  .catch(err => console.error('Error connecting to mongo', err));

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'Passport App';

app.use(session({
  secret: "passport-app-webmad0320",
  resave: true,
  saveUninitialized: true
}))

passport.serializeUser((user, next) => next(null, user._id))
passport.deserializeUser((id, next) => {
  User.findById(id)
  .then(theUser => next(null, theUser))
  .catch(err => next(err))
})



app.use(flash())

passport.use(new LocalStrategy({ passReqToCallback: true }, (req, username, password, next) => {
  User.findOne({ username })
  .then(user => {
    if (!user) {
      return next(null, false, { message: "Nombre de usuario incorrecto" })
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, { message: "Contraseña incorrecta" })
    }
    return next(null, user)
  })
  .catch(err => next(err))
}))

app.use(passport.initialize())
app.use(passport.session())


// Routes middleware goes here
const index = require('./routes/index.routes');
app.use('/', index);
const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes);
const adminRoutes = require('./routes/admin.routes');
app.use('/admin', adminRoutes);
const usersRoutes = require('./routes/user.routes');
app.use('/users', usersRoutes);


module.exports = app
