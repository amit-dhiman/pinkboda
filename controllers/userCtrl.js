const {Op} = require('sequelize') 
const db = require("../models/index");
const User = db.users;
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
const ERROR = require('../config/responseMsgs').ERROR;
const SUCCESS = require('../config/responseMsgs').SUCCESS;
require('dotenv').config();
const CONFIG = require('../config/scope');
const status= require('http-status-codes');
const fs = require('fs');


const numberSignup = async (req, res) => {
  try {
    let { username, mobile_number,gender, country_code, device_type, device_token,} = req.body;

    const getData = await libs.getData(User, { where: { mobile_number: mobile_number } });

    if (getData) {
      return ERROR.MOBILE_ALREADY_EXIST(res);
    }

    // if (username) { 
    //   const getUsername = await libs.getData(User, {where:{
    //     username: username,     // id: {[Op.not]: userData.id},
    //   }});

    //   if(getUsername){
    //     return ERROR.USER_NAME_ALREADY_EXIST(res);
    //   }
    // }

    let data = {
      username: username,
      mobile_number: mobile_number,
      gender: gender,
      country_code: country_code,
    };

    if (device_type) {data.device_type = device_type }
    if (device_token) {data.device_token = device_token }

    let saveData = await libs.createData(User, data);

    let token_info = { id: saveData.id, mobile_number: saveData.mobile_number };

    let token = await commonFunc.generateAccessToken(saveData, token_info, process.env.user_secretKey);
    console.log('------token-----',token);
    return SUCCESS.DEFAULT(res,"signup successfully", token)
  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
    // console.log('-----er------',err);
    // res.status(500).json(err.toString());
  }
};



const numberLogin = async (req, res) => {
  try {
    const {mobile_number,country_code} = req.body;
    
    if (!(mobile_number.length <= 10)) return res.status(400).json({code:400,error:"mobile number should be less than 10 digits"});
    if (!mobile_number || !country_code) return res.status(400).json({code:400,error:"mobile_number,country_code is Required"});

    const getData = await libs.getData(User,{where:{mobile_number:mobile_number}});

    if (getData) {

      let token_info = { id: getData.id, mobile_number: getData.mobile_number };

      let token= await commonFunc.generateAccessToken(getData, token_info, process.env.user_secretKey);

      return SUCCESS.DEFAULT(res, "logged in", token);
    } 
    else {
      res.status(400).json({code:400,error:"mobile number not found"})
     }
  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
  }
};



const logout = async (req, res) => {
  try {
    const logoutUser = await libs.updateData(req.creds, { access_token: null });

    return res.status(200).json({code:200,message:"User logged Out"});
  } catch (err) {
    res.status(500).json({code:500,message:err.message});
  }
};



// -----------get my profile----------

const userProfile = async (req, res) => {
  try {
    // const getProfile = await libs.getData(req.creds,{access_token:null});

    return SUCCESS.DEFAULT(res,"users profile", req.creds);
  } catch (err) {
    console.log('----err-----',err);
    res.status(500).json({code:500,message:err.message});
  }
};


const editUserProfile = async (req, res,next) => {
  try {
    const userData = req.creds;
    const {device_type,device_token,gender,username} = req.body;
    console.log('============',req.body);
    let update = {};

    // if (username) { 
    //   const getUsername = await libs.getData(User, {where:{
    //     id: {[Op.not]: userData.id}, username: username,
    //   }});
    //   if(getUsername){
    //     return ERROR.USER_NAME_ALREADY_EXIST(res);
    //   }
    //   update.username = username 
    // }

    // await commonFunc.upload(req,res,next);

    if (username) { update.username = username }
    if (gender) { update.gender = gender }
    if (device_type) { update.device_type = device_type }
    if (device_token) { update.device_token = device_token }
    if(req.file){update.image= req.file.path};

    const editProfile = await libs.updateData(userData, update);

    return SUCCESS.DEFAULT(res,"profile updated successfully", editProfile);
  } catch (err) {
    if(req.file){ fs.unlink(req.file.path, (err)=>{if (err) return})}
    ERROR.ERROR_OCCURRED(res, err);
  }
};


const deleteUserAccount = async (req, res) => {
  try {
    let del =await libs.destroyData(User,{where:{id:req.creds.id}});  //It will store date in deleted_at's fields
    res.status(200).json({code:204,message:"Account deleted",data:del});    

  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
  }
};


const findRide = async (req, res) => {
  try {
    const data={
      pickup_long: req.body.pickup_long,
      pickup_lat: req.body.pickup_lat,
      drop_long: req.body.drop_long,
      drop_lat: req.body.drop_lat,
      pickup_address: req.body.pickup_address,
      drop_address: req.body.drop_address,
      booking_status: req.body.booking_status,
      amount: 10,
      ride_type: req.body.ride_type,
      driver_gender: req.body.driver_gender,
    }

    // let saveData = await libs.createData(User,data);
    // return saveData;    


  } catch (err) {
    res.status(500).json({code:500,message:err.message});
  }
};








module.exports = {numberSignup, numberLogin, logout, userProfile, editUserProfile,deleteUserAccount,findRide };

