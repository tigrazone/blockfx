const express = require("express");
const router = express.Router();
const passwordService = require("../../services/password");
const { check, validationResult } = require("express-validator");
const log = require("../../services/logger");
const User = require("../../models/User");
const SalesForce = require("../../services/salesforce");


// @route   POST api/change_password
// @desc    Ask for email with recovery password link
// @access  Public

router.post(
  "/",
  [
    check("email", "Please include a valid email")
      .isEmail()
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      log.info("USER password recovery | Validation errors");
      log.info(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        log.info("USER password recovery | User with this email not exists");
		res.status(500).send("Server error");
      }
	  
	  user.recovery_code = passwordService.generateRandomCode();
	  let user1 = await User.findByIdAndUpdate( user._id, user, {new: false} );
	
	  //send email by salesforce
	  await SalesForce.resetPassword(user, process.env.BASE_BACK_URL + 'api/change_password/'+user.recovery_code);
	
	  return res.status(200).json({ code: user.recovery_code });
    } catch (err) {
      log.warn("USER password recovery | Error with create user");
      log.warn(err);
      res.status(500).send("Server error");
    }
  }
);


// @route   POST api/change_password/:recovery_code
// @desc    Change password for user
// @access  Public

router.post(
  "/:recovery_code",
  [
    check("password", "Password is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      log.info("USER password recovery | Validation errors");
      log.info(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;
	
	const recovery_code = req.params.recovery_code

    try {
      let user = await User.findOne({ recovery_code });

      if (!user) {
        log.info("USER password recovery | User with this recovery code not exists or wrong recovery code");
		res.status(500).send("Server error");
      }
	  
	  user.password = passwordService.generateHash(password);
	  user.recovery_code = null
	  
	  let user1 = await User.findByIdAndUpdate( user._id, user, {new: false} );
	  res.json({ user: user1 });
    } catch (err) {
      log.warn("USER password recovery | Error with create user");
      log.warn(err);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
