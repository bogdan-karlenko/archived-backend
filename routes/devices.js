const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Provider = mongoose.model('Provider');

router.get('/', (req, res) => {
    Provider.distinct('devices', (err, result) => {
        if (err) res.statusCode(500);
        res.send(result.sort());
    })
});

module.exports = router;
