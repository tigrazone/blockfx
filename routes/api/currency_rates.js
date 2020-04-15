const util = require("util");
const request = require("request");
const express = require("express");
const auth = require("../../middleware/auth");
const router = express.Router();


// @route   GET api/currency_rates
// @desc    Get currency rates
// @access  Public

router.get("/", auth, async (req, res) => {
	  let ok;
	  
	  //get assert pairs
	  const requestPromise = util.promisify(request);
	  let response = await requestPromise('https://api.kraken.com/0/public/AssetPairs');

	if (response.err) {
		console.log('response error', response.err);
		return res.status(500).send("Server error");
	}
	//console.log('response', response.body);
	let pairs = {}
	let currency_rate = {}
	let keys = ''
	const resp = JSON.parse(response.body)
	const resp_body = resp.result
	console.log('resp_body', resp_body);
	for(let key in resp_body) {
		let item = resp_body[key]
		//console.log('key', key)
		//console.log('item', item)

		ok = true
		if(item['base'].charAt(0) == 'Z') {
			if(item.base != 'ZEUR' && item.base != 'ZGBP') {
				ok=false
			}
		}

		if(item['quote'].charAt(0) == 'Z') {
			if(item.quote != 'ZEUR' && item.quote != 'ZGBP') {
				ok=false
			}
		}

		if(ok) {
			let obj = {};
			if(item.wsname == undefined) {
				obj[key]=item['base'].substr(1)+'/'+item['quote'].substr(1)
			}
			else {
				obj[key]=item.wsname
			}
			pairs[key]=obj[key]
			if(keys.length) keys +=','
			keys += key
		}
	}

	//console.log('pairs', pairs);
	// https://api.kraken.com/0/public/Ticker?pair=

	response = await requestPromise('https://api.kraken.com/0/public/Ticker?pair='+keys);

	if (response.err) {
		console.log('response error', response.err);
		return res.status(500).send("Server error");
	}
	const resp1 = JSON.parse(response.body)
	const resp_body1 = resp1.result
	//console.log('resp_body1', resp_body1);
	for(let key in resp_body1) {
		currency_rate[key] = resp_body1[key]['o']
	}

	//console.log('currency_rate', currency_rate);

	response = await requestPromise('https://currencydatafeed.com/api/data.php?token=hu6dcw50mtii3fn5efm7&currency=EUR/GBP+GBP/EUR');

	if (response.err) {
		console.log('response error', response.err);
		return res.status(500).send("Server error");
	}

	//console.log('response.body', response.body)
	const resp2 = JSON.parse(response.body)
	//console.log('resp2', resp2)
	resp2.currency.forEach((item) => {
		const ticker = item.currency.replace('/','');
		pairs[ticker] = item.currency;
		currency_rate[ticker] = item.value;
		});

	console.log('pairs', pairs);
	console.log('currency_rate', currency_rate);
	return res.status(200).json({ pairs, currency_rate });
  });

module.exports = router;
