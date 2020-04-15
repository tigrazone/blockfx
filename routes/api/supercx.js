const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const log = require("../../services/logger");
const SalesForce = require("../../services/salesforce");
const notifier = require('../../services/notifier');

// @route   POST api/supercx/
// @desc    Create some entity in salesforce (WIP)
// @access  Public

router.post(
    "/",
    [
        check("fullname", "Fullname is required")
            .not()
            .isEmpty(),
        check("company", "Company is required")
            .not()
            .isEmpty(),
        check("email", "Please include a valid email")
            .isEmail()
            .not()
            .isEmpty(),
        check("country", "Country is required")
            .not()
            .isEmpty(),
        check("type", "Type of business number is required")
            .not()
            .isEmpty(),
        check("website", "Website number is required")
            .not()
            .isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            log.info("SUPERCx | Validation errors");
            log.info(errors);
            return res.status(400).json({ errors: errors.array() });
        }
        SalesForce.createLead(req.body).then(() => {
            res.status(201).send();
        }).catch((error) => {
            if(error && error.errorCode){
                if(error.errorCode === 'DUPLICATES_DETECTED'){
                    return res.status(400).send('DUPLICATES_DETECTED');
                }
            }
            notifier.push(error);
            return res.status(500).send();
        });
    }
);

module.exports = router;