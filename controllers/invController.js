const { validationResult } = require("express-validator");
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/*****************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by details view
 * ************************** */
invCont.buildByDetailsView = async function (req, res, next) {

  const vehicle_id = req.params.invId
  const vehicle = await invModel.getVehicleById(vehicle_id)
  const detailsView = await utilities.buildDetailsView(vehicle)
  let nav = await utilities.getNav()
  // const className = vehicle.classification_name
  res.render("./inventory/details", {
    title: vehicle.inv_make + " " + vehicle.inv_model,
    nav,
    detailsView,
  })
}

invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()

  const classificationSelect = await utilities.buildClassificationList()

  res.render("./inventory/management", {
    title: "Vehicle Management", 
    nav, 
    errors: null,
    classificationSelect
  })
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-classification", {
    title: "Add new Classification",
    nav,
    errors: null,
    classification_name: "",
  });
};

invCont.addClassification = async function (req,res) {
const {classification_name} = req.body;

const errors = validationResult(req);
let nav = await utilities.getNav();

if(!errors.isEmpty()){
  return res.render("inventory/add-classification", {
    title: "Add new Classification",
    nav,
    errors, 
    classification_name,
  });
}
try {
  const result = await invModel.addNewClassification(classification_name);

  req.flash("notice", `Classification '${result.classification_name}' added successfully.`);

  res.redirect("/inv/management");
} catch (error) {
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: [{ msg: error.message }],
    classification_name,
  });
}
};

invCont.buildAddOnInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add new car",
    nav,
    errors: null,
    classificationList,
  })
}
invCont.addNewCar = async function (req, res) {
  const {inv_make, inv_model, inv_year, 
    inv_description, inv_image, inv_thumbnail, 
    inv_price, inv_miles, inv_color, classification_id} = req.body;

    const errors = validationResult(req);
    let nav = await utilities.getNav();

    if(!errors.isEmpty()){
      let classificationList = await utilities.buildClassificationList()
      return res.render("inventory/add-inventory", {
        title: "Add new car",
        nav,
        errors, 
        classificationList
      })
    }
    try {
      const result = await invModel.addMyNewCar(inv_make, inv_model, inv_year, 
        inv_description, inv_image, inv_thumbnail, 
        inv_price, inv_miles, inv_color, classification_id);

        req.flash("notice", `A new car was add in the inventory`)

        res.redirect("/inv/management");
    } catch(error) {
      res.render("inventory/add-inventory", {
        title: "Add new car",
        nav,
        errors: [{msg : error.message}]
      })
    }
}

invCont.getInventoryJSON = async (req,res,next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id){
    return res.json(invData)
  }else {
    next(new Error("No data returned"))
  }
}

module.exports = invCont; 