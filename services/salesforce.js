const jsforce = require('jsforce');
const log = require('./logger');

//TODO: Validation error for salesforce (Example >> DUPLICATE_ERROR)
class SalesForceAdapter {
    constructor() {
        this._options = {
            serverUrl: "https://eu32.salesforce.com.",
            clientId: "3MVG9tzQRhEbH_K3Ggqh2YXpC8gVgyvS1yMKejc.Vd49FKb_QYJHgkFtn._lpXAzdvIYrpIXu2W8Udv9ljasy",
            clientSecret: "6ACE2D58EE95BF82094D3807F5EB91E213738790EA74931AAB31AE5A40E7C5B6",
        };

        this._username = 'developer.marshak@gmail.com';
        this._password = 'DevSam42TURYddI29SglIj9lqtP0WAv5V';
        this.connect = new jsforce.Connection(this._options);
        this._connected = false;
    }

    async login() {
        if(!this._connected){
            log.info("Salesforce not connected. Try auth and connect.");
            return this.connect.login(this._username, this._password).then(() => {
                this._connected = true;
                log.info("Salesforce auth: success and connected.");
            });
        }
    }

    async updateContact(user) {
        const salesForceId = user.salesForceContactId;

        if(!salesForceId){
            log.error("updateContact: Cannot make update request without salesForceContactId");
            throw "updateContact: Cannot make update request without salesForceContactId";
        }

        const contact = {
            Phone: user.phone,
            Email: user.email,
            Mongo_ID__c: user.id
        };

        await this.login();

        SalesForceAdapter._logInput('update contact --user--', user);

        SalesForceAdapter._logInput('update contact --contact--', contact);

        const result = await this.connect.sobject('Contact').findOne({ Id : salesForceId }).update(contact);

        SalesForceAdapter._logResult('update contact', result);

        return result.length > 0 && result[0].success;
    }

    async resetPassword(user, resetLink) {
        const request = {
            id: user.salesForceContactId,
            link: resetLink
        };

        return this._restPatchApexBooleanRequest(request, 'ContactPassword', 'reset password');
    }

    async requestChangeEmail(user, email, changeLink) {
        const request = {
            id: user.salesForceContactId,
            email,
            link: changeLink
        };

        return this._restPatchApexBooleanRequest(request, 'ContactEmail', 'change email');
    }

    async createContact(user) {
        const contact = {
            FirstName: user.firstname,
            LastName: user.lastname + " Internal ID: "+user.id,
            Phone: user.phone,
            Email: user.email,
            Mongo_ID__c: user.id
        };

        return this._createEntityWithIdResponse(contact, 'Contact', 'create contact');
    }

    async createLead(lead) {
        const sfLead = {
            LastName: lead.fullname,
            Phone: lead.phone,
            Email: lead.email,
            Website: lead.website,
            Company: lead.company,
            Country: lead.country ,
            Type_Of_Business__c: lead.type,
        };

        return this._createEntityWithIdResponse(sfLead, 'Lead', 'create lead');
    }

    async createOrder(order, paymentAcc, beneficiary, salesForceContactId) {

        const exchangeOrder = {
            Contact__c: salesForceContactId,

            Beneficeary_Address__c: beneficiary.beneficearyAddress,
            Beneficeary_Bank_Country__c: beneficiary.bankCountry,
            Beneficeary_Bank_Name__c: beneficiary.bankName,
            Beneficeary_Bank_Swift_BIC_code__c: beneficiary.bankSwiftBICcode,
            Beneficeary_Currency__c: beneficiary.currency,
            Beneficeary_IBAN__c: beneficiary.IBAN,
            Beneficeary_Name__c: beneficiary.beneficearyName,

            Payment_Account_Bank_Address__c: paymentAcc.bankAddress,
            Payment_Account_Bank_Country__c: paymentAcc.bankCountry,
            Payment_Account_Bank_Name__c: paymentAcc.bankName,
            Payment_Account_Bank_Swift_BIC_code__c: paymentAcc.bankSwiftBICcode,
            Payment_Account_Currency__c: paymentAcc.currency,
            Payment_Account_IBAN__c: paymentAcc.IBAN,


            Buy_Amount__c: order.buyAmount,
            Buy_Currency__c: order.buyCurrency,
            Sale_Currency__c: order.saleCurrency,
            exchange_rate__c: order.exchangeRate
        };

        return this._createEntityWithIdResponse(exchangeOrder, 'Exchange_Order__c', 'create order');
    }

    async _restPatchApexBooleanRequest (requestData, restServiceName, logActionName) {
        log.info("Sales force service restPatchApexBoolean: "+logActionName);
        SalesForceAdapter._logInput(logActionName, requestData);

        if(!this._connected){
            await this.login();
        }

        return new Promise(async (resolve, reject) => {
            const result = await this.connect.apex.patch(`/${restServiceName}/`, request);

            SalesForceAdapter._logResult(logActionName, result);

            if(result.toString() === '1'){
                resolve('ok');
            }
            else{
                reject(result);
            }
        });
    }

    async _createEntityWithIdResponse(entityData, type, logActionName) {

        SalesForceAdapter._logInput(logActionName, entityData);

        await this.login();

        const result = await this.connect.sobject(type).create(entityData);

        SalesForceAdapter._logResult(logActionName, result);

        return result.id;
    }

    static _logInput(logActionName, input) {
        log.info("Sales force " + logActionName + " - Input:");
        log.info(input);
    }

    static _logResult(logActionName, result) {
        log.info("Sales force " + logActionName + " - Result:");
        log.info(result);
    }
}

module.exports = SalesForce = new SalesForceAdapter();