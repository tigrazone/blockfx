const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET_KEY;
const { check, validationResult } = require("express-validator");
const log = require("../../services/logger");
const User = require("../../models/User");
const notifier = require('../../services/notifier');

// @route   POST api/users
// @desc    Register user
// @access  Public

router.post(
  "/",
  [
    check("firstname", "Firstname is required")
      .not()
      .isEmpty(),
    check("lastname", "Lastname is required")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email")
      .isEmail()
      .not()
      .isEmpty(),
    check("phone", "Phone number is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      log.info("USERCreate | Validation errors");
      log.info(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstname, lastname, email, phone } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        log.info("USERCreate | User with this email found and will be deleted");
        user.delete();
      }

      user = new User({
        firstname,
        lastname,
        login: "temp_login_" + Math.random(),
        email,
        phone,
        approve: false
      });

      await user.save();

      log.info("USERCreate | Save new user: " + user.id);

      const payload = {
        data: {user: {
          id: user.id
        }}
      };

      const token = jwt.sign(payload, jwtSecret, { expiresIn: 360000 });

      log.info("USERCreate | generated token");

      res.json({ token });
    } catch (err) {
      log.error("USERCreate | Error with create user");
      notifier.push(error);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
