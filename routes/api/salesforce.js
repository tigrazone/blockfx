const express = require("express");
const router = express.Router();
const User = require('../../models/User');
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const log = require("../../services/logger.js");
const SALESFORCE_SECURITY_TOKEN = 'LMzsJzn5o5nnydBwtB7j7PUZGpnH8eV6PIbvKlesGgpvnD3U8YuLr05WC4UaLoKB3uh5DZxLWb2FDfAjcgVk0A5wuhZRK0nJXHkJ';
const History = require("../../models/History");
const notifier = require('../../services/notifier');

// @route   PUT api/salesforce/user
// @desc    Create salesforce login and password
// @access  Protected

router.put("/user",[
    body("mongo_id", "mongo_id is required")
        .not()
        .isEmpty(),
    body("salesforce_id", "salesforce_id is required")
        .not()
        .isEmpty(),
    body("login", "Login is required")
        .not()
        .isEmpty(),
    body("password", "Password is required")
        .not()
        .isEmpty(),
    body("security_token", "security_token is required")
        .not()
        .isEmpty()
], async (request, res, error) => {
    log.info("Salesforce: user - update body:");
    log.info(request.body);
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        log.info("SalesForce 400 validation errors:");
        log.info(errors.array());

        return res.status(400).json({ errors: errors.array() });
    }
    const {mongo_id, salesforce_id, login, password, security_token} = request.body;
    if(security_token !== SALESFORCE_SECURITY_TOKEN){
        notifier.push("SalesForce | Invalid token");
        log.info("SalesForce 403 Invalid token");
        return res.status(403).json({ msg: "Invalid token" });
    }

    const user = await User.findById(mongo_id);
    if(!user){
        notifier.push("SalesForce | User not found in mongo");
        log.info("SalesForce 404 User not found in mongo id:" + mongo_id);
        return res.status(404).json({ msg: "User not found in mongo" });
    }

    if(user.approve){
        log.info("SalesForce 400 User approved yet:" + mongo_id);
        return res.status(400).json({ msg: "User approved yet" });
    }

    if(user.salesForceContactId !== salesforce_id){
        log.warn("SalesForce ? Changed sales force ID "+salesforce_id);
        user.salesForceContactId = salesforce_id;
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hashSync(password, salt);

    log.info(user.password);

    user.login = login;
    user.approve = 1;

    user.save();
    log.info("SalesForce 204 User approved and saved");

    return res.status(204).json({ msg: "User updated!" });

});

// @route   PUT api/salesforce/order
// @desc    Add to history with order completed record
// @access  Protected

router.put("/order",[
    body("order_id", "order_id is required")
        .not()
        .isEmpty(),
    body("contact_id", "contact_id is required")
        .not()
        .isEmpty(),
    body("security_token", "security_token is required")
        .not()
        .isEmpty(),
    body("status", "status is required")
        .not()
        .isEmpty()
], async (request, res, error) => {
    log.info("SalesForce order - completed");
    log.info(request.body);
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        log.info("SalesForce 400 validation errors:");
        log.info(errors.array());

        return res.status(400).json({ errors: errors.array() });
    }

    log.info("validation - ok");

    const {contact_id, order_id, security_token, status} = request.body;
    log.info("salesforce - request body:");
    log.info(request.body);

    if(security_token !== SALESFORCE_SECURITY_TOKEN){
        log.info("SalesForce 403 Invalid token");
        notifier.push("SalesForce | Invalid token");
        return res.status(403).json({ msg: "Invalid token" });
    }

    if(status !== 'completed' && status !== 'canceled'){
        const msg = "Not valid status from salesforce for order";
        notifier.push("SalesForce | " + msg);
        return res.status(400).json({ errors: [{ msg }] });
    }

    //check user id
    const user = await User.find({salesForceContactId: contact_id});

    if(!user) {
        const msg = "User by this contact id not found";
        notifier.push("SalesForce | " + msg);
        return res.status(404).json({ errors: [{ msg }] });
    }

    log.info("token - ok");

    try {
        const order = await Order.findOne({
            salesForceOrderId: order_id
        });

        if(!order){
            const msg = "Order by this order id not found";
            notifier.push("SalesForce | " + msg);
            return res.status(404).json({ errors: [{ msg }] });
        }
        order.status = status;
        await order.save();

        let event = new History({
            type: "order_" + status,
            message: "Order new status " + status + " by administration.",
            uid: user.id,
            ev_id: order_id
        });

        await event.save();
        log.info("create history - ok");

        log.info("response - 201");
        return res.status(204).json({ msg: "Order updated!" });
    } catch (err) {
        notifier.push(err);
        console.error(err.message);
        log.err(err);
        log.info("response - 500");
        res.status(500).send("Server error");
    }

});

module.exports = router;