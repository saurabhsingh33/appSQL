const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check')

exports.getLogin = (req, res, next) => {
    //const isLoggedIn = req.get('Cookie').trim().split('=')[1];
    let msg = req.flash('error');
    if (msg.length > 0) {
        msg = msg[0];
    } else {
        msg = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false,
        errorMessage: msg
    });
};

exports.getSignup = (req, res, next) => {
    let msg = req.flash('error');
    if (msg.length > 0) {
        msg = msg[0];
    } else {
        msg = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuthenticated: false,
        errorMessage: msg
    });
};

exports.postLogin = (req, res, next) => {
    // Seting a cookie
    // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');
    // session
    //
    const email = req.body.email;
    const password = req.body.password;
    User.findAll({where : {
        email: email
    }})
        .then(user => {
            if(user.length === 0) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
            }
            console.log(user);
            bcrypt.compare(password, user[0].password)
            .then(result => {
                //here result will be a boolean
                if (result) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        console.log(err);
                        res.redirect('/');
                    })
                } else {
                    req.flash('error', 'Invalid email or password');
                    res.redirect('/login');
                }
            })
            .catch(err => {
                console.log(err);
                res.redirect('/login');
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postSignup = (req, res, next) => {
    const id = Math.floor(Math.random() * 100);
    const name = req.body.email;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg
        });
    }
    User.findAll({
        where: {
            email: email
        }
    })
        .then(userData => {
            if (userData.length !== 0) {
                console.log('Redirecting to /signup');
                console.log('userData');
                console.log(userData.length);
                console.log('userData');
                req.flash('error', 'Email entered already exist');
                return res.redirect('/signup');
            } else {
                return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    return userData = User.create({
                        id: id,
                        name: name,
                        email: email,
                        password: hashedPassword
                    });
                })
                .then(result => {
                    console.log('Redirecting to /login');
                    res.redirect('/login');
                });
                
            }
            //console.log(userData);
            //return userData.save();
        })
        .catch(err => {
            console.error(err);
        })

};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};