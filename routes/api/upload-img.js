const path = require("path");
const multer = require("multer");
const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require('../../models/User');
const SalesForce = require('../../services/salesforce');
const notifier = require('../../services/notifier');

const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function(req, file, cb){
        cb(null,"IMAGE-" + Date.now() + Math.random() + '.' + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: (req, file, cb) => {
        if (
            !file.mimetype.includes("jpeg") &&
            !file.mimetype.includes("jpg") &&
            !file.mimetype.includes("png") &&
            !file.mimetype.includes("pdf")
        ) {
            return cb(null, false, new Error("Only images with format (jpeg, jpg, png, pdf) are allowed"));
        }
        cb(null, true);
    }
}).fields(
    [
        {
            name: 'passport',
            maxCount: 1
        },
        {
            name: 'selfie',
            maxCount: 1
        },
        {
            name: 'address',
            maxCount: 1
        }
    ]
)

const shuftiProClass = require("../../services/shuftipro.js")
const shuftiPro = new shuftiProClass('http://localhost:3000/api/approveCallback', 'fcdbb9b057dd7c31e47b30d72e35c750df0cf01e32a78a23097fb1dd5e3a049a');


// @route   POST api/uploadImg
// @desc    Upload photos with documents route
// @access  Protected

router.post("/", [auth, upload, async (request, result, error) => {

    const checkExist = (fields) => {
        const errors = [];
        for (const field in fields) {
            const errorMsg = fields[field];
            if(!request.files[field] || request.files[field] < 1){
                errors.push({
                    "msg": errorMsg,
                    "param": field
                });
            }
        }
        return errors;
    };

    const errors = checkExist({
        passport: "Passport is required",
        selfie: "Passport with photo is required",
        address: "Address is required"
    });

    if (errors.length > 0) {
        return result.status(400).json({ errors });
    }

    const id = request.user.id;
    const user = await User.findById(id);
    const proofs = {
        passport: request.files.passport[0].path,
        selfie: request.files.selfie[0].path,
        address: request.files.address[0].path,
    };

    shuftiPro.validate(user, proofs)
        .then((validateResult) => {
            if(validateResult){
                SalesForce.createContact(user).then( (salesForceContactId) => {
                    user.salesForceContactId = salesForceContactId;
                    user.save();

                    result.status(200).json({
                        msg: "Validation ok. Wait approve from administration"
                    });

                }).catch((err) => {
                    notifier.push(err);
                    result.status(500).json({
                        msg: "Validation ok but cannot create request to external admin"
                    });
                });
            }
            else{
                result.status(400).json({msg: "Validation error"});
            }
        })
        .catch((error) => {
            console.log(error);
            notifier.push(error);
            result.status(500).json({msg: "Validation Internal Error"});
        })
}]);


module.exports = router;