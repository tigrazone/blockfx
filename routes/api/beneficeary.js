const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET_KEY;
const { check, validationResult } = require("express-validator");
const notifier = require('../../services/notifier');

const User = require("../../models/User");
const Beneficeary = require("../../models/Beneficeary");

// @route GET api/beneficeary
// @desc Get user beneficearys
// @access Public

router.get("/", auth,
	async (req, res) => {
  try {
	const uid = req.user.id;
    const user = await User.findById(uid);
	if(user) {
		const beneficearys = await Beneficeary.find({uid});
		res.json(beneficearys);
	}
	else {
		return res.status(401).json({ errors: [{ msg: "Invalid Credentials" }] });
	}
  } catch (err) {
    notifier.push(err);
  	console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route GET api/beneficeary/:bid
// @desc Get user beneficearys
// @access Public

router.get("/:bid", auth,
	async (req, res) => {
		const bid = req.params.bid;
		console.log(bid);
		try {
			const uid = req.user.id;
			const user = await User.findById(uid);
			if(user) {
				const beneficearys = await Beneficeary.find({_id:bid, uid});
				if(!beneficearys.length){
					return res.status(404).json({ errors: [{ msg: "Beneficeary by this id for this user not found" }] });
				}

				res.json(beneficearys[0]);
			}
			else {
				return res.status(401).json({ errors: [{ msg: "Invalid Credentials" }] });
			}
		} catch (err) {
			notifier.push(err);
			console.error(err.message);
			res.status(500).send("Server Error");
		}
	});

// @route POST api/beneficeary
// @desc Add beneficeary to user
// @access Public

router.post(
  "/",
  [
	auth,
    check("beneficearyName")
      .isLength({min:1}).withMessage('Beneficeary name is required.')
	  .matches(/^[A-Za-z\s]+$/).withMessage('Beneficeary name must be alphabetic.'),
    check("beneficearyAddress")
      .isLength({min:1}).withMessage('Beneficeary address is required.')
	  .matches(/^[A-Za-z\s\.\,\/\d]+$/).withMessage('Beneficeary address have wrong characters.'),
    check("bankName")
      .isLength({min:1}).withMessage('Bank name is required.')
	  .matches(/^[A-Za-z\s]+$/).withMessage('Bank name must be alphabetic.'),
    check("bankAddress")
      .isLength({min:1}).withMessage('Bank address is required.')
	  .matches(/^[A-Za-z\s\.\,\/\d]+$/).withMessage('Bank address have wrong characters.'),
    check("IBAN")
      .isLength({min:1}).withMessage('IBAN is required.')
	  //.matches(/^[a-zA-Z]{2}[0-9]{2}\s?[a-zA-Z0-9]{4}\s?[0-9]{4}\s?[0-9]{3}([a-zA-Z0-9]\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,3})?$/).withMessage('Bank name have wrong characters.')
	  ,
    check("bankSwiftBICcode")
      .isLength({min:1}).withMessage('Swift/BIC code is required.')
	  //.matches(/^[a-zA-Z]{2}[0-9]{2}\s?[a-zA-Z0-9]{4}\s?[0-9]{4}\s?[0-9]{3}([a-zA-Z0-9]\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,3})?$/).withMessage('Bank name have wrong characters.')
	  ,
    check("bankCountry")
      .isLength({min:1}).withMessage('Bank country is required.')
	  .isAlpha().withMessage('Bank country must be alphabetic.'),
    check("currency")
      .isLength({min:1}).withMessage('Currency is required.')
	  .isAlpha().withMessage('Currency must be alphabetic.'),
    check("reference")
      .isLength({min:1}).withMessage('Reference is required.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { beneficearyName, beneficearyAddress, bankName, bankAddress, IBAN, bankSwiftBICcode, bankCountry, currency, reference } = req.body;
	const uid = req.user.id

    try {
      let beneficeary = await Beneficeary.findOne({ beneficearyName, bankName, bankAddress, IBAN, bankSwiftBICcode, bankCountry, currency, uid });

      if (beneficeary) {
        return res.status(400).json({ errors: [{ msg: "Beneficeary already exists" }] });
      }

      beneficeary = new Beneficeary({
        beneficearyName, beneficearyAddress,
		bankName,
        bankAddress,
        IBAN,
        bankSwiftBICcode,
        bankCountry,
        currency, reference,
		uid
      });

      let beneficeary1 = await beneficeary.save();
      res.json({ beneficeary: beneficeary1 });
    } catch (err) {
      notifier.push(err);
		console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route PUT api/beneficeary
// @desc Update beneficeary
// @access Public

router.put(
  "/",
  [
	auth,
    check("bid", "Beneficeary id is required")
      .not()
      .isEmpty(),
    check("beneficearyName")
      .isLength({min:1}).withMessage('Beneficeary name is required.')
	  .matches(/^[A-Za-z\s]+$/).withMessage('Beneficeary name must be alphabetic.'),
    check("beneficearyAddress")
      .isLength({min:1}).withMessage('Beneficeary address is required.')
	  .matches(/^[A-Za-z\s\.\,\/\d]+$/).withMessage('Beneficeary address have wrong characters.'),
    check("bankName")
      .isLength({min:1}).withMessage('Bank name is required.')
	  .matches(/^[A-Za-z\s]+$/).withMessage('Bank name must be alphabetic.'),
    check("bankAddress")
      .isLength({min:1}).withMessage('Bank address is required.')
	  .matches(/^[A-Za-z\s\.\,\/\d]+$/).withMessage('Bank address have wrong characters.'),
    check("IBAN")
      .isLength({min:1}).withMessage('IBAN is required.')
	  //.matches(/^[a-zA-Z]{2}[0-9]{2}\s?[a-zA-Z0-9]{4}\s?[0-9]{4}\s?[0-9]{3}([a-zA-Z0-9]\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,3})?$/).withMessage('Bank name have wrong characters.')
	  ,
    check("bankSwiftBICcode")
      .isLength({min:1}).withMessage('Swift/BIC code is required.')
	  //.matches(/^[a-zA-Z]{2}[0-9]{2}\s?[a-zA-Z0-9]{4}\s?[0-9]{4}\s?[0-9]{3}([a-zA-Z0-9]\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,4}\s?[a-zA-Z0-9]{0,3})?$/).withMessage('Bank name have wrong characters.')
	  ,
    check("bankCountry")
      .isLength({min:1}).withMessage('Bank country is required.')
	  .isAlpha().withMessage('Bank country must be alphabetic.'),
    check("currency")
      .isLength({min:1}).withMessage('Currency is required.')
	  .isAlpha().withMessage('Currency must be alphabetic.'),
    check("reference")
      .isLength({min:1}).withMessage('Reference is required.')
	  .isAlpha().withMessage('Reference must be alphabetic.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { beneficearyName, beneficearyAddress, bankName, bankAddress, IBAN, bankSwiftBICcode, bankCountry, currency, reference, bid } = req.body;
	const uid = req.user.id

    try {
      let beneficeary = await Beneficeary.findById(bid);

      if (beneficeary && beneficeary.uid == uid) {
        if(
			beneficeary.bankName != bankName ||
			beneficeary.bankAddress != bankAddress ||
			beneficeary.IBAN != IBAN ||
			beneficeary.bankSwiftBICcode != bankSwiftBICcode ||
			beneficeary.bankCountry != bankCountry ||
			beneficeary.currency != currency
		) { //check if same account not exists
			let accNotFound = true;
			let beneficearys = await Beneficeary.findOne({ bankName, bankAddress, IBAN, bankSwiftBICcode, bankCountry, currency, uid });
			if(beneficearys) {
				if(beneficearys.length>0) {
					let acc;
					for(acc in beneficearys) {
						if(acc._id !== bid) {
							accNotFound = false;
							break;
						}
					}
				}
			}

			if(accNotFound) {
			  beneficeary = {
				beneficearyName, beneficearyAddress,
				bankName,
				bankAddress,
				IBAN,
				bankSwiftBICcode,
				bankCountry,
				currency, reference,
				uid
			  };
			  let beneficeary1 = await Beneficeary.findByIdAndUpdate( bid, beneficeary, {new: false} );
			  res.json({ beneficeary: beneficeary1 });

			} else {
				return res.status(400).json({ errors: [{ msg: "Beneficeary already exists" }] });
			}

		}
		else {
			return res.status(400).json({ errors: [{ msg: "Beneficeary data not changed" }] });
		}
      }
	  else {
        return res.status(400).json({ errors: [{ msg: "Wrong beneficeary id" }] });

	  }
    } catch (err) {
      notifier.push(err);
		console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);




// @route POST api/beneficeary/blockchain
// @desc Add beneficeary blockchain to user
// @access Public

router.post(
  "/blockchain",
  [
	auth,
    check("bankName")
      .isLength({min:1}).withMessage('Bank name is required.')
	  .matches(/^[A-Za-z\s]+$/).withMessage('Bank name must be alphabetic.'),
    check("bankAddress")
      .isLength({min:1}).withMessage('Bank address is required.')
	  .matches(/^[A-Za-z\s\.\,\/\d]+$/).withMessage('Bank address have wrong characters.'),
    check("currency")
      .isLength({min:1}).withMessage('Currency is required.')
	  .isAlpha().withMessage('Currency must be alphabetic.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bankName, bankAddress, currency } = req.body;
	const uid = req.user.id

    try {
      let beneficeary = await Beneficeary.findOne({ bankName, bankAddress, currency, uid });

      if (beneficeary) {
        return res.status(400).json({ errors: [{ msg: "Beneficeary already exists" }] });
      }

      beneficeary = new Beneficeary({
        bankName,
        bankAddress,
        currency,
		uid
      });

      let beneficeary1 = await beneficeary.save();
      res.json({ beneficeary: beneficeary1 });
    } catch (err) {
      notifier.push(err);
		console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route POST api/beneficeary/blockchain
// @desc Update beneficeary blockchain
// @access Public

router.put(
  "/blockchain",
  [
	auth,
    check("bid", "Beneficeary id is required")
      .not()
      .isEmpty(),
    check("bankName")
      .isLength({min:1}).withMessage('Bank name is required.')
	  .matches(/^[A-Za-z\s]+$/).withMessage('Bank name must be alphabetic.'),
    check("bankAddress")
      .isLength({min:1}).withMessage('Bank address is required.')
	  .matches(/^[A-Za-z\s\.\,\/\d]+$/).withMessage('Bank address have wrong characters.'),
    check("currency")
      .isLength({min:1}).withMessage('Currency is required.')
	  .isAlpha().withMessage('Currency must be alphabetic.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bankName, bankAddress, currency, bid } = req.body;
	const uid = req.user.id

    try {
      let beneficeary = await Beneficeary.findById(bid);

      if (beneficeary && beneficeary.uid === uid) {
        if(
			beneficeary.bankName !== bankName ||
			beneficeary.bankAddress !== bankAddress ||
			beneficeary.currency !== currency
		) { //check if same account not exists
			let accNotFound = true;
			let beneficearys = await Beneficeary.findOne({ bankName, bankAddress, currency, uid });
			if(beneficearys) {
				if(beneficearys.length>0) {
					let acc;
					for(acc in beneficearys) {
						if(acc._id !== bid) {
							accNotFound = false;
							break;
						}
					}
				}
			}

			if(accNotFound) {
			  beneficeary = {
				bankName,
				bankAddress,
				currency,
				uid
			  };
			  let beneficeary1 = await Beneficeary.findByIdAndUpdate( bid, beneficeary, {new: false} );
			  res.json({ beneficeary: beneficeary1 });

			} else {
				return res.status(400).json({ errors: [{ msg: "Beneficeary already exists" }] });
			}

		}
		else {
			return res.status(400).json({ errors: [{ msg: "Beneficeary data not changed" }] });
		}
      }
	  else {
        return res.status(400).json({ errors: [{ msg: "Wrong beneficeary id" }] });

	  }
    } catch (err) {
      notifier.push(err);
		console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);


// @route GET api/beneficeary/:pid
// @desc Delete beneficeary
// @access Public

router.delete("/:bid", auth,
	async (req, res) => {
	const bid = req.params.bid
	console.log('bid='+bid);
  try {
	const uid = req.user.id;
    const user = await User.findById(uid);
	if(user) {
		const beneficeary = await Beneficeary.findOneAndRemove({uid, _id:bid});
		if(!beneficeary) {
			return res.status(404).json({ errors: [{ msg: "Wrong beneficeary id" }] });
		}
		else {
				res.status(200).json({
				  message: 'deleted'
				})
		}
	}
	else {
		return res.status(401).json({ errors: [{ msg: "Invalid Credentials" }] });
	}
  } catch (err) {
    notifier.push(err);
  	console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
