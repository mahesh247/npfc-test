var express = require('express');
var router = express.Router();
const fakeUa = require('fake-useragent');
const request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
	//request.get('https://gimmeproxy.com/api/getProxy',{json:true},function(err,response){
        //if(!err){
        	var url = 'http://nepalstock.com.np';
			var headers = {
				'User-Agent': fakeUa(),
				'Host': 'google.com',
				//'Referer': response.body.ip
			};
			console.log(headers);
			request.get({ url: url, headers: headers }, function (err, resp, body) {
			  	res.send(resp);
			});

        //}
    //});
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
