const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('./models/db');
require('./models/index');
const Router = require('./routes/index');
let cors = require('cors');

app.use(cors()); 


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', Router.userRoutes, Router.driverRoutes,Router.adminRoutes);
// app.use('/driver', driverRouter.driverRoutes);
// app.use('/admin', Router.adminRoutes);

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
