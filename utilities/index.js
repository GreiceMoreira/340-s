const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul class='navigation' >"
  console.log(data)
  list += '<li><a href="/" title="Home page">Home</a></li>'
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
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/* **************************************
* Build the details view HTML
* ************************************ */
Util.buildDetailsView = async function(vehicle){
  let detailsView = ""
  
  if (vehicle) {
    detailsView += '<div id="det-display">';
    
    // Vehicle title
    detailsView += '<h1>' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h1>';
    
    detailsView += '<div class="card-details">' //Card .card-details
    // Vehicle image with link
    detailsView += '<section class="vehicleDetailsImg>' //Open section vehicle details image
    detailsView += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">';
    detailsView += '<img src="' + vehicle.inv_thumbnail + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" />';
    detailsView += '</a>';
    detailsView += '</section>' //Close section vehicle details image

    detailsView += '<section class="more">' //Open section details 

    // Price and model name
    detailsView += '<div class="namePrice">';
    detailsView += '<hr />';
    detailsView += '<h2>';
    detailsView += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">';
    detailsView += vehicle.inv_make + ' ' + vehicle.inv_model;
    detailsView += '</a>';
    detailsView += '</h2>';
    
  // Vehicle Details in a List
    detailsView += '<ul class="vehicle-details">';
    detailsView += '<li><b>Price: </b>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</li>';
    detailsView += '<li><b>Description: </b>' + vehicle.inv_description + '</li>';
    detailsView += '<li><b>Color: </b>' + vehicle.inv_color + '</li>';
    detailsView += '<li><b>Miles: </b>' + vehicle.inv_miles + '</li>';
    detailsView += '</ul>';

    detailsView += '</section>' //Close section details 

    detailsView += '</div>' //Close .card-details
    detailsView += '</div>'; // Close #det-display
  } else { 
    detailsView += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return detailsView
}


/* *****************
* Middleware For Handling Errors
* Wrap other function in this for 
* General Error Handling 
******************* */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)



module.exports = Util