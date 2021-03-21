const express = require('express');
const authController = require('../controllers/auth')
const router = express.Router();
const { check, body } = require('express-validator/check');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup',
    [
    check('email').isEmail().withMessage('Please Enter a valid Email'),
    body('password',  'Please Enter password more than 4 characters and alphanumeric').isLength({min: 5}).isAlphanumeric(),
    body('confirmPassword').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match!');
        }
        return true;
    })
    ],
    authController.postSignup);

module.exports = router;