var express = require("express");
var router = express.Router();
const jwtModel = require("./users");
const itineraryModel = require("./itinerary");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const isAuthenticated = require("../auth/isAuthenticated");

dotenv.config();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new jwtModel({
      name: req.body.name,
      username: req.body.username,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(200).json({
      message: "Signup was successful!",
    });
  } catch {
    res.status(500).json({
      message: "Signup failed!",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await jwtModel.find({ username: req.body.username });
    if (user && user.length > 0) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user[0].password
      );

      if (isValidPassword) {
        // generate token
        const token = jwt.sign(
          {
            username: user[0].username,
            userId: user[0]._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "10m",
          }
        );

        res.status(200).json({
          access_token: token,
          message: "Login successful!",
        });
      } else {
        res.status(401).json({
          error: "password wrong",
        });
      }
    } else {
      res.status(401).json({
        error: "username not found",
      });
    }
  } catch {
    res.status(401).json({
      error: "something else",
    });
  }
});

const userId = "6558ccfdffa6d66456abbccc";
const userWithItineraries = jwtModel.findById(userId).populate("itineraries");

//
// router.get("/createItinerary", async function (req, res) {
//   let itinerary = await itineraryModel.create({
//     name: "jamil",
//     destinations: "dhaka",
//     activities: "boat,hiking",
//     transportation_details: "car",
//     accommodation_details: "hmmmm",
//     user: req.userId,
//   });

//   res.send(itinerary);
// });

// Create a travel itinerary
router.post("/createItinerary", isAuthenticated, async (req, res) => {
  try {
    const user = await jwtModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newItinerary = await itineraryModel.create({
      ...req.body,
      user: user._id,
    });

    user.itineraries.push(newItinerary._id);
    await user.save();

    res.status(201).json(newItinerary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/:itineraryId", isAuthenticated, async (req, res) => {
  try {
    const updatedItinerary = await Itinerary.findOneAndUpdate(
      { _id: req.params.itineraryId, user: req.userId },
      { $set: req.body },
      { new: true }
    );

    if (!updatedItinerary) {
      return res
        .status(404)
        .json({ message: "Itinerary not found or unauthorized" });
    }

    res.status(200).json(updatedItinerary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/:itineraryId", isAuthenticated, async (req, res) => {
  try {
    const deletedItinerary = await Itinerary.findOneAndDelete({
      _id: req.params.itineraryId,
      user: req.userId,
    });

    if (!deletedItinerary) {
      return res
        .status(404)
        .json({ message: "Itinerary not found or unauthorized" });
    }

    res.status(200).json({ message: "Itinerary deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Retrieve list of itineraries for a user
router.get("/user", isAuthenticated, async (req, res) => {
  try {
    const userItineraries = await Itinerary.find({ user: req.userId });
    res.status(200).json(userItineraries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Retrieve details of a specific itinerary
router.get("/:itineraryId", isAuthenticated, async (req, res) => {
  try {
    const itineraryDetails = await Itinerary.findOne({
      _id: req.params.itineraryId,
      user: req.userId,
    });

    if (!itineraryDetails) {
      return res
        .status(404)
        .json({ message: "Itinerary not found or unauthorized" });
    }

    res.status(200).json(itineraryDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
