const express = require('express');
const router = express.Router();
const fs = require('fs');
const bcrypt = require('bcrypt');

const crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = process.env.JWT_SECRET;

const User = require('mongoose').model('User');

function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}
const generateLink = (email) => {
    return process.env.APP_URL + '/register/' + encrypt(JSON.stringify({ email: email }));
}

router.post('/', (req, res) => {
    try {
        const code = req.body.code;
        const user = req.body.user;
        if (!code || !user) res.status(400).end();
        const data = JSON.parse(decrypt(code));
        if (!data.email || data.email !== user.username) res.status(401).end();
        if (user.password) {
            user.password = bcrypt.hashSync(user.password, 10);
        }
        User.create(user).then(user => {
            res.status(201).send(user);
        }).catch(err => {
            res.status(406).send(err);
        });
    } catch (err) {
        res.status(500).end();
    }
})

router.post('/email',
    (req, res) => {
        const email = req.body.email;

        const mailjet = require('node-mailjet')
            .connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE)
        const request = mailjet
            .post("send", { 'version': 'v3.1' })
            .request({
                "Messages": [
                    {
                        "From": {
                            "Email": "bogdan@77labs.com",
                            "Name": "EBhealth"
                        },
                        "To": [
                            {
                                "Email": email
                            }
                        ],
                        'HTMLPart': fs.readFileSync(__dirname + '/../templates/activation_email.html', 'utf8'),
                        "TemplateLanguage": true,
                        "Subject": "EBhealth registration",
                        "Variables": {
                            "link": generateLink(email)
                        }
                    }
                ]
            })
        request
            .then(emailRes => res.send(emailRes))
            .catch(err => console.log(err))

    })

router.post('/validate', (req, res) => {
    const code = req.body.data;
    try {
        const data = JSON.parse(decrypt(code));
        if (!data.email) res.status(401).end();
        res.send(data);
    } catch (err) {
        res.status(401).end();
    }
})


module.exports = router;
