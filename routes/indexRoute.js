const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userCtrl');

const CONFIG = require('../config/scope')
// require('./users')(router);
const {signupUserValid,loginUserValid,changePasswordValid,socialloginUserValid,editUserValid,} = require('../config/joiValidations');

const {verify_token} =require('../libs/commonFunc');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('------------');
  res.render('index', { title: 'Express' });
});



router.post('/user/numberLogin', userCtrl.numberLogin);

router.put('/user/verifyOtp', verify_token(CONFIG.SCOPE.users), userCtrl.verifyOtp);


router.get('/logout', verify_token(CONFIG.SCOPE.users),userCtrl.logout);

router.get('/get-userProfile', verify_token(CONFIG.SCOPE.users), userCtrl.userProfile);

router.put('/edit-userProfile', verify_token(CONFIG.SCOPE.users),editUserValid, userCtrl.editUserProfile);







module.exports = router;

