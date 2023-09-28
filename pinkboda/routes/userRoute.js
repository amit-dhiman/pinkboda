const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userCtrl');

const CONFIG = require('../config/scope')
// require('./users')(router);
const {signupUserValid,editUserValid,bookRideValid,sendMsgValid,reportValid,ratingValid,supportValid,calcAmountValid} = require('../config/joiValidations');

const {verify_token,upload} =require('../libs/commonFunc');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('-----userRoute------');
  res.render('index', { title: 'Express' });
});


router.post('/user/numberSignup', signupUserValid, userCtrl.numberSignup )

router.post('/user/numberLogin', userCtrl.numberLogin);

router.get('/user/logout', verify_token(CONFIG.SCOPE.users),userCtrl.logout);

router.get('/user/get-Profile', verify_token(CONFIG.SCOPE.users), userCtrl.userProfile);

router.put('/user/edit-Profile',verify_token(CONFIG.SCOPE.users),editUserValid,upload.single('image'),userCtrl.editUserProfile);

router.get('/user/deleteAccount', verify_token(CONFIG.SCOPE.users),userCtrl.deleteUserAccount);

router.post('/user/calcRideAmount', calcAmountValid, verify_token(CONFIG.SCOPE.users), userCtrl.calcRideAmount);

router.post('/user/book-ride', verify_token(CONFIG.SCOPE.users),bookRideValid,userCtrl.bookRide);

router.post('/user/cancel-ride',verify_token(CONFIG.SCOPE.users),userCtrl.cancelRide);

router.get('/user/find-previous-ride',verify_token(CONFIG.SCOPE.users),userCtrl.findPreviousRide);

// router.get('/user/findNearbyDrivers',verify_token(CONFIG.SCOPE.users),userCtrl.findNearbyDrivers);

router.post('/user/sendMessage',verify_token(CONFIG.SCOPE.users),sendMsgValid, userCtrl.sendMessage);

router.get('/user/getAllMessages',verify_token(CONFIG.SCOPE.users), userCtrl.getAllMessages);

router.post('/user/reportOnDriver',verify_token(CONFIG.SCOPE.users),reportValid, userCtrl.reportOnDriver);

router.post('/user/giveRating',verify_token(CONFIG.SCOPE.users),ratingValid, userCtrl.giveRating);

router.post('/user/support',verify_token(CONFIG.SCOPE.users),supportValid, userCtrl.support);

router.get('/user/getNotifications',verify_token(CONFIG.SCOPE.users), userCtrl.getNotifications);

router.get('/user/clearNotifications',verify_token(CONFIG.SCOPE.users), userCtrl.clearNotifications);

router.get('/user/getMyRides',verify_token(CONFIG.SCOPE.users), userCtrl.getMyRides);

router.get('/user/getSingleRide',verify_token(CONFIG.SCOPE.users), userCtrl.getSingleRide);

router.get('/user/getOffers',verify_token(CONFIG.SCOPE.users), userCtrl.getOffers);









module.exports = router;


