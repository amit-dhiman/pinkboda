const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userCtrl');

const CONFIG = require('../config/scope')
// require('./users')(router);
const {signupUserValid,editUserValid,} = require('../config/joiValidations');

const {verify_token} =require('../libs/commonFunc');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('------------');
  res.render('index', { title: 'Express' });
});


router.post('/user/numberSignup', signupUserValid, userCtrl.numberSignup )

router.post('/user/numberLogin', userCtrl.numberLogin);

router.put('/user/verifyOtp', verify_token(CONFIG.SCOPE.users), userCtrl.verifyOtp);


router.get('/user/logout', verify_token(CONFIG.SCOPE.users),userCtrl.logout);

router.get('/user/get-Profile', verify_token(CONFIG.SCOPE.users), userCtrl.userProfile);

router.put('/user/edit-Profile', verify_token(CONFIG.SCOPE.users),editUserValid, userCtrl.editUserProfile);





module.exports = router;

