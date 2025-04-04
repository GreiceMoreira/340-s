/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const baseController = require("./controllers/baseController")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")
const errorRoute = require("./routes/500error");


const app = express()
const static = require("./routes/static")

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST



/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set('layout', 'layouts/layout')

/* ***********************
 * Routes
 *************************/
app.use(static)
// Index route
//app.get("/", baseController.buildHome)
app.get("/", utilities.handleErrors(baseController.buildHome))

//Inventory routes
app.use("/inv", inventoryRoute)

// 500 error
app.use(errorRoute)

//File Not Found Route - must be last rout in list
app.use(async (req,res,next) => {
  next({status: 404, message: 'Looks like you have ventured into the dark side! This page does not exist.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/

app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} 
  else if(err.status == 500){ message =  "Something went wrong!"}
  else {message = 'Oh no! There was a crash. Maybe try a different route?'}

  res.render("errors/error", {
    title: 'Error ' + err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
