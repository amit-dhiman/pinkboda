const db = require('../models/index');
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
require('dotenv').config();
const CONFIG = require('../config/scope');
const ERROR= require('../config/responseMsgs').ERROR;
const SUCCESS= require('../config/responseMsgs').SUCCESS;
const Notify = require('../libs/notifications');
const fs = require('fs');
const {Op} = require('sequelize');


const addAdmin = async(req, res) => {
  console.log('-----/admin Routes------');
  let findAdmin = await db.admins.findOne({where:{email:"admin@pinkboda.com"}});
  if (!findAdmin){
    findAdmin = await db.admins.create({email:"admin@pinkboda.com",password:"admin"})
  }
  res.render('index', { title: findAdmin.email });
}

const getloginPage = async (req, res) => {
  try {
    const { pinkbodaToken } = req.cookies;

    if (pinkbodaToken) {
      console.log('---------req.cookies getLogin---------',req.cookies);
      const user = await libs.getData(db.admins,{where:{access_token: pinkbodaToken}});
      if (user) {
        res.render('login',{email:user.email, password:user.password});
        return;
      }
    }
    console.log('--------login--------------');
    res.render('login',{email:'',password:''});
  } catch (err) {
    console.log('----err----',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const login = async(req, res) => {
  try {
    console.log('----------body---post----------',req.body);
    const {email,password,rememberMe} = req.body;
    
    const getData = await libs.getData(db.admins,{where:{email:email}});
    if (getData) {
      let checkPswrd = await commonFunc.compPassword(password, getData.password)
      if(!checkPswrd){
        if(getData.password != password){
          // return res.status(400).json({code:400,message:"Incorrect Password"})
          // alert('Incorrect Password')
          return res.redirect('/admin/login');
        }
      }
      req.session.admin = getData.toJSON();
      req.session.role = "admin";
      const token = await commonFunc.generateAccessToken(getData,{email:email},process.env.admin_secretKey);

      if (rememberMe) {
        res.cookie('pinkbodaToken', token.access_token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true });
      }else{
        res.clearCookie('pinkbodaToken');
      }
      res.redirect('/admin/renderIndex');
      return;
    } 
    else {
      return res.redirect('/admin/login');
    }
  } catch (err) {
    console.log('-----log err-----',err);
    return res.redirect('/admin/login');
  }
};


const renderProfile = async (req, res) => {
  try {
    // let getAdminData = await libs.getData(db.admins,{});
    let getAdminData = req.session.admin;
    // getAdminData.profile_image = `${process.env.admin_imageUrl_ejs}${getAdminData.profile_image}`;
    res.render('profile',{
    // res.status(200).json({ message: 'Status toggled successfully', 
    getAdmin: getAdminData});
  } catch (err) {
    console.log('---err---',err);
    return res.redirect('/admin/login');
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const getEditProfilePage = async (req, res) => {
  try {
    let getData= await libs.getData(db.admins,{});
    // res.status(200).json({
    res.render('edit-profile' ,{getAdmin: getData});
  
  } catch (err) {
    return res.redirect('/admin/login');
    res.status(500).json({code:500,message:"password not match"})
  }
};

const editProfile = async (req, res,next) => {
  try {
    let getData= await libs.getData(db.admins,{});
    // let getData = req.session.admin;

    const {admin_name, admin_email} = req.body;
    let update = {};

    if (admin_name) { update.full_name = admin_name }
    // if (admin_email) { update.email = admin_email }

    if(req.file){
      if(getData.profile_image){
        fs.unlink(`${process.env.admin_image_baseUrl}${getData.profile_image}`,(err)=>{if(err)return})
      }
      update.profile_image= req.file.filename
    };
    
    const editProfile = await libs.updateData(getData,update);
    // const editProfile = await libs.findAndUpdate(db.admins, req.session.admin.id, update);
    if(editProfile.profile_image){
      req.session.admin.profile_image = editProfile.profile_image
      // editProfile.profile_image = `${process.env.admin_imageUrl_ejs}${editProfile.profile_image}`;
    }
    // res.status(200).json({
    // res.status(200).redirect('/admin/renderProfile')
    res.render('profile',{
      getAdmin: editProfile
    })
  } catch (err) {
    console.log('-----err-----',err);
    if(req.file){ fs.unlink(req.file.path, (err)=>{if (err) return})}
    return res.redirect('/admin/login');
    ERROR.ERROR_OCCURRED(res, err);
  }
};


const getChangePasswordPage = async (req, res) => {
  try {
    
    res.render('change_password',{getAdmin:req.session.admin})

  } catch (err) {
    console.log('-------er-----',err);
    return res.redirect('/admin/login');
  }
};


const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    // const userId = req.creds.id;

    if(newPassword != confirmPassword){
      alert('old password and new password doesnt matched')
      return res.redirect('/admin/getChangePasswordPage');
    }

    const getData = await libs.getData(db.admins, {});
        
    const passwordMatches = await commonFunc.compPassword(oldPassword,getData.password);
    if(!passwordMatches){
      if(getData.password != oldPassword){
        alert("password doesn't match")
        return res.redirect('/admin/getChangePasswordPage');
      }
    }
    let newhashPassword = await commonFunc.securePassword(newPassword);

    await libs.updateData(getData, {password:newhashPassword});

    return res.redirect('/admin/getChangePasswordPage')
    // return res.status(200).json({code:200,data: upatedData});
  } catch (err) {
    return res.redirect('/admin/getChangePasswordPage')
  }
};


const getForgotPswrdPage = async (req, res) => {
  // try {
  //   res.render('forgot_password');
  // } catch (err) {
  //   console.log('-------er-----',err);
  //   return res.status(500).json({code:500,message:err.message,error:err})
  // }
};

const forgotPassword = async (req, res) => {
//   try {
//     let 
    
//     res.render('forgot_password');
//   } catch (err) {
//     console.log('-------er-----',err);
//     return res.status(500).json({code:500,message:err.message,error:err})
//   }
};

const logout = async (req, res) => {
  try {
    if (req.session.admin) {
      // Destroy the session to log the user out
      req.session.destroy((err) => {
        if (err) {
          res.redirect('/admin/renderProfile');
        } else {
          // res.json({ message: 'Logout successful' });
          // alert('Logout successful')
          return res.redirect('/admin/login');
        }
      });
    } else {return res.redirect('/admin/login')}
  } catch (err) {
    res.redirect("/admin/login")
  }
};


// render full index.ejs
const renderIndex = async (req, res) => {
  try {
    let skp = req.body.skip || 0;
    // let query= {where:{},limit:10,offset:skp};
    let query= {where:{is_admin_verified: "accepted"}};

    let getDrivers = await libs.getAllData(db.drivers,query,skp);
    
    let getRiders= await libs.getAllData(db.users,{},skp);

    // res.status(200).json({code:200,message:"ALL Drivers and Riders",
    res.render('index',{
      getRiders: getRiders,
      getDrivers: getDrivers,
      getAdmin: req.session.admin,
      totalUsers:[...getDrivers,...getRiders],
      userImageUrl: process.env.user_imageUrl_ejs,
      driverImageUrl : process.env.driver_imageUrl_ejs
    });

  } catch (err) {
    console.log('-----err-----',err);
    return res.render('login')
  }
};


const renderRider = async (req, res) => {
  try {
    let skp = req.body.skip || 0;
    // let query= {where:{},limit:10,offset:skp};
    let query= {};

    let getRiders = await libs.getAllData(db.users,query,skp);
    console.log('------getRiders------',getRiders);
    
    // res.status(200).json({code:200,message:"getRiders",
    res.render('riders',{
      getRiders: getRiders,
      userImageUrl: process.env.user_imageUrl_ejs,
      getAdmin: req.session.admin
    });
  } catch (err) {
    console.log('----err----',err);
    return res.render('login')
  }
};

const renderDriver = async (req, res) => {
  try {
    let getDrivers= await libs.getAllData(db.drivers,{where:{is_admin_verified:"accepted"}});
    let getPendingRequests = await libs.getAllData(db.drivers,{where:{is_admin_verified:"pending"}});
    
    // res.status(200).json({code:200,message:"Get all drivers",
    res.render('drivers',{
      getDrivers : getDrivers,
      pendingRequests : getPendingRequests,
      driverImageUrl : process.env.driver_imageUrl_ejs,
      getAdmin: req.session.admin
    });

  } catch (err) {
    console.log('-----err------',err);
    return res.render('login')
  }
};


const actionOnDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    let query = {where:{id:driverId}}
    const driver = await libs.getData(db.drivers,query);
    if (driver) {
      driver.action = driver.action === 'Enable' ? 'Disable' : 'Enable';
      await driver.save();
      return res.status(200).send(driver.action);
      // res.status(200).json({ message: 'Status toggled successfully', data:driver.action});
    }
    return alert('Driver not found');
  } catch (err) {
    console.log('---err---',err);
    return res.render('login')
  }
};


