const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Room = new Schema(
    {
      roomNo: {type: String, required: true, max: 100, unique: true},
      imageData: {type: String}
    }
);

let roomModel = mongoose.model('Room', Room);

module.exports = roomModel;
