var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var aboutRouter = require('./routes/about');
var termsOfUseRouter = require('./routes/terms-of-use');
var disclaimerRouter = require('./routes/disclaimer');
var forexRouter = require('./routes/forex');
var forexCronRouter = require('./routes/forex-cron');
var commodityRouter = require('./routes/commodity');
var commodityCronRouter = require('./routes/commodity-cron');
var todayspriceRouter = require('./routes/todaysprice');
var todayspriceCronRouter = require('./routes/todaysprice-cron');
var stockliveRouter = require('./routes/stocklive');
var cronRouter = require('./routes/npfc');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/terms-of-use', termsOfUseRouter);
app.use('/disclaimer', disclaimerRouter);
app.use('/forex', forexRouter);
app.use('/forex-cron', forexCronRouter);
app.use('/commodity', commodityRouter);
app.use('/commodity-cron', commodityCronRouter);
app.use('/todaysprice', todayspriceRouter);
app.use('/todaysprice-cron', todayspriceCronRouter);
app.use('/stocklive', stockliveRouter);
app.use('/npfc', cronRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
