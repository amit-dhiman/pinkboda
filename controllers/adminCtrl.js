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

const login = async(req, res) => {
  try {
    const {email,password,device_type,device_token} = req.body;
    
    if (!email || !password) return res.status(400).json({code:400,message:"email, password is Required"});

    const getData = await libs.getData(db.admins,{where:{email:email}});
    if (getData) {
      let checkPswrd = await commonFunc.compPassword(password, getData.password)
      if(!checkPswrd){
        if(getData.password != password){
          res.status(400).json({code:400,message:"password not match"})
        }
      }

      let token_info = { id: getData.id, email: getData.email };
      if (device_type) { token_info.device_type = device_type }
      if (device_token) { token_info.device_token = device_token }
      
      let token= await commonFunc.generateAccessToken(getData, token_info, process.env.admin_secretKey);
      if(token.image){
      token.image = `${process.env.admin_image_baseUrl}/${token.image}`
      }

      return SUCCESS.DEFAULT(res, "logged in", token);
    } 
    else {
      res.status(400).json({code:400,message:"email not found"})
      }
  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
  }
};

const renderProfile = async (req, res) => {
  try {
    let getAdminData = await libs.getData(db.admins,{});
    res.render('profile',{
    // res.status(200).json({ message: 'Status toggled successfully', 
    data: getAdminData});
  } catch (err) {
    console.log('---err---',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};

const getEditProfilePage = async (req, res) => {
  try {
    let getData= await libs.getData(db.admins,{});
    // res.status(200).json({
    res.render('edit-profile' , {
      data: getData,
    });
  
  } catch (err) {
    res.status(500).json({code:500,message:"password not match"})
  }
};


const editProfile = async (req, res,next) => {
  try {
    let getData= await libs.getData(db.admins,{});

    const {admin_name, admin_email, device_token} = req.body;
    let update = {};

    // // await commonFunc.upload(req,res,next);

    if (admin_name) { update.full_name = admin_name }
    if (admin_email) { update.email = admin_email }
    if (device_token) { update.device_token = device_token }

    if(req.file){
      if(getData.profile_image){
        fs.unlink(`${process.env.admin_image_baseUrl}${getData.profile_image}`,(err)=>{if(err)return})
      }
      update.profile_image= req.file.filename
    };
    
    const editProfile = await libs.updateData(getData, update);
    if(editProfile.profile_image){
      editProfile.profile_image = `${process.env.admin_image_baseUrl}${editProfile.profile_image}`
    }
    console.log('-----editProfile---------',editProfile);
    // res.status(200).json({
    res.status(200).redirect('/admin/renderProfile')
    // res.render('profile',{
    //   data: editProfile
    // })
  } catch (err) {
    console.log('-----err-----',err);
    if(req.file){ fs.unlink(req.file.path, (err)=>{if (err) return})}
    ERROR.ERROR_OCCURRED(res, err);
  }
};

const getChangePasswordPage = async (req, res) => {
  try {
    
    res.render('change_password')

  } catch (err) {
      console.log('-------er-----',err);
    return res.status(500).json({code:500,message:err.message,error:err})
  }
};

//  -------------- changePassword is Not Working Please cehck it first from ejs(not getting data rom ejs) --------------------

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    // const userId = req.creds.id;
    
    console.log('---------req.body--------',req.body);
    console.log('---------newPassword-------',req.body.newPassword);
    
    if(newPassword != confirmPassword){return res.status(404).json({code:400, message:'old password and new password doesnt matched'});}
    console.log('----------2----------',newPassword != confirmPassword);

    const getData = await libs.getData(db.admins, {});

    if (!getData) {
      return res.status(404).json({code:400, message: 'Data not found' });
    }
    
    const passwordMatches = await commonFunc.compPassword(oldPassword,getData.password);
    if(!passwordMatches){
      if(getData.password != oldPassword){
        return res.status(400).json({code:400,message:"password not match"})
      }
    }
    let newhashPassword = await commonFunc.securePassword(newPassword);

    let upatedData= await libs.updateData(getData, {password:newhashPassword});

    return res.status(200).json({code:200, 
      data: upatedData,

    });
  } catch (err) {
    console.log('-------er-----',err);
    return res.status(500).json({code:500,message:err.message,error:err})
  }
};


const logout = async (req, res) => {
    try {
      //  add session here
        const logoutUser = await libs.updateData(req.creds,{access_token:null});
        if(!logoutUser){
          res.status(400).json({code:400,message:"no user ound with this token"})
        }

        return SUCCESS.DEFAULT(res,logoutUser);
    } catch (err) {
        res.status(5).json({code:500,message:"password not match"})
    }
};


