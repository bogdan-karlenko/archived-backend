const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let UserSchema = new mongoose.Schema({
    username: { type: String, required: [true, "can't be blank"], index: true, unique: true },
    password: { type: String, required: [true, "can't be blank"] },
    facebook_id: String,
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

mongoose.model('User', UserSchema);
