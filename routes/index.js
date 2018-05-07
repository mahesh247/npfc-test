var express = require('express');
var router = express.Router();
const fakeUa = require('fake-useragent');
const request = require('request');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient
var MongoURL    = "mongodb://stockxuser:stockxuser@ds125479.mlab.com:25479/stockx"
var CronJob     = require('cron').CronJob
var limit = 135

/*var monthName = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]

function checkZeroto9(num){
    if(num<10){
        num = '0'+num;
    }
    return num;
}*/

/* GET home page. */
router.get('/', function(req, res, next) {
	var things = [];
	MongoClient.connect(MongoURL, function(err, db) {
		if (err) throw err;
		var dbo = db.db("stockx");
		dbo.collection("stocklive").find({}).sort({$natural : -1}).limit(limit).toArray(function(err, result) {
		if (err) throw err;
			things = result.reverse();
			res.send(things)
			db.close();
		});
	}); 
});



module.exports = router;
