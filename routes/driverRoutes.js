const express = require('express');
const router = express.Router();
const driverCtrl = require('../controllers/driverCtrl');
const CONFIG = require('../config/scope')

const {signupDriverValid,editdriverValid,reportValid,supportValid} = require('../config/joiValidations');
const {verify_token,driver_upload} =require('../libs/commonFunc');

/* GET home page. */
// router.get('/driver', function(req, res, next) {
//   console.log('-----driver-------');
//   res.render('index', { title: 'driver' });
// });


router.post('/driver/Signup', signupDriverValid, driver_upload.fields([{name:'license',maxCount:1},{name:'id_card',maxCount:1},{name:'passport_photo',maxCount:1},{name:'vechile_insurance',maxCount:1}]), driverCtrl.driverSignup);

router.post('/driver/login', driverCtrl.login);

router.get('/driver/logout', verify_token(CONFIG.SCOPE.drivers),driverCtrl.logout);

router.get('/driver/get-profile', verify_token(CONFIG.SCOPE.drivers), driverCtrl.driverProfile);

router.put('/driver/edit-profile', verify_token(CONFIG.SCOPE.drivers),editdriverValid,driver_upload.fields([{name:'license',maxCount:1},{name:'id_card',maxCount:1},{name:'passport_photo',maxCount:1},{name:'vechile_insurance',maxCount:1},{name:'profile_image',maxCount:1}]), driverCtrl.editDriverProfile);

router.get('/driver/delete-account', verify_token(CONFIG.SCOPE.drivers),driverCtrl.deleteDriverAccount);

router.get('/driver/pendingListing', verify_token(CONFIG.SCOPE.drivers),driverCtrl.pendingListing);

router.post('/driver/updateDriversLocation', verify_token(CONFIG.SCOPE.drivers),driverCtrl.updateDriversLocation);

// router.post('/driver/accept-ride', verify_token(CONFIG.SCOPE.drivers),findRideValid, driverCtrl.findRide);
router.post('/driver/cancel-ride',verify_token(CONFIG.SCOPE.drivers),driverCtrl.cancelRide);

router.post('/driver/endRide',verify_token(CONFIG.SCOPE.drivers),driverCtrl.endRide);

router.post('/driver/sendMessage',verify_token(CONFIG.SCOPE.drivers), driverCtrl.sendMessage);

router.get('/driver/getAllMessages',verify_token(CONFIG.SCOPE.drivers), driverCtrl.getAllMessages);

router.post('/driver/reportOnUser',verify_token(CONFIG.SCOPE.drivers),reportValid, driverCtrl.reportOnUser);

router.post('/driver/support',verify_token(CONFIG.SCOPE.drivers),supportValid, driverCtrl.support);

router.get('/driver/getNotifications',verify_token(CONFIG.SCOPE.drivers), driverCtrl.getNotifications);

router.get('/driver/clearNotifications',verify_token(CONFIG.SCOPE.drivers),driverCtrl.clearNotifications);

router.get('/driver/getMyRides',verify_token(CONFIG.SCOPE.drivers), driverCtrl.getMyRides);

router.get('/driver/getSingleRide',verify_token(CONFIG.SCOPE.drivers), driverCtrl.getSingleRide);

router.get('/driver/getTotalRatings',verify_token(CONFIG.SCOPE.drivers), driverCtrl.getTotalRatings);

router.get('/driver/find-previous-ride',verify_token(CONFIG.SCOPE.drivers),driverCtrl.findPreviousRide);



module.exports = router;


