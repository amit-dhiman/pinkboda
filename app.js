const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('./models/db');
const indexRouter = require('./routes/indexRoute');
const driverRouter = require('./routes/drivers/index');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter, driverRouter.driverRoutes);
// app.use('/driver', driverRouter.driverRoutes);


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  throw err;
  // render the error page
  // res.status(err.status || 500).json(err);
  // res.render('error');
});

module.exports = app;
