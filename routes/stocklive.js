var express = require('express')
var router = express.Router()
var superagent = require('superagent')
var cheerio = require('cheerio')

/* GET scrape listing. */
router.get('/', function(req, res, next) {
	var url = 'http://nepalstock.com/stocklive'

	superagent
	.get(url)
	.query()
	.end(function(err, response){
		if(err){
			res.json({
				confirmation: 'Failed',
				message: err
			})
			return
		}

		$ = cheerio.load(response.text)

		var rate = []
		var myObj = {}

		if ( $('.col-xs-12.col-md-9.col-sm-9').find('tr').length <= 1 ) {
			myObj['status'] = 'Market Closed'
			rate.push(myObj)
			res.send(rate)
			return false
		}
		
		$('.col-xs-12.col-md-9.col-sm-9').each(function(i, element){
			var table = $(element).find('table') 
			//return false
			$(element).find('table').remove('table')
			myObj['time'] = $(element).text().trim()
			myObj['status'] = 'Market Opened'
			rate.push(myObj)
					$(table).find('tr').each(function(x, z){
						if(x > 0 ) {
							myObj = {}
							myObj['sn'] = $(z).find('td').eq(0).text().trim()
							myObj['symbol'] = $(z).find('td').eq(1).text().trim()
							myObj['ltp'] = $(z).find('td').eq(2).text().trim()
							myObj['pc'] = $(z).find('td').eq(3).text().trim()
							myObj['change'] = $(z).find('td').eq(4).text().trim()
							myObj['open'] = $(z).find('td').eq(5).text().trim()
							myObj['high'] = $(z).find('td').eq(6).text().trim()
							myObj['low'] = $(z).find('td').eq(7).text().trim()
							myObj['volume'] = $(z).find('td').eq(8).text().trim()
							myObj['pre_closing'] = $(z).find('td').eq(9).text().trim()
							rate.push(myObj)
						}
					})
		})

		res.send(rate)
	})

})

module.exports = router
