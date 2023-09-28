const db = require('../models/index');
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
require('dotenv').config();
const CONFIG = require('../config/scope');
const ERROR= require('../config/responseMsgs').ERROR;
const SUCCESS= require('../config/responseMsgs').SUCCESS;
const Notify = require('../libs/notifications');


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
    //     fs.unlink(`${process.env.user_image_baseUrl}/${userData.image}`,(err)=>{if(err)return})
    //   }
    //   update.image= req.file.filename
    // };
    // console.log('-----update------',update);
    
    // const editProfile = await libs.updateData(userData, update);
    // if(editProfile.image){
    //   editProfile.image = `${process.env.user_image_baseUrl}/${editProfile.image}`
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
    let query= {};
    let getDrivers = await libs.getAllData(db.drivers,query,skp);
    
    let drivers = getDrivers.map(driver => {
      let modifiedDriver = { ...driver.toJSON() };
      modifiedDriver.role = 'driver';
      return modifiedDriver;
    });

    let getRiders= await libs.getAllData(db.users,query,skp);

    let riders = getRiders.map(rider => {
      let modifiedRider = { ...rider.toJSON() };
      modifiedRider.role = 'rider';
      return modifiedRider;
    });


    // res.status(200).json({code:200,message:"ALL Drivers and Riders",
    res.render('index',{
      allUsers_url:`${ process.env.local_url_ejs}`,
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

    let getDrivers = await libs.getAllData(db.drivers,query,skp);
    
    // res.status(200).json({code:200,message:"getDrivers",
    res.render('riders',{
      getDrivers: getDrivers,
      riders_url:`${ process.env.local_url_ejs}`,

    });
  } catch (err) {
    console.log('----err----',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};



const getAllDrivers = async (req, res) => {
  try {
    let getDrivers= await libs.getAllData(db.drivers,{});
    res.render('index',{getDrivers:getDrivers})
    // res.status(200).json({code:200,message:"Get all drivers",data:getDrivers,totalDriver:getDrivers.length});
  } catch (err) {
    console.log('-----err------',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};
const getAllRiders = async (req, res) => {
  try {
    let getRiders= await libs.getAllData(db.users,{})
    res.render('index',{getRiders:getRiders})

    // res.status(200).json({code:200,message:"Get all users",data:getUsers});
  } catch (err) {
    console.log('-----err------',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};
const actionOnDriver = async (req, res) => {
  try {
    let query= req.body.driver_id;
    let saveAction= await libs.findAndUpdate(db.drivers,query,{action:req.body.action});
    res.status(200).json({code:200,message:saveAction.action});
  } catch (err) {
    console.log('---err---',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};



module.exports= {addAdmin,login,changePassword,logout,renderIndex,getAllDrivers,getAllRiders,actionOnDriver,editProfile,renderRider}
