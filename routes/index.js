var express = require("express");
var router = express.Router();
const jwtModel = require("./users");
const itineraryModel = require("./itinerary");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const isAuthenticated = require("../auth/isAuthenticated");

dotenv.config();

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });

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

router.get("/allData", isAuthenticated, async function (req, res) {
  try {
    let allData = await jwtModel.findOne({
      username: "shah",
    });
    res.send(allData);
  } catch {
    res.status(401).json({
      error: "not authenticated..",
    });
  }
});

router.get("/createItinerary", async function (req, res) {
  let itinerary = await itineraryModel.create({
    name: "jamil",
    destinations: "dhaka",
    activities: "boat,hiking",
    transportation_details: "car",
    accommodation_details: "hmmmm",
  });

  res.send(itinerary);
});

module.exports = router;
