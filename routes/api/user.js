const express = require("express");
const router = express.Router();
const passwordService = require("../../services/password");
const { check, validationResult } = require("express-validator");
const log = require("../../services/logger");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const notifier = require('../../services/notifier');
const SalesForce = require("../../services/salesforce");

async function validatePassword(password, user){
    const isMatch = await passwordService.checkPassword(password, user.password);

    if(isMatch){
        return [];
    }

    const error = {
        location: 'body',
        msg: 'Password not valid',
        param: 'password',
        value: password
    };

    return [error];
}

// @route   POST api/user/me
// @desc    Return current user
// @access  Protected

router.get('/me', [auth], async (req, res) => {
    try {
        let user = await User.findById(req.user.id);

        if (!user) {
            log.info("Get current user | Cannot find user by id");
            res.status(401).send("Invalid Credentials");
        }

        user = user.toObject();

        delete user.password;
        delete user.new_email;
        delete user.email_change_code;
        delete user.recovery_code;
        delete user.salesForceContactId;
        delete user.__v;

        return res.status(200).json(user);
    } catch (err) {
        log.warn("Get current user | Error with get user");
        log.warn(err);
        res.status(500).send("Server error");
    }
});

// @route   PUT api/user/password
// @desc    Check password and change password for current user
// @access  Protected
router.put('/password', [
    auth,
    check("password", "Password is required")
        .not()
        .isEmpty(),
    check("newPassword", "New password is required")
        .not()
        .isEmpty()
], async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            log.info("Change password | Cannot find user by id");
            res.status(401).send("Invalid Credentials");
        }

        let errors = validationResult(req);

        if(errors.isEmpty()){
            errors = validatePassword(req.body.password, user);
        }

        if (!errors.isEmpty()) {
            log.info("Change password | Validation errors");
            log.info(errors);
            return res.status(400).json({ errors: errors.array() });
        }

        user.password = await passwordService.generateHash(req.body.newPassword);

        await user.save();

        return res.status(204);
    } catch (err) {
        log.warn("Change password | Error with change user password");
        notifier.push(err);
        res.status(500).send("Server error");
    }
});

// @route   POST api/user/email
// @desc    Check password and send letter for check new email
// @access  Protected
router.post('/email', [
    auth,
    check("email", "New email is required")
        .isEmail()
], async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            log.info("Request change email | Cannot find user by id");
            res.status(401).send("Invalid Credentials");
        }

        let errors = validationResult(req);

        if(errors.isEmpty()){
            errors = validatePassword(req.body.newPassword, user);
        }

        if (!errors.isEmpty()) {
            log.info("Request change email | Validation errors");
            log.info(errors);
            return res.status(400).json({ errors: errors.array() });
        }

        const code = passwordService.generateRandomCode();

        const newEmail = req.body.email;

        user.email_change_code = code;
        user.new_email = newEmail;

        const link = process.env.BASE_FRONT_URL + 'update_email/' + code;

        await SalesForce.requestChangeEmail(user, newEmail, link);

        return res.status(204);
    } catch (err) {
        log.warn("Request change email | Error with request change user email");
        notifier.push(err);
        return res.status(500).send("Server error");
    }
});

// @route   PUT api/user/email/code/:code
// @desc    Check password and send letter for check new email
// @access  Public
router.put('/email/code/:code', async (req, res) => {
    try {

        const {code} = req.params;

        if (!code || code.length < 1) {
            log.info("Change email | Cannot find code param");
            return res.status(400).send({
                errors: [
                    {
                        location: 'parameters',
                        msg: 'Code is required',
                        param: 'code',
                        value: undefined
                    }
                ]
            });
        }

        const user = await User.find({
            email_change_code: code
        });

        if (!user) {
            log.info("Change email | Cannot find user by code");
            return res.status(404).send("Code not found");
        }

        user.email = user.new_email;

        user.email_change_code = null;
        user.new_email = null;


        SalesForce.updateContact(user).then(() => {
            return res.status(200).json({ user: user1 });
        }).catch((error) => {
            if(error && error.errorCode){
                    return res.status(400).send('SalesForce error: ' + error.errorCode);
            }
        });
		
    } catch (err) {
        log.warn("Change email | Error with change user email");
        notifier.push(err);
        res.status(500).send("Server error");
    }
});
module.exports = router;
