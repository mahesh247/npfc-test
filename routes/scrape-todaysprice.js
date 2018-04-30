var express     = require('express');
var router      = express.Router();
const fakeUa    = require('fake-useragent');
const request   = require('request');
var cheerio     = require('cheerio');
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
        	var url = 'http://www.nepalstock.com/todaysprice?_limit=500';
			var headers = {
				'User-Agent': fakeUa(),
				//'Host': 'google.com',
				'Host': response.body.ip
			};
			//console.log(headers);
			request.get({ url: url, headers: headers }, function (err, resp, body) {
			  	//res.send(body);
			  	$ = cheerio.load(body);
			  	
			  	var rate = []
				var myObj = {}
				
				$('table').each(function(i, element){
					var table = element
					var td  = $(element).find('td:first-child label.pull-left').text().trim()
					myObj['time'] = td
					rate.push(myObj)
					$(table).find('tr').each(function(x, z){
						if(x > 0 ) {
						    myObj = {}
							myObj['sn'] = $(z).find('td').eq(0).text().trim()
							myObj['tc'] = $(z).find('td').eq(1).text().trim()
							myObj['maxp'] = $(z).find('td').eq(2).text().trim()
							myObj['minp'] = $(z).find('td').eq(3).text().trim()
							myObj['closingp'] = $(z).find('td').eq(4).text().trim()
							myObj['ts'] = $(z).find('td').eq(5).text().trim()
							myObj['amt'] = $(z).find('td').eq(6).text().trim()
							myObj['pclosing'] = $(z).find('td').eq(7).text().trim()
							myObj['pcldeffosing'] = $(z).find('td').eq(8).text().trim()
							rate.push(myObj)
						}
					})
				})
				/*MongoClient.connect(MongoURL, function(err, db) {
					if (err) throw err;
					var dbo = db.db("stockx");
					dbo.collection("todaysprice").insertMany(rate, function(err, res) {
						if (err) throw err;
						console.log("Number of documents inserted: " + res.insertedCount);
						db.close();
					});
				});*/
				res.send(rate);
                //console.log(rate);
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
