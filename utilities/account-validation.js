const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*
Registration data validation rules
*/

validate.registrationRules = () => {
    return [
        //fname is required and must be string 
        body("account_firstname")
        .trim()
        .isString()
        .isLength({ min: 1})
        .withMessage("Please provide a first name."),

         //lname is required and must be string
        body("account_lastname")
        .trim()
        .isString()
        .isLength({ min: 1})
        .withMessage("Please provide a last name."),

        //valid email is required and cannot already exist in the database
        body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required"),

        //password is required and must be strong password
        body("account_password")
        .trim()
        .isStrongPassword({
            minLength: 12,
            minLowercase:1,
            minUppercase:1,
            minNumbers:1,
            minSymbols:1
        })
        .withMessage("Password does not meet requirements"),
    ]
}

//Check data and return errors or continue to registration 

validate.checkRegData = async (req, res, next) => {
    const {account_firstname, account_lastname, account_email} =
    req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()){
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav, 
            account_firstname, 
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

module.exports = validate