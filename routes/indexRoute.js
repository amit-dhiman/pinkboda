const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userCtrl');

const CONFIG = require('../config/scope')
// require('./users')(router);
const {signupUserValid,editUserValid,findRideValid} = require('../config/joiValidations');

const {verify_token,upload} =require('../libs/commonFunc');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('------------');
  res.render('index', { title: 'Express' });
});


router.post('/user/numberSignup', signupUserValid, userCtrl.numberSignup )

router.post('/user/numberLogin', userCtrl.numberLogin);

router.get('/user/logout', verify_token(CONFIG.SCOPE.users),userCtrl.logout);

router.get('/user/get-Profile', verify_token(CONFIG.SCOPE.users), userCtrl.userProfile);

router.put('/user/edit-Profile',verify_token(CONFIG.SCOPE.users),editUserValid,upload.single('image'),userCtrl.editUserProfile);

router.get('/user/deleteAccount', verify_token(CONFIG.SCOPE.users),userCtrl.deleteUserAccount);


router.post('/user/find-ride', verify_token(CONFIG.SCOPE.users),findRideValid,userCtrl.findRide);


module.exports = router;


