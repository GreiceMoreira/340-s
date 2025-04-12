const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*
Classification data validation rules
*/

validate.classificationRules = () => {
    return [        
        //classification is required and must be string 
        body("classification_name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a classification name.")
        .matches(/^[A-Za-z]+$/)
        .withMessage("Classification name must contain only letters (no spaces or special characters)."),
]

}

//Check data and return errors or continue

validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors,
        classification_name,
      })
      return
    }
    next()
  }

module.exports = validate