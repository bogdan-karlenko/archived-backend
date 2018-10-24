const express = require('express');
const router = express.Router();
const passport = require('passport');

router.post('/', passport.authenticate('local'),
    (req, res) => {
        res.send(req.user);
    });

router.post('/facebook', passport.authenticate('local-facebook'),
    (req, res) => {
        res.send(req.user);
    });

router.post('/google', passport.authenticate('local-google'),
    (req, res) => {
        res.send(req.user);
    });

module.exports = router;
