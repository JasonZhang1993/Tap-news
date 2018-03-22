const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');
const PassportLocalStrategy = require('passport-local').Strategy;
const config = require('../config/config.json');

module.exports = new PassportLocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false,
    passReqToCallback: true
}, (req, email, password, done) => {
    const userData = {
        email: email.trim(),
        password: password
    };

    // find a user by email address
    return User.findOne({ email: userData.email }, (err, user) => {
        if (err) { return done(err); }

        if (!user) {
            const error = new Error('Incorrect email or password');
            error.name = 'IncorrectCredentialsError';

            return done(error);
        }

        // check hashed password

        return user.comparePassword(userData.password, (passwordErr, isMatch) => {
            if (passwordErr) { return done(passwordErr); }

            if (!isMatch) {
                const error = new Error('Incorrect email or password');
                error.name = 'IncorrectCredentialsError';

                return done(error);
            }

            const payload = {
                sub: user._id
            };

            // create a token string
            const token = jwt.sign(payload, config.jwtSecret);

            return done(null, token, null);
        });
    });
});