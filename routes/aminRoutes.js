const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminCtrl');
const CONFIG = require('../config/scope')
// require('./users')(router);
const {verify_token,upload} =require('../libs/commonFunc');



/* GET home page. */
router.get('/addAdmin', adminCtrl.addAdmin);
router.post('/admin/login', adminCtrl.login);
router.post('/admin/changePassword',verify_token(CONFIG.SCOPE.admins), adminCtrl.changePassword);


router.get('/admin/getAllUsers',verify_token(CONFIG.SCOPE.admins), adminCtrl.getAllUsers);

router.get('/admin/getAllDrivers',verify_token(CONFIG.SCOPE.admins), adminCtrl.getAllDrivers);

router.get('/admin/getAllRiders',verify_token(CONFIG.SCOPE.admins), adminCtrl.getAllRiders);




module.exports = router;
