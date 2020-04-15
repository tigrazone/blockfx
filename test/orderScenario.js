//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../models/User');
const bcrypt = require("bcryptjs");

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

let app = require("../app");
let http = require("http");

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
var salesforce = require('../services/salesforce');

chai.use(chaiHttp);


let removeContactSF = async (email) => {

    if(email.length < 5){
        return null;
    }

    await salesforce.login();
    const conn = salesforce.connect;

    return new Promise((resolve, error) => conn.sobject("Contact")
        .find({Email: email})
        .limit(1)
        .delete(
            (err, ret) => {
                if (err) {
                    error(err);
                    return console.error(err, ret);
                }
                if(ret.length === 0){
                    console.log('Not found entity to delete');
                    resolve('not found');
                }
                else{
                    console.log('Deleted ' + ret.length + 'entity');
                    resolve('deleted');
                }
            }
        )
    );
};

let removeExchangeOrderSF = async (contactId) => {
    const conn = salesforce.connect;

    return new Promise((resolve, error) => conn.sobject("Exchange_Order__c")
        .find({Contact__c: contactId})
        .limit(1)
        .delete(
            (err, ret) => {
                if (err) {
                    error(err);
                    return console.error(err, ret);
                }
                if(ret.length === 0){
                    console.log('Not found entity to delete');
                    resolve('not found');
                }
                else{
                    console.log('Deleted ' + ret.length + 'entity');
                    resolve('deleted');
                }
            }
        )
    );
};


//Our parent block
describe('Login', () => {
    let FAKE_PASSWORD = 'fake_pass';
    let FAKE_LOGIN = "fake_user_dev_for_test_to_delete_after_test" + Math.random();
    let TOKEN = null;
    beforeEach(async () => { //Before each test we create fake user avoid registration
        const user = User.find({
            email: 'fake-email@fake-email.fake'
        });

        if(user){
            user.remove();
        }

        await removeContactSF('mn173162431@ikod.com');

        const salt = await bcrypt.genSalt(10);

        const newUser = {
            firstname: "fake",
            lastname: "fake",
            login: FAKE_LOGIN,
            password: await bcrypt.hashSync(FAKE_PASSWORD, salt),
            email: 'fake-email@fake-email.fake',
            phone: '+30303030303',
            approve: true
        }

        const newUserEntity = new User(newUser);

        newUserEntity.salesForceContactId = await salesforce.createContact(newUserEntity);

        newUserEntity.save();

        TOKEN = await new Promise((resolve, error) => {
            chai.request(server)
                .post('api/exchange')
                .send({
                    login: FAKE_LOGIN,
                    password: FAKE_PASSWORD
                })
                .end((err, res) => {
                    if(err){
                        error(err);
                    }
                    resolve(res.body.token);
                });
        });
    });
    /*
      * Test the POST /api/auth route
      */
    describe('POST /api/auth', () => {
        it('it should auth with correct login and password and response token', (done) => {
            chai.request(server)
                .post('/api/auth')
                .send({
                    login: FAKE_LOGIN,
                    password: FAKE_PASSWORD
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('token');
                    res.body.token.should.not.equal('');

                    done();
                });
        });
    });

    afterEach(() => {
        const user = User.find({
            email: 'fake-email@fake-email.fake'
        });

        if(user){
            user.remove();
        }
    });

});