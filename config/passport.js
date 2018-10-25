
const passport = require('passport');
const passportJWT = require("passport-jwt");
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

const bcrypt = require('bcrypt');
const https = require('https');
const jwt = require('jsonwebtoken');

const User = require('mongoose').model('User');


passport.serializeUser((data, done) => {
    done(null, data.user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    (username, password, done) => {
        User.findOne({ username }, (err, user) => {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET);
                    return done(null, {user, token});
                } else {
                    return done(null, false, { message: 'Incorrect password.' });
                }
            });
        });
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
},
    (jwtPayload, done) => {
        return User.findOne({_id: jwtPayload.id})
            .then(user => {
                return done(null, {user});
            })
            .catch(err => {
                return done(err);
            });
    }
));

passport.use('local-facebook', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'token'
},
    (id, token, done) => {
        https.get('https://graph.facebook.com/oauth/access_token?client_id=' + process.env.FB_CLIENT_ID + '&client_secret=' + process.env.FB_SECRET + '&grant_type=client_credentials', (acessRes) => {
            acessRes.on('data', (data) => {
                const accessToken = JSON.parse(data.toString('utf8')).access_token;
                if (!accessToken) return done(null, false, { message: 'No access token' });
                https.get('https://graph.facebook.com/debug_token?input_token=' + token + '&access_token=' + accessToken, (verifyRes) => {
                    verifyRes.on('data', (data) => {
                        const userId = JSON.parse(data.toString('utf8')).data.user_id;
                        if (userId === id) {
                            User.findOne({ facebook_id: id }, (err, user) => {
                                if (!user) return done(null, false, { message: 'This account is not connected to any user' });
                                const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET);
                                return done(null, { user, token });
                            })
                        } else {
                            return done(null, false, { message: 'Wrong user token' });
                        }
                    })
                }).on('error', (e) => {
                    return done(null, false);
                });
            });
        }).on('error', (e) => {
            return done(null, false);
        });
    }));

passport.use('local-google', new LocalStrategy({
    usernameField: 'id',
    passwordField: 'token'
},
    (id, token, done) => {
        https.get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + token, (verifyRes) => {
            verifyRes.on('data', (data) => {
                const userId = JSON.parse(data.toString('utf8')).sub;

                if (userId === id) {
                    User.findOne({ google_id: id }, (err, user) => {
                        if (!user) return done(null, false, { message: 'This account is not connected to any user' });
                        const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET);
                        return done(null, { user, token });
                    })
                } else {
                    return done(null, false, { message: 'Wrong user token' });
                }
            })
        }).on('error', (e) => {
            return done(null, false);
        });
    }));
