const sha256 = require('js-sha256');
const axios = require('axios');
const fs = require('fs');
const log = require("../services/logger.js");

module.exports = class ShuftiPro {

    constructor (callbackUrl) {
        this.token = "ZmNkYmI5YjA1N2RkN2MzMWU0N2IzMGQ3MmUzNWM3NTBkZjBjZjAxZTMyYTc4YTIzMDk3ZmIxZGQ1ZTNhMDQ5YTpDY003T2U2UmNqMkNvbUxabHpJd0hodG5Cd3pnZnA5TA";
        this.basePayload = {
            //URL where you will receive the webhooks from Shufti Pro
            "callback_url"				 : callbackUrl,
            //end-user country
            "country"						 : "",
            //what kind of proofs will be provided to Shufti Pro for verification?
            "verification_mode"		 : "image_only",
            //allow end-user to upload verification proofs if the webcam is not accessible
            "allow_offline"				 : "1",
            //privacy policy screen will be shown to end-user
            "show_privacy_policy" : "1",
            //verification results screen will be shown to end-user
            "show_results"				 : "1",
            //consent screen will be shown to end-user
            "show_consent"			 : "1"
        }
    }

    getBase64FromFile(file){
        const path = "./"+file;
        return fs.readFileSync(path).toString('base64');
    }

    async validate (user, proofs) {
        const {passport, selfie} = proofs;

        const email = user.email, firstName = user.firstname, lastName = user.lastname;
        const name = {first_name: firstName, last_name: lastName};
        let responseSignature = null;
        let payload = {...this.basePayload};


        payload.email = email;
        payload.reference = `SP_REQUEST_${Math.random()}`;
        payload.document_two = {
            name,
            proof				: this.getBase64FromFile(passport),
            additional_proof    : this.getBase64FromFile(selfie),
            supported_types		: ['id_card','passport']
        };

        log.info(payload);

        return axios.post('https://shuftipro.com/api/', JSON.stringify(payload), {
            headers : {
                'Accept'		: 'application/json',
                'Content-Type'	: 'application/json',
                'Authorization'	: 'Basic ' + this.token
            }
        }).then(function(response)
        {
            log.info(response.data);
            responseSignature = response.headers.signature;
            return response.data;
        }).then(function(data) {
            if(ShuftiPro._validateSignature(data, responseSignature,'CcM7Oe6Rcj2ComLZlzIwHhtnBwzgfp9L')) {
                log.info(data.event);
                return (data.event === 'verification.accepted');
            }
            return false;
        }).catch((error) => {
            log.info(error);
            console.log(error);
        })
    }
    static _validateSignature(data,signature,SK){
        data = JSON.stringify(data);
        data = data.replace(/\//g,"\\/")
        data = `${data}${SK}`;

        sha256(data);
        const hash = sha256.create();
        hash.update(data);

        return (hash.hex() === signature);
    }
};