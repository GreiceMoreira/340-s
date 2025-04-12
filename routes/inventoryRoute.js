//Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const validateClass = require("../utilities/class-validation")
const validateInv = require("../utilities/inv-validation")

//Route to menu management
router.get("/", invController.buildManagement)

//Route to add a new classification
router.get("/add-classification", invController.buildAddClassification)

router.post(
  "/add-classification",
  validateClass.classificationRules(),
  validateClass.checkClassData,
  invController.addClassification
)

//Route to add a new car in the inventory
router.get("/add-inventory", invController.buildAddOnInventory)

router.post("/add-inventory", 
  validateInv.invRules(), 
  validateInv.checkInvData, 
  invController.addNewCar)

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

//Route to build inventory by details view
router.get("/detail/:invId", invController.buildByDetailsView);



module.exports = router;

