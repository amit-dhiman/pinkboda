const {Op} = require('sequelize') 
const db = require("../models/index");
const User = db.user;
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
const ERROR = require('../config/responseMsgs').ERROR;
const SUCCESS = require('../config/responseMsgs').SUCCESS;
require('dotenv').config();
const CONFIG = require('../config/scope');


const signup = async (req, res) => {
  try {
    let { first_name, last_name, email, password, device_type, device_token,username,gender } = req.body;

    email = email.toLowerCase();
    const checkEmail = await libs.checkEmail(User, email);
    if (username) { 
      const getUsername = await libs.getData(User, {where:{
        username: username,
      }});
      if(getUsername){
        return ERROR.USER_NAME_ALREADY_EXIST(res);
      }
    }
    if (checkEmail) return ERROR.EMAIL_ALREADY_EXIST(res);
    // if (checkEmail) return res.status(ERROR.EMAIL_ALREADY_EXIST.statusCode).json(ERROR.EMAIL_ALREADY_EXIST);

    let data = {
      first_name: first_name,
      last_name: last_name,
      username: username,
      gender: gender,
      email: email,
      password: await commonFunc.securePassword(password),
    };



    if (device_type) {data.device_type = device_type }
    if (device_token) {data.device_token = device_token }

    let saveData = await libs.saveData(User, data);

    let token_info = { id: saveData.id, email: saveData.email };

    let token = await commonFunc.generateAccessToken(saveData, token_info, process.env.user_secretKey);
    return SUCCESS.DEFAULT(res, token)
  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
    // console.log('-----er------',err);
    // res.status(500).json(err.toString());
  }
};



const userlogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    let data = { where: { email: email.toLowerCase() } };

    let getData = await libs.getData(User, data);

    if (!getData) return ERROR.INVALID_EMAIL(res);

    let match = await commonFunc.compPassword(password, getData.password);

    if (!match) return ERROR.WRONG_PASSWORD(res);

    let token_info = { id: getData.id, email: getData.email };

    let token = await commonFunc.generateAccessToken(getData, token_info, process.env.user_secretKey);

    if (!token) return ERROR.SOMETHING_WENT_WRONG(res);

    return SUCCESS.DEFAULT(res, token);
  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
  }
};

const sociallogin = async (req, res) => {
  try {
    let { social_key } = req.body;

    let data = { where: { social_key: social_key } };

    let getData = await libs.getData(User, data);
    let token_info = null;

    if (getData) {
      token_info = { id: getData.id, social_key: getData.social_key };

      let token = await commonFunc.generateAccessToken(getData, token_info, process.env.user_secretKey);

      SUCCESS.DEFAULT(res, token)
    } else {

      let data = { social_key: social_key };

      let saveData = await libs.saveData(User, data);

      token_info = { id: saveData.id, email: saveData.email, social_key: saveData.social_key };

      let token = await commonFunc.generateAccessToken(saveData, token_info, process.env.user_secretKey);

      return SUCCESS.DEFAULT(res, token);
    }
  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
  }
};


const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userData = req.findData;

    if (newPassword != confirmPassword) return res.status(404).json({ message: 'old password and new password doesnt matched' });

    const passwordMatches = await commonFunc.compPassword(oldPassword, userData.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }
    let newhashPassword = await commonFunc.securePassword(newPassword);

    let upatedData = await libs.updateData(userData, { password: newhashPassword });

    res.status(202).json(upatedData);

    // return SUCCESS.DEFAULT(res,upatedData);
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

    const { first_name, last_name, device_type, device_token,gender,username } = req.body;

    let update = {};

    if (first_name) { update.first_name = first_name }
    if (last_name) { update.last_name = last_name }
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


const forgotPassword = async (req, res) => {
  try {
    let email = req.body.email;
    if (!email) {
      return res.status(400).send("email required")
    }
    const getEmail = await libs.checkEmail(User, email);

    if (getEmail) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      console.log('-------otp------', otp);

      // Sending mail
      commonFunc.sendMail(otp, email);

      const updateData = await libs.updateData(getEmail, { otp: otp });

      return SUCCESS.OTP_SENT(res,updateData.access_token,"otp sent to the mail");
    } else {
      return ERROR.INVALID_EMAIL(res);
    }
  } catch (err) {
    // throw err
    res.status(500).send(err.toString());
  }
};


const numberLogin = async (req, res) => {
  try {
    const mobile_number = req.body.mobile_number;

    if (!mobile_number) return res.status(400).send("mobile_number is Required");

    const getData = await libs.getData(User, { where: { mobile_number: mobile_number } });
    // const otp = Math.floor(100000 + Math.random() * 900000);
    let otp = 123456;
    console.log('--------------otp--------------',otp);

    if (getData) {
      commonFunc.sendSms(`+${mobile_number}`, otp);

      let updatedData = await libs.updateData(getData, { otp: otp });
      console.log('-------updatedData------',updatedData);

      return SUCCESS.OTP_SENT(res, updatedData.access_token, "otp sent to the mobile number");
    } else {

      commonFunc.sendSms(`+${mobile_number}`, otp);

      let data = { mobile_number: mobile_number, otp: otp };

      const saveData = await libs.saveData(User, data);

      let token_info = { id: saveData.id, email: saveData.email, mobile_number: saveData.mobile_number };

      let updatedData= await commonFunc.generateAccessToken(saveData, token_info, process.env.user_secretKey);
      return SUCCESS.OTP_SENT(res,updatedData.access_token,"otp sent to the mobile number");
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
      let verified = await libs.updateData(userData, {otp: null})
      SUCCESS.DEFAULT(res, verified);
    } else {
      ERROR.WRONG_OTP(res);
    }

  } catch (err) {
    res.status(500).json(err.message);
  }
};









module.exports = { signup, userlogin, sociallogin, changePassword, logout, userProfile, editUserProfile, forgotPassword,numberLogin, verifyOtp,  };

