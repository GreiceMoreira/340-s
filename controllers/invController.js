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

invCont.renderAddInventoryForm = async function (req, res, next) {
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

        res.redirect("/inv");
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

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {

  const inv_id = parseInt(req.params.inventory_id)

  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)

  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`


  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

// Edit invetory
invCont.updateInventory = async function (req, res) {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body;

  const errors = validationResult(req);
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    let classificationList = await utilities.buildClassificationList(classification_id);
    return res.status(400).render("inventory/edit-inventory", {
      title: "Edit " + inv_make + " " + inv_model,
      nav,
      errors,
      classificationSelect: classificationList,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }

  try {
    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    if (updateResult) {
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("notice", `The ${itemName} was successfully updated.`);
      return res.redirect("/inv/");
    } else {
      const classificationList = await utilities.buildClassificationList(classification_id);
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("notice", "Sorry, the update failed.");
      return res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect: classificationList,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      });
    }
  } catch (error) {
    req.flash("notice", "An error occurred while updating the vehicle.");
    return res.status(500).render("inventory/edit-inventory", {
      title: "Edit " + inv_make + " " + inv_model,
      nav,
      classificationSelect: await utilities.buildClassificationList(classification_id),
      errors: [{ msg: error.message }],
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }
}
/* ***************************
 *  Build DELETE inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav()

  const inv_id = parseInt(req.params.inv_id)
  
  const itemData = await invModel.getVehicleById(inv_id)

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

// Deleted item from the invetory
invCont.deleteItem = async function (req, res) {
  let nav = await utilities.getNav();

  const inv_id = parseInt(req.body.inv_id) ;
  let vehicle = {}

  try {
    const vehicle = await invModel.getVehicleById(inv_id);
    const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`;
    
    
    const deleteResult = await invModel.deleteInventoryItem(inv_id)

    if (deleteResult) {
      req.flash("notice", `The ${itemName} was successfully deleted.`);
      return res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the delete failed.");
      return res.status(501).render("inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id,
        inv_make: vehicle.inv_make,
        inv_model: vehicle.inv_model,

      });
    }
  } catch (error) {
    req.flash("notice", "An error occurred while deleting the vehicle.");
    return res.status(500).render("inventory/delete-confirm", {
      title: "Delete vehicle doesn't work",
      nav,
      errors: [{ msg: error.message }],
      inv_id,
      inv_make: vehicle.inv_make || "Unknown",
      inv_model: vehicle.inv_model || "Unknown",
    });
  }
}


module.exports = invCont; 