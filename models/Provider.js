const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let ProviderSchema = new mongoose.Schema({
    name: { type: String, required: [true, "can't be blank"], index: true },
    devices: [String],
    address: String,
    website: String,
    phone: String,
    email: String,
    doctors: [String],
    coordinates: {
        lat: Number,
        lng: Number
    },
    source: String,
    createdAt: Date,
    updatedAt: Date,
}, { timestamps: true, collection: 'Provider' });

ProviderSchema.plugin(uniqueValidator, { message: 'is already taken.' });

ProviderSchema.methods.toJSON = function () {
    return {
        id: this._id,
        name: this.name,
        devices: this.devices,
        address: this.address,
        website: this.website,
        phone: this.phone,
        email: this.email,
        coordinates: this.coordinates,
        source: this.source,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

mongoose.model('Provider', ProviderSchema);
