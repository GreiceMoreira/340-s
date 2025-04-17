//Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const validateClass = require("../utilities/class-validation")
const validateInv = require("../utilities/inv-validation")
const utilities = require("../utilities") 


//Route to menu management
router.get("/", invController.buildManagementView)

//Route to add a new classification
router.get("/add-classification", invController.buildAddClassification)

router.post(
  "/add-classification",
  validateClass.classificationRules(),
  validateClass.checkClassData,
  invController.addClassification
)

//Get inventory for AJAX Route
router.get (
  "/getInventory/:classification_id",
  // utilities.checkAccountType,
  utilities.handleErrors(invController.getInventoryJSON)
)

//Route to add a new car in the inventory
router.get("/add-inventory", invController.renderAddInventoryForm)

router.post("/add-inventory", 
  validateInv.invRules(), 
  validateInv.checkInvData, 
  invController.addNewCar)

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

//Route to build inventory by details view
router.get("/detail/:invId", invController.buildByDetailsView);

// Route to edit a car in the inventory
router.get("/edit/:inventory_id", invController.editInventoryView);

router.post(
  "/update/",
  validateInv.invRules(),
  validateInv.checkUpdateData,
  invController.updateInventory
)

// Route to DELETE a car in the inventory
router.get("/delete/:inv_id", invController.deleteInventoryView);

router.post("/delete/", invController.deleteItem);

//Route to compare two cars
router.get("/compareCars", invController.compareVehiclesView) 

router.post('/compareResult', invController.compareVehiclesResult)

module.exports = router;

