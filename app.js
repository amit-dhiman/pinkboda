const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('./models/db');
const Admin = require('./models/index').admins;
const Router = require('./routes/index');
const cors = require('cors');
let session = require('express-session')
require('dotenv').config();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  cookie: {},           //   maxAge: 24 * 60 * 1 * 60 * 1000 
  secret: process.env.admin_secretKey,
  resave: false,
  saveUninitialized: true
}))

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

 

(async () => {
  try {
    const existingAdmins = await Admin.findAll();

    if (existingAdmins.length === 0) {
      // If the Admin table is empty, populate it with static email data
      await Admin.create({ email: 'admin@pinkboda.com',password:'admin' });
      console.log('Admin data populated successfully.');
    } else {
      // console.log('Admin data already exists.');
    }
  } catch (error) {
    console.error('Error:', error);
  } 
})();




module.exports = app;
