const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let UserSchema = new mongoose.Schema({
    username: { type: String, required: [true, "can't be blank"], index: true, unique: true },
    password: { type: String },
    facebook_id: { type: String, index: true, unique: true },
    google_id: { type: String, index: true, unique: true},
    createdAt: Date,
    updatedAt: Date,
}, { timestamps: true, collection: 'User' });

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.methods.toJSON = function () {
    return {
        id: this._id,
        username: this.username
    };
};

UserSchema.methods.toProfileJSON = function () {
    return {
        id: this._id,
        username: this.username,
        facebook: this.facebook_id,
        google: this.google_id
    };
};

mongoose.model('User', UserSchema);
