const db = require('../models/index');
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
require('dotenv').config();
const CONFIG = require('../config/scope');
const ERROR= require('../config/responseMsgs').ERROR;
const SUCCESS= require('../config/responseMsgs').SUCCESS;
const Notify = require('../libs/notifications');
const fs = require('fs');

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

const editProfile = async (req, res,next) => {
  try {
    const adminData = req.creds;
    console.log('---------adminData----------',adminData);
    const {device_type,device_token,gender,username} = req.body;
    console.log('=====body=======',req.body);
    console.log('======---file---======',req.file);
    // let update = {};

    // // await commonFunc.upload(req,res,next);

    // if (username) { update.username = username }
    // if (gender) { update.gender = gender }
    // if (device_type) { update.device_type = device_type }
    // if (device_token) { update.device_token = device_token }
    // if(req.file){
    //   if(userData.image){
    //     fs.unlink(`${process.env.user_image_baseUrl}${userData.image}`,(err)=>{if(err)return})
    //   }
    //   update.image= req.file.filename
    // };
    // console.log('-----update------',update);
    
    // const editProfile = await libs.updateData(userData, update);
    // if(editProfile.image){
    //   editProfile.image = `${process.env.user_image_baseUrl}${editProfile.image}`
    // }

    return SUCCESS.DEFAULT(res,"profile updated successfully", editProfile);
  } catch (err) {
    if(req.file){ fs.unlink(req.file.path, (err)=>{if (err) return})}
    ERROR.ERROR_OCCURRED(res, err);
  }
};


const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword,confirmPassword } = req.body;
    const userId = req.creds.id;

    if(newPassword != confirmPassword) return res.status(404).json({code:400, message:'old password and new password doesnt matched'});

    const getData = await db.admins.findByPk(userId);
    if (!getData) {
      return res.status(404).json({code:400, message: 'Data not found' });
    }
    
    const passwordMatches = await commonFunc.compPassword(oldPassword,getData.password);
    if(!passwordMatches){
      if(getData.password != oldPassword){
          res.status(400).json({code:400,message:"password not match"})
      }
  }
    let newhashPassword = await commonFunc.securePassword(newPassword);

    let upatedData= await libs.updateData(getData, {password:newhashPassword});

    return SUCCESS.DEFAULT(res,upatedData);
  } catch (err) {
      console.log('-------er-----',err);
    return res.status(500).json({code:500,message:err.message,error:err})
  }
};

const logout = async (req, res) => {
    try {
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
    let skp = req.body.skip || 0;
    // let query= {where:{},limit:10,offset:skp};
    let query= {where:{is_admin_verified:"accepted"}};
    let getDrivers = await libs.getAllData(db.drivers,query,skp);
    
    let drivers = getDrivers.map(driver => {
      let modifiedDriver = { ...driver.toJSON() };
      modifiedDriver.role = 'Driver';
      return modifiedDriver;
    });

    let getRiders= await libs.getAllData(db.users,{},skp);

    let riders = getRiders.map(rider => {
      let modifiedRider = { ...rider.toJSON() };
      modifiedRider.role = 'Rider';
      return modifiedRider;
    });

    // res.status(200).json({code:200,message:"ALL Drivers and Riders",
    res.render('index',{
      getRiders: riders,
      getDrivers: drivers,
      totalUsers:[...drivers,...riders],
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
      userImageUrl: process.env.user_image_baseUrl

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
    // let getData= await libs.getAllData(db.supports,{
    //   include: [
    //     {model: db.users,attributes: ["username","image","mobile_number"]},
    //     {model: db.drivers,attributes: ["username","profile_image","mobile_number"]},
    //   ]
    // });
    
    const usersData = await db.supports.findAll({
      include: [{model: db.users, attributes: ["id","username", "image", "mobile_number"]}]
    });
    
    const driversData = await db.supports.findAll({
      include: [{model: db.drivers,attributes: ["id","username", "profile_image", "mobile_number"]}]
    });
  
    // For example, combine usersData and driversData into a single array
    const combinedData = usersData.concat(driversData);
       
    // res.status(200).json({message:'Status toggled successfully',
    res.render('help&support',{
     supportData: combinedData});
  } catch (err) {
    console.log('---------err--------',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};





module.exports= {addAdmin,login,changePassword,logout,renderIndex,actionOnDriver,editProfile,renderRider,renderDriver,actionOnUser,pendingRequests,renderHelpSupport, }
