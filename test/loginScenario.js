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


chai.use(chaiHttp);
//Our parent block
describe('Login', () => {
    let FAKE_PASSWORD = 'fake_pass';
    let FAKE_LOGIN = "fake_user_dev_for_test_to_delete_after_test" + Math.random();
    beforeEach(async () => { //Before each test we create fake user avoid registration
        const user = User.find({
            email: 'fake-email@fake-email.fake'
        });

        if(user){
            user.remove();
        }

        const salt = await bcrypt.genSalt(10);

        const newUser = {
            firstname: "fake",
            lastname: "fake",
            login: FAKE_LOGIN,
            password: await bcrypt.hashSync(FAKE_PASSWORD, salt),
            email: 'fake-email@fake-email.fake',
            phone: '+30303030303',
            approve: true,
            salesForceContactId: 'fake-sales-force-id'
        }

        const newUserEntity = new User(newUser);

        newUserEntity.save();
    });
    /*
      * Test the POST /api/auth route
      */
    describe('POST /api/auth', () => {
        it('it should not auth with wrong login', (done) => {
            chai.request(server)
                .post('/api/auth')
                .send({
                    login: 'wrong-login-fake-user',
                    password: FAKE_PASSWORD
                })
                .end((err, res) => {
                    console.log(res);
                    res.should.have.status(400);
                    done();
                });
        });

        it('it should not auth with wrong login', (done) => {
            chai.request(server)
                .post('/api/auth')
                .send({
                    login: FAKE_LOGIN,
                    password: 'wrong-password-fake-user'
                })
                .end((err, res) => {

                    res.should.have.status(400);
                    done();
                });
        });

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

                    chai.request(server)
                        .get('/api/history')
                        .set('x-auth-token', res.body.token)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('array');
                            done();
                        });
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