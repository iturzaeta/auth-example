const User = require('../models/user.model');
const mongoose = require('mongoose');
const mailer = require('../config/mailer.config');

module.exports.index = (_, res, next) => {
  User.find()
    .then(users => {
      res.render('users/index', { users })
    })
    .catch(next)
}

module.exports.new = (_, res) => {
  res.render('users/new', { user: new User() })
}

module.exports.create = (req, res, next) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  })

  user.save()
    .then((user) => {
      mailer.sendValidateEmail(user)
      res.redirect('/login')
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.render('users/new', { user, error: error.errors })
      } else {
        next(error);
      }
    })
}

module.exports.validate = (req, res, next) => {
  User.findOne({ validateToken: req.params.token })
    .then(user => {
      if (user) {
        user.validated = true
        user.save()
          .then(() => {
            res.redirect('/login')
          })
          .catch(next)
      } else {
        res.redirect('/')
      }
    })
    .catch(next)
}

module.exports.login = (_, res) => {
  res.render("users/login")
}



module.exports.doLogin = (req, res, next) => {
  
  const { email, password } = req.body ////////////////////// preguntar que coño es esto

  if (!email || !password) {
    return res.render('users/login', { user: req.body })
  }

  User.findOne({ email: email, validated: true })
    .then(user => {
      if (!user) {
        res.render('users/login', {
          //user: req.body,
          error: { password: 'invalid user or password' }
        })
      } else {
        return user.checkPassword(password)
          .then(match => {
            if (!match) {
              res.render('users/login', {
                //user: req.body,
                error: { password: 'invalid user or password' }
              })
            } else {
              req.session.user = user;
              res.redirect('/');
            }
          })
      }
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.render('users/login', {
          user: req.body,
          error: error.error
        })
      } else {
        next(error);
      }
    });
}


module.exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
}