const express = require('express');
const router = express.Router();
const driverCtrl = require('../../controllers/drivers/driverControllers');
const CONFIG = require('../../config/scope')

const {signupDriverValid} = require('../../config/joiValidations');
const {verify_token,upload} =require('../../libs/commonFunc');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('-----driver-------');
  res.render('index', { title: 'driver' });
});


// router.post('/driver/Signup', signupDriverValid, driverCtrl.driverSignup);

router.post('/driver/Signup', signupDriverValid,upload.fields([{name:'license',maxCount:1},{name:'id_card',maxCount:1},{name:'passport_photo',maxCount:1},{name:'vechile_insurance',maxCount:1}]), driverCtrl.driverSignup);

// router.post('/driver/login', driverCtrl.login);

// router.put('/driver/verifyOtp', verify_token(CONFIG.SCOPE.drivers), driverCtrl.verifyOtp);

// router.get('/driver/logout', verify_token(CONFIG.SCOPE.drivers),driverCtrl.logout);

// router.get('/driver/get-Profile', verify_token(CONFIG.SCOPE.drivers), driverCtrl.driverProfile);

// router.put('/driver/edit-Profile', verify_token(CONFIG.SCOPE.drivers),editdriverValid, driverCtrl.editdriverProfile);

// router.post('/driver/find-ride', verify_token(CONFIG.SCOPE.drivers),findRideValid, driverCtrl.findRide);




module.exports = router;


