var express = require('express');
var router = express.Router();
const fakeUa = require('fake-useragent');
const request = require('request');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;
var MongoURL    = "mongodb://stockxuser:stockxuser@ds125479.mlab.com:25479/stockx";
var CronJob     = require('cron').CronJob;

/*var monthName = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]

function checkZeroto9(num){
    if(num<10){
        num = '0'+num;
    }
    return num;
}*/

/* GET home page. */
router.get('/', function(req, res, next) {
	request.get('https://gimmeproxy.com/api/getProxy',{json:true},function(err,response){
        if(!err){
        	var url = 'http://nepalstock.com.np';
			var headers = {
				'User-Agent': fakeUa(),
				//'Host': 'google.com',
				'Host': response.body.ip
			};
			console.log(headers);
			request.get({ url: url, headers: headers }, function (err, resp, body) {
			  	//res.send(body);
			  	$ = cheerio.load(body);
			  	
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
				MongoClient.connect(MongoURL, function(err, db) {
					if (err) throw err;
					var dbo = db.db("stockx");
					dbo.collection("stocklive").insertMany(rate, function(err, res) {
						if (err) throw err;
						console.log("Number of documents inserted: " + res.insertedCount);
						db.close();
					});
				});
                res.send(rate);
			});

        }
    });
	/*var url = 'http://example.com';
	var headers = {
	    'User-Agent': fakeUa(),
	    'Host': ip,
	    'Referer': ip
	};

	request.get({ url: url, headers: headers }, function (err, resp, body) {
		//console.log(res);
		//console.log(err);
	  	//result = res;
	  	res.send(resp);
	});*/
	//res.send(generateRandomProxy());
	//res.send(result);
});



module.exports = router;
