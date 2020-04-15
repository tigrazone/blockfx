const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const log = require("../../services/logger");
const User = require("../../models/User");
const SalesForce = require("../../services/salesforce");


// @route   POST api/update_user_data
// @desc    Update user data
// @access  Public

router.post(
  "/",
  [
    auth,
    check("firstname", "Firstname is required")
      .not()
      .isEmpty(),
    check("lastname", "Lastname is required")
      .not()
      .isEmpty(),
    check("phone", "Phone number is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      log.info("Update user data | Validation errors");
      log.info(errors);
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { firstname, lastname, phone } = req.body;

    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        log.info("Update user data | Unknown User");
		res.status(500).send("Server error");
      }
	  
	  user.firstname = firstname
	  user.lastname = lastname
	  user.phone = phone
	  
	  let user1 = await User.findByIdAndUpdate( user._id, user, {new: false} );
	
	  //send user data by salesforce
	  SalesForce.updateContact(user1).then(() => {
            return res.status(200).json({ user: user1 });
        }).catch((error) => {
            if(error && error.errorCode){
                    return res.status(400).send('SalesForce error: ' + error.errorCode);
            }
        });	
	  
    } catch (err) {
      log.warn("USER password recovery | Error with create user");
      log.warn(err);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
