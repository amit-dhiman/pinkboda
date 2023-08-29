const {Op} = require('sequelize') 
const db = require("../models/index");
const User = db.users;
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
const ERROR = require('../config/responseMsgs').ERROR;
const SUCCESS = require('../config/responseMsgs').SUCCESS;
require('dotenv').config();
const CONFIG = require('../config/scope');




const numberSignup = async (req, res) => {
  try {
    let { username, mobile_number,gender, country_code, device_type, device_token,} = req.body;

    const getData = await libs.getData(User, { where: { mobile_number: mobile_number } });
    // const otp = Math.floor(100000 + Math.random() * 900000);
    let otp = 123456;
    console.log('------otp--------',otp);

    if (getData) {
      return ERROR.MOBILE_ALREADY_EXIST(res);
    }

    if (username) { 
      const getUsername = await libs.getData(User, {where:{
        username: username,     // id: {[Op.not]: userData.id},
      }});

      if(getUsername){
        return ERROR.USER_NAME_ALREADY_EXIST(res);
      }
    }

    let data = {
      otp: otp,
      username: username,
      mobile_number: mobile_number,
      gender: gender,
      country_code: country_code,
    };

    if (device_type) {data.device_type = device_type }
    if (device_token) {data.device_token = device_token }

    let saveData = await libs.saveData(User, data);

    let token_info = { id: saveData.id, mobile_number: saveData.mobile_number };

    let token = await commonFunc.generateAccessToken(saveData, token_info, process.env.user_secretKey);
    console.log('---------token--------------',token);
    return SUCCESS.OTP_SENT(res, token.access_token)
  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
    // console.log('-----er------',err);
    // res.status(500).json(err.toString());
  }
};


const numberLogin = async (req, res) => {
  try {
    const mobile_number = req.body.mobile_number;

    if (!mobile_number) return res.status(400).send("mobile_number is Required");

    const getData = await libs.getData(User, { where: { mobile_number: mobile_number } });
    // const otp = Math.floor(100000 + Math.random() * 900000);
    let otp = 123456;
    console.log('------otp--------',otp);

    if (getData) {
      commonFunc.sendSms(`+91${mobile_number}`, otp);

      let updatedData = await libs.updateData(getData, { otp: otp });
      let token_info = { id: updatedData.id, mobile_number: updatedData.mobile_number };

      let token= await commonFunc.generateAccessToken(updatedData, token_info, process.env.user_secretKey);

      return SUCCESS.OTP_SENT(res, token.access_token, "otp sent to the mobile number");
    } 
    else {
      res.status(400).json({error:"User not found with this mobile number"})

      // commonFunc.sendSms(`+91${mobile_number}`, otp);

      // let data = { mobile_number: mobile_number, otp: otp };

      // const saveData = await libs.saveData(User, data);

      // let token_info = { id: saveData.id, email: saveData.email, mobile_number: saveData.mobile_number };

      // let updatedData= await commonFunc.generateAccessToken(saveData, token_info, process.env.user_secretKey);
      // return SUCCESS.OTP_SENT(res,updatedData.access_token);
    }
  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
  }
};


const verifyOtp = async (req, res) => {
  try {
    const {otp} = req.body;
    const userData = req.findData;

    console.log('----------otp-------------',otp);
    console.log('----------userData-------------',userData);
    if (!otp) {
      return res.status(400).send("otp is required");
    }
    
    if (otp == userData.otp) {
      console.log('----verified-----');
      let verified = await libs.updateData(userData, {otp: null})
      SUCCESS.DEFAULT(res, verified);
    } else {
      ERROR.WRONG_OTP(res);
    }

  } catch (err) {
    res.status(500).json(err.message);
  }
};


const logout = async (req, res) => {
  try {
    const logoutUser = await libs.updateData(req.findData, { access_token: null });

    return SUCCESS.DEFAULT(res, "User logged out");
  } catch (err) {
    res.status(500).json(err.message);
  }
};



//  --------------get my profile----------

const userProfile = async (req, res) => {
  try {
    // const getProfile = await libs.getData(req.findData,{access_token:null});

    return SUCCESS.DEFAULT(res, req.findData);
  } catch (err) {
    console.log('----err-----',err);
    res.status(500).json(err.message);
  }
};


const editUserProfile = async (req, res) => {
  try {
    const userData = req.findData;

    const {device_type, device_token,gender,username } = req.body;

    let update = {};

    if (username) { 
      const getUsername = await libs.getData(User, {where:{
        id: {[Op.not]: userData.id}, username: username,
      }});
      if(getUsername){
        return ERROR.USER_NAME_ALREADY_EXIST(res);
      }
      update.username = username 
    }
    if (gender) { update.gender = gender }
    if (device_type) { update.device_type = device_type }
    if (device_token) { update.device_token = device_token }

    const editProfile = await libs.updateData(userData, update);

    // let token_info = { id: editProfile.id, email: editProfile.email, social_key: editProfile.social_key };

    // const genToken = await commonFunc.generateAccessToken(editProfile, token_info, process.env.user_secretKey);

    // console.log('---------gentok------------', genToken);

    return SUCCESS.DEFAULT(res, editProfile);
  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
  }
};


// const forgotPassword = async (req, res) => {
//   try {
//     let email = req.body.email;
//     if (!email) {
//       return res.status(400).send("email required")
//     }
//     const getEmail = await libs.checkEmail(User, email);

//     if (getEmail) {
//       const otp = Math.floor(100000 + Math.random() * 900000);
//       console.log('-------otp------', otp);

//       // Sending mail
//       commonFunc.sendMail(otp, email);

//       const updateData = await libs.updateData(getEmail, { otp: otp });

//       return SUCCESS.OTP_SENT(res,updateData.access_token,"otp sent to the mail");
//     } else {
//       return ERROR.INVALID_EMAIL(res);
//     }
//   } catch (err) {
//     // throw err
//     res.status(500).send(err.toString());
//   }
// };











module.exports = {numberSignup, numberLogin, verifyOtp, logout, userProfile, editUserProfile  };