const actionOnUser = async (req, res) => {
  try {
    const { riderId } = req.params;
    let query = {where:{id:riderId}}
    const rider = await libs.getData(db.users,query);
    if (rider) {
      rider.action = rider.action === 'Enable' ? 'Disable' : 'Enable';
      await rider.save();
      res.status(200).json({ message: 'Status toggled successfully', data:rider.action  });
    }
  } catch (err) {
    console.log('---err---',err);
    res.render('login')
  }
};


const pendingRequests = async (req, res) => {
  try {
    const { pendingAction,driverId } = req.query;

    let updateRequest=null;

    if(pendingAction == 'accepted'){
      // send mail to the driver, admin accepted your signup request

      updateRequest = await libs.findAndUpdate(db.drivers,driverId, {is_admin_verified:pendingAction,driving_status:'Online'});
    }else{
      let getData= await libs.getData(db.drivers,{where:{id:driverId}});

      let images=['profile_image','license','id_card','passport_photo','vechile_insurance'];

      for(let key of images){
        fs.unlink(`${process.env.driver_image_baseUrl}${getData[key]}`,(err)=>{if(err){return err}})
        updateRequest = await libs.destroyData(getData,{force:true});
      }
    }
    
    res.status(200).send(updateRequest);
    // res.status(200).json({message:'Status toggled successfully', data:updateRequest});
  } catch (err) {
    res.render('login')
  }
};

