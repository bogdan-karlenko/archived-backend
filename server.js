'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const restify = require('express-restify-mongoose');
const app = express();
const router = express.Router();

app.use(bodyParser.json());
app.use(methodOverride());

mongoose.connect('mongodb://ebhealth-prod:gVurhNx6Bz1prFbi@cluster0-shard-00-00-4ywtq.mongodb.net:27017,cluster0-shard-00-01-4ywtq.mongodb.net:27017,cluster0-shard-00-02-4ywtq.mongodb.net:27017/ebhealth?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin');

require('./models/Provider');

restify.serve(router, mongoose.model('Provider'));

app.use(router);

router.get('/', function (req, res) {
    res.send('ebhealth-backend is up')
})

app.listen(process.env.PORT || 3000, () => {
    console.log('-------------------------')
    console.log('listening on port', process.env.PORT || 3000, '\n');
    console.log('Press Ctrl+C to exit');
    console.log('-------------------------');
});
