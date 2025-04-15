const utilities = require("../utilities/");
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const accCont = {}


/* ****************************************
*  Deliver login view
* *************************************** */
accCont.buildLogin = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
    })
  }

/* ****************************************
*  Deliver registration view
* *************************************** */

accCont.buildRegister = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }

accCont.registerAccount = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
    return res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed. Please try again.")
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}


accCont.accountLogin = async function (req, res) {

    let nav = await utilities.getNav()

    const { account_email, account_password } = req.body

    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  
    try {
      if (await bcrypt.compare(account_password, accountData.account_password)) {
        delete accountData.account_password
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: 3600 * 1000,
        })
        const cookieSettings = {
          httpOnly: true,
          maxAge: 3600 * 1000,
          ...(process.env.NODE_ENV !== "development" && { secure: true }),
        }
        res.cookie("jwt", accessToken, cookieSettings)
        return res.redirect("/inv")
      } else {
        req.flash("notice", "Please check your credentials and try again.")
        return res.status(400).render("account/login", {
          title: "Login",
          nav,
          errors: null,
          account_email,
        })
      }
    } catch (error) {
      throw new Error("Access Forbidden")
    }
  }

accCont.buildAccount = async function (req, res) {
    let nav = await utilities.getNav()
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      message: req.flash("notice"),
    })
  }

  accCont.buildManagement = async function (req, res) {
    let nav = await utilities.getNav()
    res.render("account/management", {
      title: "Account Management",
      nav,
      accountData: res.locals.accountData, 
    })
  }

module.exports = accCont