const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();
const SimpleCacheRecord = require('../../services/simple-cache');
const axios = require('axios');
const notifier = require('../../services/notifier');

const TOP_CURRENCIES_PAIRS = [
    'BTC/USD',
    'ETH/USD',
];//TODO: Add pairs from currencydatafeed.com

const currencydatafeed = {
    _baseUrl: 'https://currencydatafeed.com/api/data.php',
    _token: 'xrpqkeol9lia7xnmc3xo',
    getDataByCurrencies: async (currencies) => {
        const self = currencydatafeed;
        const url = self._baseUrl + '?token=' + self._token + '&currency=' + currencies.join('+');

        const response = await axios.get(url);

        if(
            !response.data ||
            !response.data.status ||
            !response.data.currency ||
            response.data.currency.length < currencies.length
        ){
            throw Error('Not correct currencydatafeed.com response data');
        }
        let i = 0;

        return response.data.currency.map((dataCurrency) => {
            const res = {...dataCurrency, name: currencies[i]};
            i++;
            return res;
        });
    }
};


const cacheTopCurrenciesResponse = new SimpleCacheRecord(10 * 60, async () => {
    return await currencydatafeed.getDataByCurrencies(TOP_CURRENCIES_PAIRS);
});

// @route   GET api/top-currencies
// @desc    Get currency rates
// @access  Protected
router.get("/", auth, async (req, res) => {

    let currencies = [];
    try {
        currencies = await cacheTopCurrenciesResponse.getOrFetch();
    }
    catch (e) {
        notifier.push(e);
        return res.status(500).send("Server error");
    }


    const responseData = currencies.map((currency) => {
        const {pair, value, change_percent, name} = currency;

        return {pair, value, change_percent, name};
    });

    return res.status(200).json(responseData);
});

module.exports = router;