const renderHelpSupport = async (req, res) => {
  try {
    const usersData = await libs.getAllData(db.supports,{
      where: {user_id: {[Op.gt]: 0}},
      include: [{model: db.users,attributes:["id","username","image","mobile_number"]}]
    });
    
    const driversData = await libs.getAllData(db.supports,{
      where: {driver_id: {[Op.gt]: 0}},
      include: [{model: db.drivers,attributes:["id","username","profile_image","mobile_number"]}]
    });
    
    // For example, combine usersData and driversData into a single array
    const combinedData = usersData.concat(driversData);
       
    // res.status(200).json({message:'help support data',
    res.render('help&support',{
     supportData: combinedData,
     driverImageUrl : process.env.driver_imageUrl_ejs,
     userImageUrl: process.env.user_imageUrl_ejs,
     getAdmin: req.session.admin
    });
  } catch (err) {
    res.redirect("/admin/login")
  }
};

const resolvedIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    let query = {where:{id: issueId}}

    const getSupport = await libs.getData(db.supports,query);

    if(getSupport.issue_status == 'Unselected'){
      getSupport.issue_status = 'Resolved'
    }
    await getSupport.save();
    // console.log('-----------getSupport---------',getSupport);
    return res.status(200).json({ message:'Issue resolved successfully',data: getSupport.issue_status})
  } catch (err) {
    res.redirect("/admin/login")
  }
}

const massPushPage = async (req, res) => {
  try {
    res.render('mass_push', { getAdmin:req.session.admin});
  } catch (err) {
    console.log('----err----',err);
    res.redirect("/admin/login")
  }
};


const sendMassPush = async (req, res) => {
  try {
    const {role,title,description} = req.body;

    let getUsers = await libs.getAllData(db.users, {});
    let getDrivers = await libs.getAllData(db.drivers, {});

    let data={
      title: title,
      message: description
    }

    let driversData = [];
    let usersData = [];

    let driverDeviceTokens = [];
    let userDeviceTokens = [];

    for(let key of getDrivers){
      driversData.push({
        driver_id: key.id,
        title: title,
        message: description
      })
      if(key.device_token){ driverDeviceTokens.push(key.device_token)}
    }

    for(let key of getUsers){
      usersData.push({
        user_id: key.id,
        title: title,
        message : description
      })
      if(key.device_token){ userDeviceTokens.push(key.device_token)}
    }
    let saveDriverData = null;
    let saveRiderData = null;
    
    if (role === 'Driver' || role === 'Both') {
      Notify.sendNotifyToDriver(data, driverDeviceTokens);
      await libs.createData(db.notifications, driversData);
    }
    if (role === 'Rider' || role === 'Both') {
      Notify.sendNotifyToUser(data, userDeviceTokens);
      await libs.createData(db.notifications, usersData);
    }
    res.redirect('/admin/massPushPage');

  } catch (err) {
    res.redirect("/admin/login")
  }
};





module.exports= {addAdmin,getloginPage,login,getChangePasswordPage,changePassword,getForgotPswrdPage,forgotPassword,logout,renderIndex,actionOnDriver,getEditProfilePage,editProfile,renderRider,renderDriver,actionOnUser,pendingRequests,renderHelpSupport,renderProfile,resolvedIssue, massPushPage, sendMassPush}
