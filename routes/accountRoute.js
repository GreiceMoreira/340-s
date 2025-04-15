//Needed Resources
const utilities = require('../utilities/'); //index.js
const regValidate = require("../utilities/account-validation")
const express = require("express")
const router = new express.Router()
const accountsController = require("../controllers/accountsController")

//Deliver Login View
router.get('/login' , accountsController.buildLogin);

//Process Login
router.post('/login', 
    regValidate.loginRules(), 
    regValidate.checkLoginData, 
    utilities.handleErrors(accountsController.accountLogin));


//Deliver Registration View
router.get('/register', accountsController.buildRegister);

//Process Registration
router.post('/register', 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountsController.registerAccount));


// Deliver account management view
router.get("/",utilities.checkLogin, utilities.handleErrors(accountsController.buildManagement))


router.use(utilities.handleErrors);
module.exports = router;


