const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const Order = require("../../models/Order");
const notifier = require('../../services/notifier');

// @route   GET api/history
// @desc    Get orders for user
// @access  Public

router.get("/", auth, async (req, res) => {
        try {
            const uid = req.user.id;
            const user = await User.findById(uid);

            if(!user) {
              return res.status(401).json({ errors: [{ msg: "Invalid Credentials" }] });
            }

            const search = {uid};

            if(req.body.from && req.body.to){
              search.date = {
                "$gte": Date.parse(req.body.from),
                "$lt": Date.parse(req.body.to)
              }
            }

            if(req.body.status){
              search.status = req.body.status;
            }

            let findPromise = Order.find(search, null, { sort: { date: -1 } })
                                     .limit(parseInt(process.env.LIST_LIMIT));
            if(req.body.offset){
                const offset = req.body.offset * 1;
                findPromise = findPromise.skip(offset);
            }

            res.json(await findPromise);
        } catch (err) {
            notifier.push(err);
            res.status(500).send("Server Error");
        }
});



// @route   POST api/history
// @desc    Add event to history
// @access  Public

router.post(
  "/",
  [
    check("type", "Event type is required")
      .not()
      .isEmpty(),
    check("message", "Message is required")
      .not()
      .isEmpty(),
    check("uid", "User id is required")
      .not()
      .isEmpty(),
    check("security_token", "Token is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, message, status, uid, security_token, ev_id } = req.body;

    //check token
	
	let user = await User.find({id: uid, salesForceContactId: security_token});	
	if(!user) {
		return res.status(401).json({ errors: [{ msg: "Invalid Credentials" }] });
	}

    try {
      let event = new History({ type, message, status, uid, ev_id });
	  
	  if(status == 'completed') {
		  //generate pdf
		  //send to Google disk
		  //send to QuickBooks
	  }

      let history_record = await event.save();
      res.json({ history: history_record });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
