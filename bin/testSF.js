require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User")
const History = require("../models/History")


connectDB();

type: {
    type: String,
        require: true
},

ev_id: {
    type: String,
        require: true
},

status: {
    type: String,
        require: true
},

message: {
    type: String,
        require: true
},

uid: {
    type: String,
        require: true
},

const testt = async () => {
    // const user = new User({
    //     firstname: "Test",
    //     lastname: "Test",
    //     email: "test@gmail.com",
    //     login: "qqqq",
    //     phone: "38063098889",
    //     approve: false
    // });
    //
    // await user.save();

    const user = await User.find({
        'email': 'fake_user_dev_for_test_to_delete_after_test0.8421350478228711'
    });

    const history = new History({

    });
}

testt().then()



// const SalesForce = require("../services/salesforce");
//
// const getRandDigit = () => {
//     return (Math.random() * 1000000000).toFixed(0);
// }
//
// const user = {
//     firstname: "testName",
//     lastname: "test2Name",
//     id: 3123,
//     phone: "+380630722888",
//     email: "mn" + getRandDigit() +"@ikod.com"
// };
//
// SalesForce.createContact( user ).then((salesForceContactId) => {
//     //console.log(salesForceContactId);
//
//     user.email = "mn"+ getRandDigit() +"@ikod.com";
//     //console.log(user.email);
//     user.salesForceContactId = salesForceContactId;
//
//
//     //SalesForce.updateContact( user ).then(() => {}).catch(() => {});
//
//     SalesForce.resetPassword( user, 'https://link.com').then(console.log).catch(console.error)
//
//     const order = {
//         buyAmount: getRandDigit(),
//         buyCurrency: "USD",
//         saleCurrency: "BTC",
//         exchangeRate: getRandDigit()
//     };
//
//     //SalesForce.createOrder( order, user.salesForceContactId).then(console.log).catch(console.log);
//
// }).catch(console.log);
//
// // const lead = {
// //     fullname: "LastName",
// //     phone: "Phone",
// //     email: "xaknik"+ getRandDigit() +"@gmail.com",
// //     website: "Website",
// //     company: "Company",
// //     country: "Country",
// //     type: "Type_Of_Business__c",
// // };
// //
// // SalesForce.createLead( lead ).then(console.log).catch(console.log);
