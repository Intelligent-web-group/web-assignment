const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Character = new Schema(
    {
        name: {type: String, required: true, max: 100},
        roomNo: {type: String, required: true, max:100},
        image_url: {type: String},
        whatever: {type: String} //any other field
    }
);

let characterModel = mongoose.model('Character', Character);

module.exports = characterModel;