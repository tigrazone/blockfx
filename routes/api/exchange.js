const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const {check, validationResult} = require("express-validator");
const log = require("../../services/logger");

const User = require("../../models/User");
const PaymentAcc = require("../../models/PaymentAcc");
const Beneficeary = require("../../models/Beneficeary");
const History = require("../../models/History");
const Order = require("../../models/Order");

const SalesForce = require("../../services/salesforce");


const ccxt = require('ccxt');


// @route   POST api/exchange
// @desc    Ask for email with recovery password link
// @access  Public

router.post(
    "/",
    [
        auth,
        check("currency_from", "currency_from is required")
            .not()
            .isEmpty(),
        check("currency_to", "currency_to is required")
            .not()
            .isEmpty(),
        check("amount", "Amount is required")
            .not()
            .isEmpty(),
        check("payment_acc_id", "Payment account id is required")
            .not()
            .isEmpty(),
        check("beneficeary_id", "Beneficeary id is required")
            .not()
            .isEmpty(),
        check("exchangeRate", "Exchange rate is required")
            .not()
            .isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            log.info("EXCHANGE | Validation errors");
            log.info(errors);
            return res.status(400).json({errors: errors.array()});
        }

        const {currency_from, currency_to, amount, payment_acc_id, beneficeary_id, exchangeRate} = req.body;

        try {
            const payment_acc = await PaymentAcc.find({uid: req.user.id, id: payment_acc_id, currency: currency_from});
            if (!payment_acc) {
                return res.status(400).json({errors: [{msg: "Wrong payment account id"}]});
            }

            const beneficeary = await Beneficeary.find({uid: req.user.id, id: beneficeary_id, currency: currency_to});
            if (!beneficeary) {
                return res.status(400).json({errors: [{msg: "Wrong beneficeary id"}]});
            }

            if (currency_to != 'GBP' && currency_to != 'EUR') {
                //buy bitcoins on Kraken
                const kraken = new ccxt.kraken({
                    apiKey: process.env.KRAKEN_API_PUBLIC_KEY,
                    secret: process.env.KRAKEN_API_PRIVATE_KEY
                });

                console.log(await kraken.createMarketSellOrder(currency_to + "/" + currency_from, amount / exchangeRate));

            }

            const order = {
                buyCurrency: currency_to,
                saleCurrency: currency_from,
                buyAmount: amount,
                exchangeRate: exchangeRate,
                payment_acc_id: payment_acc_id,
                beneficeary_id: beneficeary_id
            };

            //send order to salesforce
            const salesForceOrderId = await SalesForce.createOrder(
                order,
                payment_acc,
                beneficeary,
                req.user.salesForceContactId
            );

            let event = new History({
                type: 'order',
                message: 'create order',
                status: 'create',
                uid: req.user.id,
                ev_id: salesForceOrderId
            });
            await event.save();

            order.salesForceOrderId = salesForceOrderId;
            order.uid = req.user.id;

            //store order to mongo
            let order_mongo = new Order(order);
            await order_mongo.save();

            return res.status(200).json(order);
        } catch (err) {
            log.warn("EXCHANGE | Error with create order");
            log.warn(err);
            res.status(500).send("Server error");
        }
    }
);

module.exports = router;