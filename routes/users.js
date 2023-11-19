var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/travelItinerary");

const authSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  itineraries: [{ type: mongoose.Types.ObjectId, ref: "itinerary" }],
});

module.exports = mongoose.model("user", authSchema);
