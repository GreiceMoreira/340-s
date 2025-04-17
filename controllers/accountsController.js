const utilities = require("../utilities/");
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const accCont = {}



// Deliver login view
accCont.buildLogin = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
    })
  }

// Deliver registration view

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

accCont.buildManagementView = async function (req, res) {
  const nav = await utilities.getNav();
  const accountData = res.locals.accountData;
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData,
  });
};

accCont.accountLogin = async function (req, res) {

  let nav = await utilities.getNav()

  // Destructure email and password from the request body
  const { account_email, account_password } = req.body
  // Fetch the account data from the database using the email provided
  const accountData = await accountModel.getAccountByEmail(account_email)

  // If no account is found, flash an error message and render the login page
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
    // Compare the provided password with the stored hashed password
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      // Remove the password from the accountData object before using it for the token
      delete accountData.account_password

      // Create a JWT access token that expires in 1 hour
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
        // expiresIn: "1h"
        expiresIn: 360000 
      })

      // Set the cookie settings, making it HttpOnly and setting the expiration time
      const cookieSettings = {
        httpOnly: true,
        maxAge: 3600 * 1000, 
        ...(process.env.NODE_ENV !== "development" && { secure: true }), // Ensure secure cookies in production
      }

      // Send the JWT token as a cookie in the response
      res.cookie("jwt", accessToken, cookieSettings)

      return res.redirect("/account")

    } else {
      // If password doesn't match, show an error and render the login page again
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    // If any error occurs, throw an access forbidden error
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

accCont.logout = (req, res) => {
    //Clear the JWT cookie
    res.clearCookie("jwt")

    //Flash a message
    req.flash("notice", "You have successfully logged out")

    //Redirect the user to the login page
    return res.redirect("/account/login")
  }

accCont.buildUpdateAccount = async (req, res) => {
    const accountId = req.params.account_id; 
    console.log(accountId)

    try {

      const accountData = await accountModel.getAccountById(accountId);
      console.log(accountData)
      const nav = await utilities.getNav();
  
      res.render("account/updateAccount", 
        { 
          title: "Update Account", 
          nav, 
          errors:null,
          accountData 
        });
    } catch (error) {
      console.error("Error fetching account data for update:", error);
      req.flash("notice", "An error occurred while loading your account data.");
      res.redirect("/account");
    }
  };


accCont.updateAccountInfo = async function (req, res) {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
  
    try {
      const emailExists = await accountModel.checkExistingEmail(account_email);
    
      if (emailExists > 0) {
        req.flash("notice", "This email is already in use. Please choose another one.");
        return res.redirect(`/account/update/${account_id}`);
      }


      const updateResult = await accountModel.updateAccountInfo(
        account_id,
        account_firstname,
        account_lastname,
        account_email
      );
  
      if (updateResult) {
        req.flash("notice", "Account information updated successfully.");
        res.redirect("/account");
      } else {
        req.flash("notice", "Update failed. Please try again.");
        res.redirect(`/account/update/${account_id}`);
      }
    } catch (error) {
      console.error("Error updating account:", error);
      req.flash("notice", "An error occurred. Please try again.");
      res.redirect(`/account/update/${account_id}`);
    }
  };

accCont.updateAccountPassword = async function (req, res) {
    const { account_id, new_password } = req.body;

    console.log("Account ID:", account_id);
    console.log("New Password:", new_password); 
  
    try {
      // Hash the new password before storing it
      const hashedPassword = await bcrypt.hash(new_password, 10);
      
      // Update the password in the database
      const updatePassword = await accountModel.updatePassword(hashedPassword, account_id);
  
      if (updatePassword) {
        req.flash("notice", "Password updated successfully.");
        res.redirect("/account");  // Redirect to the account overview page
      } else {
        req.flash("notice", "Update failed. Please try again.");
        res.redirect(`/account/update/${account_id}`);  // Redirect back to the update page with account_id
      }
    } catch (error) {
      console.error("Error changing password:", error);
      req.flash("notice", "An error occurred. Please try again.");
      res.redirect(`/account/update/${account_id}`);  // Redirect to the update page with account_id
    }
  };

module.exports = accCont