'use strict';

const express = require('express');
const app = express();
const router = express.Router();

const cors = require('cors');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const restify = require('express-restify-mongoose');
const passport = require('passport');
const mongoose = require('mongoose');

require('dotenv').config();

app.use(cors());

app.use(bodyParser.json());
app.use(methodOverride());

mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });

require('./models/Provider');
require('./models/User');

require('./config/passport');

restify.serve(router, mongoose.model('Provider'), { preMiddleware: passport.authenticate('jwt', { session: false })});

app.use(passport.initialize());
app.use(router);

router.get('/', (req, res) => {
    res.send('ebhealth-backend API')
})

app.use('/api/v1/devices', passport.authenticate('jwt', { session: false }), require('./routes/devices'))
app.use('/api/v1/login', require('./routes/login'));
app.use('/api/v1/register', require('./routes/register'));
app.use('/api/v1/user', passport.authenticate('jwt', { session: false }), require('./routes/user'));

app.listen(process.env.PORT || 3000, () => {
    console.log('-------------------------')
    console.log('listening on port', process.env.PORT || 3000, '\n');
    console.log('-------------------------');
});
