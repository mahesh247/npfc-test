var express    = require('express')
var router     = express.Router()
var superagent = require('superagent')
var cheerio    = require('cheerio')
var mysql      = require('mysql');
var CronJob    = require('cron').CronJob
var http       = require('http'); //importing http

function startKeepAlive() {
    setInterval(function() {
        var options = {
            host: 'npfc.herokuapp.com',
            port: 80,
            path: '/npfc'
        };
        http.get(options, function(res) {
            res.on('data', function(chunk) {
                try {
                    // optional logging... disable after it's working
                    console.log("HEROKU RESPONSE: " + chunk);
                } catch (err) {
                    console.log(err.message);
                }
            });
        }).on('error', function(err) {
            console.log("Error: " + err.message);
        });
    }, 29 * 60 * 1000); // load every 29 minutes
}

startKeepAlive();

var db_config = {
    host: "184.154.67.178",
    user: "trololol_npfcusr",
    password: "ox7u;1t38cE[",
    database: "trololol_npfc"
}

var cronTime = '*/10 10 12 * * *'

/*var db_config = {
    host: "localhost",
    user: "root",
    password: "",
    database: "test"
}*/

function handleDisconnect() {
  con = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  con.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  con.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

var monthName = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]

function checkZeroto9(num){
    if(num<10){
        num = '0'+num;
    }
    return num;
}



var commodityCron = new CronJob({
    cronTime: cronTime, // Minute Hour Date Month Day : Currently set to run every minute
    onTick: function() { // Do the job
        // Fetch value from the url

        var url = 'http://www.fenegosida.org/'

        superagent
            .get(url)
            .query()
            .end(function(err, response) {
                if (err) {
                    /*res.json({
                        confirmation: 'Failed',
                        message: err
                    })*/
                    console.log('ERROR')
                    return
                }

                $ = cheerio.load(response.text)

                var rate = {}
                var commodity = {}
                var things = []
                var data = []
                var comm = []

                var d = new Date()
                var date = checkZeroto9( d.getDate() ) + ' ' + monthName[ d.getMonth() ] + ' ' + d.getFullYear()

                $('div').each(function(i, element) {
                    var className = element.attribs.class
                    if (className == 'rate-gold post' || className == 'rate-silver post') {

                        $el = $(element)

                        var price = $el.find('b').text()
                        $el.find('b').remove()

                        var measure = $el.find('span').text().replace(/Nrs/gi, "")
                        $el.find('span').remove()

                        var name = $el.find('p').text().replace(/\/-/gi, "").trim()

                        var rate = new Object();
                        rate.name = name;
                        rate.price = price;
                        rate.measure = measure;
                        data = []
                        data = [date, name, price, measure]

                        comm.push(data)


                        if (Object.keys(rate).length == 3) {
                            things.push(rate)
                            //rate = {}
                        }
                    }
                })

                handleDisconnect()

                var sql = "CREATE TABLE IF NOT EXISTS commodities (id INT AUTO_INCREMENT PRIMARY KEY, date VARCHAR(255), name VARCHAR(255), price VARCHAR(255), measure VARCHAR(255))";

                con.query(sql, function(err, result) {
                    if (err) throw err;
                    console.log("Table created");
                });

                var sql = "INSERT INTO commodities (date, name, price, measure) VALUES ?";
                con.query(sql, [comm], function(err, result) {
                    if (err) throw err;
                    console.log("Number of records inserted: " + result.affectedRows);
                });

                con.end()

            })
    },
    start: false, // Autostart set to true
    timeZone: 'Asia/Kathmandu' // Timezone set to Asia/Kathmandu
})

var forexCron = new CronJob({
    cronTime: cronTime, // Minute Hour Date Month Day : Currently set to run every minute
    onTick: function() { // Do the job
        /* Fetch value from the url */

        var url = 'https://www.nrb.org.np/fxmexchangerate.php'

        superagent
            .get(url)
            .query()
            .end(function(err, response) {
                if (err) {
                    /*res.json({
                        confirmation: 'Failed',
                        message: err
                    })*/
                    console.log('ERROR');
                    return
                }

                $ = cheerio.load(response.text)

                var rate = []
                var comm = []

                $('table').each(function(i, element) {
                    var twidth = element.attribs.width
                    if (twidth == '95%') {
                        $(element).find('tr').each(function(x, z) {
                            if (x == 5) {
                                date = ($(z).find('td').find('strong').find('font').text().trim())
                            }
                        })
                    } else if (twidth == 450) {
                        $(element).find('tr').each(function(x, z) {
                            if (x > 1 && x < 22) {
                                var myObj = {}
                                myObj['Date'] = date
                                myObj['CountryFlag'] = $(z).find('td').eq(0).find('span').attr('class')
                                myObj['BaseCurrency'] = $(z).find('td').eq(0).text().trim()
                                myObj['BaseValue'] = $(z).find('td').eq(1).text().trim()
                                myObj['TargetBuy'] = $(z).find('td').eq(2).text().trim()
                                myObj['TargetSell'] = $(z).find('td').eq(3).text().trim()
                                rate.push(myObj)
                                data = []
                                data = [myObj['Date'], myObj['CountryFlag'], myObj['BaseCurrency'], myObj['BaseValue'], myObj['TargetBuy'], myObj['TargetSell']]

                                comm.push(data)
                            }
                        })
                    }
                    if (twidth == 400) {
                        $(element).find('tr').each(function(x, z) {
                            if (x > 1) {
                                myObj = {}
                                myObj['Date'] = date
                                myObj['CountryFlag'] = $(z).find('td').eq(0).find('span').attr('class')
                                myObj['BaseCurrency'] = $(z).find('td').eq(0).text().trim()
                                myObj['BaseValue'] = $(z).find('td').eq(1).text().trim()
                                myObj['TargetBuy'] = $(z).find('td').eq(2).text().trim()
                                myObj['TargetSell'] = $(z).find('td').eq(3).text().trim()
                                rate.push(myObj)
                                data = []
                                data = [myObj['Date'], myObj['CountryFlag'], myObj['BaseCurrency'], myObj['BaseValue'], myObj['TargetBuy'], myObj['TargetSell']]

                                comm.push(data)
                            }
                        })
                    }
                })

                handleDisconnect()

                var sql = "CREATE TABLE IF NOT EXISTS forex (id INT AUTO_INCREMENT PRIMARY KEY, date VARCHAR(255), flag VARCHAR(255), currency VARCHAR(255), unit VARCHAR(255), buying VARCHAR(255), selling VARCHAR(255))";

                con.query(sql, function(err, result) {
                    if (err) throw err;
                    console.log("Table created")
                })

                var sql = "INSERT INTO forex (date, flag, currency, unit, buying, selling) VALUES ?";
                con.query(sql, [comm], function(err, result) {
                    if (err) throw err
                    console.log("Number of records inserted: " + result.affectedRows)
                })

                con.end()
            })

    },
    /*onComplete: function() {
      console.log('Inserted one data')
    },*/
    start: false, // Autostart set to true
    timeZone: 'Asia/Kathmandu' // Timezone set to Asia/Kathmandu
})

commodityCron.start();
forexCron.start();
/*commodityCron.stop();
forexCron.stop();*/


/* GET scrape listing. */
router.get('/', function(req, res, next) {

    res.render('npfc', { title: 'Cron Running' });

})

module.exports = router