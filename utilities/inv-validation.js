const utilities = require(".")
const {body, validationResult} = require("express-validator")
const validate = {}

/*
Inventory data validation rules
*/

validate.invRules = () => {
    return [        
            body("inv_make")
              .trim()
              .isLength({ min: 1 })
              .withMessage("Make is required.")
              .matches(/^[a-zA-Z0-9\s]+$/)
              .withMessage("Make must be alphanumeric."),
        
            body("inv_model")
              .trim()
              .isLength({ min: 1 })
              .withMessage("Model is required.")
              .matches(/^[a-zA-Z0-9\s]+$/)
              .withMessage("Model must be alphanumeric."),
        
            body("inv_year")
              .trim()
              .matches(/^\d{4}$/)
              .withMessage("Year must be a 4-digit number."),
        
            body("inv_description")
              .trim()
              .isLength({ min: 1 })
              .withMessage("Description is required."),
        
            body("inv_image")
              .trim()
              .isLength({ min: 1 })
              .withMessage("Image path is required."),
        
            body("inv_thumbnail")
              .trim()
              .isLength({ min: 1 })
              .withMessage("Thumbnail path is required."),
        
            body("inv_price")
              .isFloat({ min: 0 })
              .withMessage("Price must be a valid number."),
        
            body("inv_miles")
              .isInt({ min: 0 })
              .withMessage("Miles must be a valid integer."),
        
            body("inv_color")
              .trim()
              .isLength({ min: 1 })
              .withMessage("Color is required.")
              .matches(/^[a-zA-Z\s]+$/)
              .withMessage("Color must contain only letters."),
        
            body("classification_id")
              .isInt()
              .withMessage("Please select a classification."),

]

}

//Inventory check data and return errors or continue

validate.checkInvData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body

  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)

    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      errors,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
    return
  }
  next()
}

module.exports = validate