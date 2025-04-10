//Needed Resources
const utilities = require('../utilities/'); //index.js
const regValidate = require("../utilities/account-validation")
const express = require("express")
const router = new express.Router()
const accountsController = require("../controllers/accountsController")

//Deliver Login View
router.get('/login' , accountsController.buildLogin);

//Deliver Registration View
router.get('/register', accountsController.buildRegister);

//Process Registration
router.post('/register', 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountsController.registerAccount));

router.use(utilities.handleErrors);
module.exports = router;


