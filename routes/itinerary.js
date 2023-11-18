var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");

const jwtModel = require("./users");

mongoose.connect("mongodb://127.0.0.1:27017/travelItinerary");

const itinerarySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dates: {
    type: Date,
    default: Date.now(),
  },
  destinations: {
    type: String,
    required: true,
  },
  activities: {
    type: String,
    required: true,
  },
  transportation_details: {
    type: String,
    required: true,
  },
  accommodation_details: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
});

module.exports = mongoose.model("itinerary", itinerarySchema);
