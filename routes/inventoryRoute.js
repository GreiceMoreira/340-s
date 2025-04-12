//Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const validate = require("../utilities/class-validation")

router.get("/management", invController.buildManagement)

router.get("/add-classification", invController.buildAddClassification)


router.post(
  "/add-classification",
  validate.classificationRules(),
  validate.checkClassData,
  invController.addClassification
)

//Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

//Route to build inventory by details view
router.get("/detail/:invId", invController.buildByDetailsView);



module.exports = router;

