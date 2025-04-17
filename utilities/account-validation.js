const utilities = require(".")
const accountModel = require("../models/account-model")
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
        .withMessage("A valid email is required")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists){
                throw new Error("Email exists. Please log in or use different email")
            }
        }),

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

validate.checkUpData = async (req, res, next) => {
  const {account_firstname, account_lastname, account_email, account_id} =
  req.body
  let errors = []
  errors = validationResult(req)

  if(!errors.isEmpty()){
      let nav = await utilities.getNav()
      res.render("account/updateAccount", {
          errors,
          title: "Update Account",
          nav, 
          account_firstname, 
          account_lastname,
          account_email,
      })
      return
  }
  next()
}
validate.checkPassUpData = async (req, res, next) => {
  const account_password = req.body
  let errors = []
  errors = validationResult(req)

  if(!errors.isEmpty()){
      let nav = await utilities.getNav()
      res.render("account/updateAccount", {
          errors,
          title: "Update Account",
          nav, 
          account_password, 
      })
      return
  }
  next()
}

validate.loginRules = () => {
    return [
      body("account_email")
        .trim()
        .isEmail()
        .withMessage("A valid email is required"),
  
      body("account_password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
    ]
  };

validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/login", {
        errors,
        title: "Login",
        nav,
        account_email,
      })
      return
    }
    next()
  };

validate.updateAccountRules = () => {
    return [
      body("account_firstname")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."),
      body("account_lastname")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a last name."),
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required."),
    ];
  };

  validate.updatePasswordRules = () => {
    return [
      body("new_password")
        .trim()
        .isLength({ min: 12 })
        .withMessage("Password must be at least 12 characters long.")
        .matches("[A-Z]")
        .withMessage("Password must have at least one uppercase letter.")
        .matches("[a-z]")
        .withMessage("Password must have at least one lowercase letter.")
        .matches("[0-9]")
        .withMessage("Password must have at least one number.")
        .matches("[^A-Za-z0-9]")
        .withMessage("Password must have at least one special character."),
    ]
  };
  

module.exports = validate