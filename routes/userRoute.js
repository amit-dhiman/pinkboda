const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userCtrl');

const CONFIG = require('../config/scope')
// require('./users')(router);
const {signupUserValid,editUserValid,bookRideRideValid} = require('../config/joiValidations');

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

router.post('/user/calc-ride-amount', verify_token(CONFIG.SCOPE.users), userCtrl.calcRideAmount);

router.post('/user/book-ride', verify_token(CONFIG.SCOPE.users),bookRideRideValid,userCtrl.bookRide);

router.post('/user/cancel-ride', verify_token(CONFIG.SCOPE.users),userCtrl.cancelRide);

router.get('/user/find-previous-ride', verify_token(CONFIG.SCOPE.users),userCtrl.findPreviousRide);

router.get('/user/findNearbyDrivers',userCtrl.findNearbyDrivers);







// const latitude = 28.626137
// const longitude = 79.821602
// const distance = 1;

// const haversine = `(
// //     6371 * acos(
// //         cos(radians(${latitude}))
// //         * cos(radians(latitude))
// //         * cos(radians(longitude) - radians(${longitude}))
// //         + sin(radians(${latitude})) * sin(radians(latitude))
// //     )
// // )`;

// const users = await User.findAll({
//     attributes: [
//         'id',
//         [sequelize.literal(haversine), 'distance'],
//     ],
//     where: {
//         [Op.and]: [
//             sequelize.where(sequelize.literal(haversine), '<=', distance),
//             { status: true }
//         ]
//     },
//     order: sequelize.col('distance'),
//     limit: 5
// });












module.exports = router;


