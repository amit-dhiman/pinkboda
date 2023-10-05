const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminCtrl');
const CONFIG = require('../config/scope')
// require('./users')(router);
const {verify_token,upload} =require('../libs/commonFunc');



/* GET home page. */
router.get('/addAdmin', adminCtrl.addAdmin);
router.post('/admin/login', adminCtrl.login);
router.post('/admin/changePassword', adminCtrl.changePassword);
// ,upload.single('image')
router.put('/admin/editProfile',adminCtrl.editProfile);

router.get('/admin/renderIndex', adminCtrl.renderIndex);

router.get('/admin/renderRider', adminCtrl.renderRider);



router.get('/admin/getAllDrivers',adminCtrl.getAllDrivers);
router.get('/admin/getAllRiders',verify_token(CONFIG.SCOPE.admins), adminCtrl.getAllRiders);
router.post('/admin/actionOnDriver',verify_token(CONFIG.SCOPE.admins), adminCtrl.actionOnDriver);




module.exports = router;
