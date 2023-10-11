const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminCtrl');
const CONFIG = require('../config/scope')
// require('./users')(router);
const {verify_token,upload,admin_upload} =require('../libs/commonFunc');



/* GET home page. */
router.get('/addAdmin', adminCtrl.addAdmin);
router.post('/admin/login', adminCtrl.login);

router.get('/admin/getChangePasswordPage', adminCtrl.getChangePasswordPage);
router.post('/admin/changePassword', adminCtrl.changePassword);


router.get('/admin/renderProfile', adminCtrl.renderProfile);

router.get('/admin/getEditProfilePage',adminCtrl.getEditProfilePage);
router.post('/admin/editProfile',admin_upload.single('profile_image'), adminCtrl.editProfile);

router.get('/admin/renderIndex', adminCtrl.renderIndex);

router.get('/admin/renderRider', adminCtrl.renderRider);
router.get('/admin/renderDriver', adminCtrl.renderDriver);



router.get('/admin/actionOnDriver/:driverId', adminCtrl.actionOnDriver);
router.get('/admin/actionOnUser/:riderId', adminCtrl.actionOnUser);

router.get('/admin/pendingRequests', adminCtrl.pendingRequests);

router.get('/admin/renderHelpSupport', adminCtrl.renderHelpSupport);

router.get('/admin/resolvedIssue/:issueId', adminCtrl.resolvedIssue); 

router.get('/admin/massPushPage', adminCtrl.massPushPage); 

router.post('/admin/sendMassPush', adminCtrl.sendMassPush); 





module.exports = router;
