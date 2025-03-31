const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}


/* ***************************
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

module.exports = invCont 