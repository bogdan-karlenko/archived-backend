const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const User = require('mongoose').model('User');

router.get('/', (req, res) => {
    const id = req.query.id;
    if (!id) res.status(400).end();
    User.findOne({ _id: id })
        .then(user => {
            if (!user) res.send('User not found');
            res.send(user.toProfileJSON());
        })
        .catch(err => {
            console.log(err);
            res.status(500).end();
        })
})

router.post('/', (req, res) => {
    const user = req.body;
    if (!user || !user.id) res.status(400).end();
    User.findOne({ _id: user.id })
        .then(currentUser => {
            if (user.hasOwnProperty('password')) {
                if (!user.password) {
                   currentUser.password = undefined;
                } else {
                    currentUser.password = bcrypt.hashSync(user.password, 10);
                }
            }
            if (user.hasOwnProperty('facebook')) {
                if (!user.facebook) {
                    console.log('===>');
                    currentUser.facebook_id = undefined;
                } else {
                    currentUser.facebook_id = user.facebook;
                }
            }
            if (user.hasOwnProperty('google')) {
                if (!user.google) {
                    currentUser.google_id = undefined;
                } else {
                    currentUser.google_id = user.google;
                }
            }
            return currentUser.save()
        })
        .then(savedUser => res.send(savedUser.toProfileJSON()))
        .catch(err => {
            console.log(err);
            res.status(500).end();
        })
})

router.post('/create', (req, res) => {
    const user = req.body;
    if (!user.username || !user.password) res.status(400).end();
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) res.status(500).send(err);
        user.password = hash;
        User.create(user).then(user => {
            res.status(201).send(user._id);
        }).catch((err) => {
            res.status(400).send(err);
        });
    });
});

module.exports = router;
