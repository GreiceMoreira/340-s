// const cookie = require("express-session/session/cookie")
const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul class='navigation' >"

  //console.log(data)
  list += '<li><a href="/" title="Home page">Home</a></li>'
  list += '<li><a href="/inv/compareCars" title="Compare Cars">Compare Cars</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  if (!data.length) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  const vehicleList = data.map(vehicle => {
    return `
      <li>
        <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="/${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
              ${vehicle.inv_make} ${vehicle.inv_model}
            </a>
          </h2>
          <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
        </div>
      </li>
    `
  }).join('')

  return `<ul id="inv-display">${vehicleList}</ul>`
}

/* **************************************
* Build the details view HTML
* ************************************ */
Util.buildDetailsView = async function(vehicle) {
  if (!vehicle) {
    return `<p class="notice">Sorry, no matching vehicles could be found.</p>`
  }

  const formattedPrice = new Intl.NumberFormat('en-US').format(vehicle.inv_price)
  const formattedMiles = new Intl.NumberFormat('en-US').format(vehicle.inv_miles)

  const detailsView = `
    <div id="det-display">
      <h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
      
      <div class="card-details">
        <section class="vehicleDetailsImg">
          <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
          </a>
        </section>

        <section class="more">
          <div class="namePrice">
            <hr />
            <h2>
              <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
          </div>

          <ul class="vehicle-details">
            <li><b>Price:</b> $${formattedPrice}</li>
            <li><b>Description:</b> ${vehicle.inv_description}</li>
            <li><b>Color:</b> ${vehicle.inv_color}</li>
            <li><b>Miles:</b> ${formattedMiles}</li>
          </ul>
        </section>
      </div>
    </div>
  `
  return detailsView
}
/* *****************
* Middleware For Handling Errors
* Wrap other function in this for 
* General Error Handling 
******************* */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

Util.checkJWTToken = (req, res, next) => {

  const token = req.cookies.jwt
  
  if (token) {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }

        res.locals.accountData = accountData
        res.locals.loggedin = true
        next()
      }
    )
  } else {
    next()
  }
}

Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  }else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

module.exports = Util