// render full index.ejs
const renderIndex = async (req, res) => {
  try {

    // Change this to session and then remove getAdmin.

    let getAdmin = await libs.getData(db.admins,{});

    let skp = req.body.skip || 0;
    // let query= {where:{},limit:10,offset:skp};
    let query= {where:{is_admin_verified:"accepted"}};
    let getDrivers = await libs.getAllData(db.drivers,query,skp);
    
    let drivers = getDrivers.map(driver => {
      let modifiedDriver = { ...driver.toJSON()};
      modifiedDriver.role = 'Driver';
      modifiedDriver.profile_image= `${process.env.driver_imageUrl_ejs}${modifiedDriver.profile_image}`
      return modifiedDriver;
    });

    let getRiders= await libs.getAllData(db.users,{},skp);

    let riders = getRiders.map(rider => {
      let modifiedRider = { ...rider.toJSON() };
      modifiedRider.role = 'Rider';
      modifiedRider.image= `${process.env.user_imageUrl_ejs}${modifiedRider.image}`
      return modifiedRider;
    });

    // res.status(200).json({code:200,message:"ALL Drivers and Riders",
    res.render('index',{

      getRiders: riders,
      getDrivers: drivers,
      getAdmin: getAdmin,
      totalUsers:[...drivers,...riders],

      userImageUrl: process.env.user_imageUrl_ejs,
      driverImageUrl : process.env.driver_imageUrl_ejs
    });

  } catch (err) {
    console.log('-----err-----',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};

const renderRider = async (req, res) => {
  try {
    let skp = req.body.skip || 0;
    // let query= {where:{},limit:10,offset:skp};
    let query= {};

    let getRiders = await libs.getAllData(db.users,query,skp);
    
    // res.status(200).json({code:200,message:"getRiders",
    res.render('riders',{
      getRiders: getRiders,
      userImageUrl: process.env.user_imageUrl_ejs
    });
  } catch (err) {
    console.log('----err----',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
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
      driverImageUrl : process.env.driver_imageUrl_ejs
    });

  } catch (err) {
    console.log('-----err------',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const actionOnDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    let query = {where:{id:driverId}}
    console.log('-------query--------',query);
    const driver = await libs.getData(db.drivers,query);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    driver.action = driver.action === 'Enable' ? 'Disable' : 'Enable';
    await driver.save();
    // console.log('-----------driver---------',driver);
    res.status(200).send(driver.action);
    // res.status(200).json({ message: 'Status toggled successfully', data:driver.action  });
  } catch (err) {
    console.log('---err---',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const actionOnUser = async (req, res) => {
  try {
    const { riderId } = req.params;
    let query = {where:{id:riderId}}
    console.log('-------query--------',query);
    const rider = await libs.getData(db.users,query);
    if (!rider) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    rider.action = rider.action === 'Enable' ? 'Disable' : 'Enable';
    await rider.save();
    // res.status(200).send(rider.action);
    res.status(200).json({ message: 'Status toggled successfully', data:rider.action  });
  } catch (err) {
    console.log('---err---',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
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
        console.log('----------1--------',`${process.env.driver_image_baseUrl}${getData[key]}`);
        fs.unlink(`${process.env.driver_image_baseUrl}${getData[key]}`,(err)=>{if(err){return err}})
        updateRequest = await libs.destroyData(getData,{force:true});
      }
    }
    
    res.status(200).send(updateRequest);
    // res.status(200).json({message:'Status toggled successfully', data:updateRequest});
  } catch (err) {
    console.log('---err---',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
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
       
    // res.status(200).json({message:'Status toggled successfully',
    res.render('help&support',{
     supportData: combinedData,
     driverImageUrl : process.env.driver_imageUrl_ejs,
     userImageUrl: process.env.user_imageUrl_ejs
    });
  } catch (err) {
    console.log('---------err--------',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};

const resolvedIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    let query = {where:{id: issueId}}

    const getSupport = await libs.getData(db.supports,query);
    if (!getSupport) {
      return res.status(404).json({error: 'Issue not found'});
    }

    if(getSupport.issue_status == 'Unselected'){
      getSupport.issue_status = 'Resolved'
    }
    await getSupport.save();
    // console.log('-----------getSupport---------',getSupport);
    return res.status(200).json({ message:'Issue resolved successfully',data: getSupport.issue_status  })
  } catch (err) {
    res.status(500).json({code:500,message:"Internal server Error"})
  }
}

const massPushPage = async (req, res) => {
  try {
    res.render('mass_push');
    
  } catch (err) {
    console.log('----err----',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const sendMassPush = async (req, res) => {
  try {
    const {role,title,description} = req.body;

    let getUsers = await libs.getAllData(db.users, {});
    let getDrivers = await libs.getAllData(db.drivers, {});

    let data={
      title: title,
      description: description
    }

    let driversData = [];
    let usersData = [];

    let driverDeviceTokens = [];
    let userDeviceTokens = [];

    for(let key of getDrivers){
      driversData.push({
        driver_id: key.id,
        title: title,
        description: description
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

    // console.log('-----------driversData-----------',driversData);
    // console.log('-------------usersData-----------',usersData);
    // console.log('-----------driverDeviceTokens-----------',driverDeviceTokens);
    // console.log('-----------userDeviceTokens-----------',userDeviceTokens);

    let saveDriverData = null;
    let saveRiderData = null;

    if(role == 'Driver'){
      Notify.sendNotifyToDriver(data,driverDeviceTokens);  
      saveDriverData = await libs.createData(db.notifications, driversData);
    }else if(role == "Rider"){
      Notify.sendNotifyToUser(data, userDeviceTokens);
      saveRiderData = await libs.createData(db.notifications, usersData);
    }else{
      Notify.sendNotifyToUser(data, userDeviceTokens)
      Notify.sendNotifyToDriver(data,driverDeviceTokens)

      saveRiderData = await libs.createData(db.notifications, usersData);
      saveDriverData = await libs.createData(db.notifications, driversData);
    }
    // res.status(200).json({message:"notifications send",saveRiderData,saveDriverData})
    // res.status(200).send({message:"notifications send"});
    res.redirect('/admin/massPushPage');

  } catch (err) {
    console.log('-----err-----',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};





module.exports= {addAdmin,login,getChangePasswordPage,changePassword,logout,renderIndex,actionOnDriver,getEditProfilePage,editProfile,renderRider,renderDriver,actionOnUser,pendingRequests,renderHelpSupport,renderProfile,resolvedIssue, massPushPage, sendMassPush}
