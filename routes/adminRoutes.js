const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminCtrl');
const CONFIG = require('../config/scope')
// require('./users')(router);
const {verify_token,upload,admin_upload,admin_auth} =require('../libs/commonFunc');
const {signupDriverValid,editdriverValid,reportValid,supportValid,adminChangePswrValid} = require('../config/joiValidations');


/* GET home page. */
router.get('/addAdmin', adminCtrl.addAdmin);

router.get('/sessionData', (req,res)=>{
    res.status(200).json({sessionData:req.session.admin, cookieData: req.cookies});
    // res.status(200).json({data:req.session});
});

router.get('/admin/login', adminCtrl.getloginPage);
router.post('/admin/login', adminCtrl.login);

router.get('/admin/logout',admin_auth, adminCtrl.logout);

router.get('/admin/getChangePasswordPage',admin_auth, adminCtrl.getChangePasswordPage);
router.post('/admin/changePassword', adminChangePswrValid, admin_auth, adminCtrl.changePassword);

// router.get('/admin/forgotPassword', adminCtrl.getForgotPswrdPage);
// router.post('/admin/forgotPassword', adminCtrl.forgotPassword);


router.get('/admin/renderProfile', admin_auth, adminCtrl.renderProfile);

router.get('/admin/getEditProfilePage',admin_auth, adminCtrl.getEditProfilePage);
router.post('/admin/editProfile',admin_auth, admin_upload.single('profile_image'), adminCtrl.editProfile);

router.get('/admin/renderRider', admin_auth, adminCtrl.renderRider);

router.get('/admin/renderDriver', admin_auth, adminCtrl.renderDriver);
// router.get('/admin/renderDriver', adminCtrl.renderDriver);

router.get('/admin/actionOnDriver/:driverId', admin_auth, adminCtrl.actionOnDriver);
router.get('/admin/actionOnUser/:riderId', admin_auth, adminCtrl.actionOnUser);

router.get('/admin/pendingRequests', admin_auth, adminCtrl.pendingRequests);

router.get('/admin/renderHelpSupport', admin_auth, adminCtrl.renderHelpSupport);
router.get('/admin/termsAndConditions', adminCtrl.termsAndConditions);

router.get('/admin/resolvedIssue/:issueId', admin_auth, adminCtrl.resolvedIssue); 

router.get('/admin/massPushPage', admin_auth, adminCtrl.massPushPage); 

router.post('/admin/sendMassPush', admin_auth, adminCtrl.sendMassPush); 





module.exports = router;
