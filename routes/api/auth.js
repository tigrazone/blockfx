const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET_KEY;
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const notifier = require('../../services/notifier');

// @route GET api/auth
// @desc Get user route
// @access Public

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    notifier.push(err);
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route POST api/auth
// @desc Authenticate user & get token
// @access Public

router.post(
  "/",
  [check("login", "Please include a valid login").exists(), check("password", "Password is required").exists()],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { login, password } = req.body;

    try {
      let user = await User.findOne({ login });

      const isMatch = user && await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
        notifier.push(err);
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
