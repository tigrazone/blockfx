const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const log = require("../../services/logger");
const mailer = require('../../services/mailer');
const notifier = require('../../services/notifier');


// @route   POST api/supercx-contact/simple-form
// @desc    Send simple email from form on supercx.
// @access  Public

router.post(
    "/simple-form",
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
        check("website", "Website number is required")
            .not()
            .isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            log.info("SUPERCx contact | Validation errors");
            log.info(errors);
            return res.status(400).json({ errors: errors.array() });
        }

        let text = `Fullname: ${req.body.fullname}\nCompany: ${req.body.company}\n`
            +`Email: ${req.body.email}\nWebsite: ${req.body.website}\n`;

        if (req.body.message) {
            text += `Message: ${req.body.message}\n`
        }

        mailer.sendMailToAdmin('Super CX Platform Contact Letter', text, (err, info) => {
            if(info && info.accepted && info.accepted[0] && info.accepted[0] === 'info@super.cx'){
                log.info('mail sent');
                res.status(201).send('Email sent.');
            }
            else{
                log.error('!mail sending error:');
                notifier.push(err);
                log.error('!mail sending info:');
                log.error(info);
                res.status(500).send('By some reason email not sent');
            }
        });

    }
);

module.exports = router;