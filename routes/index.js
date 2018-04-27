var express = require('express')
var router = express.Router()

/* GET scrape listing. */
router.get('/', function(req, res, next) {
	 var date = new Date()
  var year = date.getFullYear()
  res.render('index', { title: 'NP Forex Commodity', year: year });
})

module.exports = router