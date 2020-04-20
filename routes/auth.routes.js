const express = require('express');
const router = express.Router();
const passport = require("passport")
const User = require("../models/User.model")

const bcrypt = require("bcrypt")
const bcryptSalt = 10


const ensureLogin = require('connect-ensure-login');

router.get('/private-page', ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render('passport/private', { user: req.user });
});

router.get('/signup', (req, res) => res.render("auth/signup"))
router.post('/signup', (req, res, next) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.render('auth/signup', {errorMsg: "Rellena el formulario con el usuario y la contraseÃ±a"})
    return
  }
  User.findOne({ username })
    .then(user => {
      if (user) {
        res.render('auth/signup', {errorMsg: "El usuario ya existe"})
        return
      }
      const salt = bcrypt.genSaltSync(bcryptSalt)
      const hashPass = bcrypt.hashSync(password, salt)  
      
      User.create({ username, password: hashPass })
        .then(() => res.redirect('/'))
        .catch(() => res.render("auth/signup", { errorMsg: "No se pudo crear el usuario" }))
    })
  .catch(error => next(error))
})

router.get('/login', (req, res) => res.render('auth/login', { "errorMsg": req.flash("error") }))
router.post('/login', passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true,
    badRequestMessage: 'Rellena todos los campos'
}))


router.get("/logout", (req, res) => {
    req.logout()
    res.redirect("/")
})

module.exports = router;
