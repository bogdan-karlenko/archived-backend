const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');

const User = require('mongoose').model('User');

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
