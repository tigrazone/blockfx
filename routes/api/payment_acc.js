const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET_KEY;
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
const PaymentAcc = require("../../models/PaymentAcc");
const notifier = require('../../services/notifier');

// @route GET api/payment_acc
// @desc Get user payment accounts
// @access Public

router.get("/", auth, 
	async (req, res) => {
  try {
	const uid = req.user.id; 
    const user = await User.findById(uid);
	if(user) {
		const paymentAccs = await PaymentAcc.find({uid});
		res.json(paymentAccs);
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

// @route GET api/payment_acc/:pid
// @desc Get user payment account by id
// @access Public

router.get("/:pid", auth,
	async (req, res) => {
		const pid = req.params.pid;
		try {
			const uid = req.user.id;
			const user = await User.findById(uid);
			if(!user) {
				return res.status(401).json({ errors: [{ msg: "Invalid Credentials" }] });
			}
			console.log(pid);
			const paymentAccs = await PaymentAcc.find({_id: pid, uid});
			if(!paymentAccs.length){
				return res.status(404).json({ errors: [{ msg: "Payment account by this id not found" }] });
			}

			res.json(paymentAccs[0]);
		} catch (err) {
			notifier.push(err);
			console.error(err.message);
			res.status(500).send("Server Error");
		}
	});

// @route POST api/payment_acc
// @desc Add payment account to user
// @access Public

router.post(
  "/",
  [
	auth,
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
	  .isAlpha().withMessage('Currency must be alphabetic.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bankName, bankAddress, IBAN, bankSwiftBICcode, bankCountry, currency } = req.body;
	const uid = req.user.id;

    try {
      let paymentAcc = await PaymentAcc.findOne({ bankName, bankAddress, IBAN, bankSwiftBICcode, bankCountry, currency, uid });

      if (paymentAcc) {
        return res.status(400).json({ errors: [{ msg: "Payment account with this data already exists" }] });
      }

      paymentAcc = new PaymentAcc({
        bankName,
        bankAddress,
		  IBAN,
        bankSwiftBICcode,
        bankCountry,
        currency,
		uid
      });

      let paymentAcc1 = await paymentAcc.save();
      res.json(paymentAcc1);
    } catch (err) {
      console.error(err.message);
      notifier.push(err);
      res.status(500).send("Server error");
    }
  }
);

// @route PUT api/payment_acc
// @desc Update payment account
// @access Public

router.put(
  "/",
  [
	auth,
    check("pid", "Payment account id is required")
      .not()
      .isEmpty(),
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
	  .isAlpha().withMessage('Currency must be alphabetic.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bankName, bankAddress, IBAN, bankSwiftBICcode, bankCountry, currency, pid } = req.body;
	const uid = req.user.id

    try {
      let paymentAcc = await PaymentAcc.findById(pid);

      if (paymentAcc && paymentAcc.uid == uid) {
        if(
			paymentAcc.bankName != bankName ||
			paymentAcc.bankAddress != bankAddress ||
			paymentAcc.IBAN != IBAN ||
			paymentAcc.bankSwiftBICcode != bankSwiftBICcode ||
			paymentAcc.bankCountry != bankCountry ||
			paymentAcc.currency != currency
		) { //check if same account not exists
			let accNotFound = true;
			let paymentAccs = await PaymentAcc.findOne({ bankName, bankAddress, IBAN, bankSwiftBICcode, bankCountry, currency, uid });
			if(paymentAccs) {
				if(paymentAccs.length>0) {
					let acc;
					for(acc in paymentAccs) {
						if(acc._id !== pid) {
							accNotFound = false;
							break;
						}
					}
				}
			}
			
			if(accNotFound) {
			  paymentAcc = {
				bankName,
				bankAddress,
				IBAN,
				bankSwiftBICcode,
				bankCountry,
				currency,
				uid
			  };
			  
			  let paymentAcc1 = await PaymentAcc.findByIdAndUpdate( pid, paymentAcc, {new: false} );
			  res.json({ paymentAcc: paymentAcc1 });
				
			} else {
				return res.status(400).json({ errors: [{ msg: "Payment account already exists" }] });
			}
			
		}
		else {
			return res.status(400).json({ errors: [{ msg: "Payment account data not changed" }] });
		}
      }
	  else {
        return res.status(400).json({ errors: [{ msg: "Wrong payment account id" }] });
		  
	  }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);


// @route DELETE api/payment_acc/:pid
// @desc Delete payment account
// @access Public

router.delete("/:pid", auth,
	async (req, res) => {
	const pid = req.params.pid	
  try {
	const uid = req.user.id; 
    const user = await User.findById(uid);
	if(user) {
		const paymentAcc = await PaymentAcc.findOneAndRemove({uid, _id:pid});
		if(!paymentAcc) {
			return res.status(404).json({ errors: [{ msg: "Wrong payment account id" }] });
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
    console.error(err.message);
    notifier.push(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
