const db = require('../models/index');
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
require('dotenv').config();
const CONFIG = require('../config/scope');
const ERROR= require('../config/responseMsgs').ERROR;
const SUCCESS= require('../config/responseMsgs').SUCCESS;
const fs = require('fs');


const driverSignup = async (req, res) => {
    try {
        let {username,gender,country_code,mobile_number,model,license_plate,year,device_type, device_token} = req.body;
        console.log('------req.files-------',req.files); 
        const getData=await libs.getData(db.drivers,{where:{mobile_number:mobile_number}});

        if (getData) {
            console.log('----getData----', getData);
            if (req.files) {
                Object.values(req.files).map(files=>files.map(file=>fs.unlink(file.path,(err)=>{if(err)return})));
            }
            return res.status(409).json({code:409,message:"mobile number already exist"});
        }

        let data = {
            username: username,
            gender: gender,
            mobile_number: mobile_number,
            country_code: country_code,
            model:model,
            license_plate:license_plate,
            year:year,
            is_admin_verified: "accepted"
        };

        if(req.files.license){data.license= req.files.license[0].filename}
        if(req.files.id_card){data.id_card= req.files.id_card[0].filename}
        if(req.files.passport_photo){data.passport_photo= req.files.passport_photo[0].filename}
        if(req.files.vechile_insurance){data.vechile_insurance= req.files.vechile_insurance[0].filename}

        if (device_type) { data.device_type = device_type }
        if (device_token) { data.device_token = device_token }

        console.log('-------data---------',data);

        let saveData = await libs.createData(db.drivers, data);

        let token_info = { id: saveData.id, mobile_number: saveData.mobile_number };
        let token = await commonFunc.generateAccessToken(saveData, token_info, process.env.driver_secretKey);

        return SUCCESS.DEFAULT(res,"signUp successfully", token)
    } catch (err) {
        console.log('----err---',err);
        if (req.files) {
            Object.values(req.files).map(files=>files.map(file=>fs.unlink(file.path,(err)=>{if(err)return})));
        }
        ERROR.ERROR_OCCURRED(res, err);
        // console.log('-----er------',err);
        // res.status(500).json({code:500,message:"error occured"});
    }
};

const login = async(req,res) => {
    try {
        const {country_code, mobile_number,device_type,device_token} = req.body;
        if(!country_code || !mobile_number){
            return res.status(400).json({code:400,message:"country_code  & mobile_number is required"})
        }
        console.log('---------country_code---------',country_code);
        const getData= await libs.getData(db.drivers,{where:{mobile_number:mobile_number}})
        console.log('-----2');
        if(!getData){
            return res.status(400).json({code:400,message:"mobile number does't exist"})
        }
        if(getData.is_admin_verified=="pending"){
            return res.status(400).json({code:400,message:"your previous request is still pending"})
        }
        if(getData.is_admin_verified=="rejected"){
            return res.status(400).json({code:400,message:"your previous request has been rejected"})
        }

        if(getData.is_admin_verified=="accepted"){
            let token_info = { id: getData.id, mobile_number: getData.mobile_number };

            if (device_type) { token_info.device_type = device_type }
            if (device_token) { token_info.device_token = device_token }
    
            let token = await commonFunc.generateAccessToken(getData, token_info, process.env.driver_secretKey);
    
            return SUCCESS.DEFAULT(res,"login successfully", token)
        }
        res.status(400).json({code:400,message:"your previous request is null check db"})
    } catch (err) {
        ERROR.INTERNAL_SERVER_ERROR(res, err);
    }
}


const logout = async (req, res) => {
    try {
        const logoutUser = await libs.updateData(req.creds, { access_token: null });

        return res.status(200).json({code:200,message:"Driver logged Out Successfully"});
    } catch (err) {
        res.status(500).json({code:500,message:err.message});
    }
};


const driverProfile = async (req, res) => {
    try {
      const getProfile = req.creds;
  
      return SUCCESS.DEFAULT(res,"drivers profile", getProfile);
    } catch (err) {
      console.log('----err----',err);
      res.status(500).json({code:500, message:err.message});
    }
};

const editDriverProfile = async (req, res,next) => {
    try {
      const userData = req.creds;
      const {username,gender,model,license_plate,year} = req.body;
      let update = {};
  
      if (username) {update.username = username }
      if (gender) {update.gender = gender }
      if (model) {update.model = model }
      if (license_plate) {update.license_plate = license_plate }
      if (year) {update.year = year }
  
      if(req.files){
        for(let key in req.files){
            fs.unlink(`${process.env.driver_image_baseUrl}/${userData[key]}`,(err)=>{if(err)return})
            update[key] = req.files[key][0].filename
        }
      }
      console.log('---------update----------',update);
      const editProfile = await libs.updateData(userData, update);
      return SUCCESS.DEFAULT(res,"profile updated successfully", editProfile);
    } catch (err) {
        if(req.files){
            Object.values(req.files).map(files=>files.map(file=>fs.unlink(file.path,(err)=>{if(err)return})));
        }
      ERROR.INTERNAL_SERVER_ERROR(res, err);
    }
};


const deleteDriverAccount = async (req, res) => {
    try {
      let del =await libs.destroyData(db.drivers,{where:{id:req.creds.id}});   //It will store date in deleted_at's fields
      res.status(200).json({code:204,message:"Account deleted",data:del});    
  
    } catch (err) {
      ERROR.ERROR_OCCURRED(res, err);
    }
};

// ----location update eveytime-----
const updateDriversLocation = async (req, res) => {
    try {
      let updateLocation =await libs.updateData(req.creds,{lat:req.body.lat,long:req.body.long});

      res.status(200).json({code:204,message:"drivers location update successfully",data:updateLocation});    
  
    } catch (err) {
      ERROR.ERROR_OCCURRED(res, err);
    }
};

// To show Accept Or Reject Rides

const pendingListing = async (req, res) => {
    try {
    //   let pendingList =await libs.getData(db.bookings,{where})
      res.status(200).json({code:204,message:"show pending list",data:pendingList});    
  
    } catch (err) {
      ERROR.ERROR_OCCURRED(res, err);
    }
};

//  create some Users and Drivers ans then add drivers lat long then test haversine formula and send noti to nearby drivers




module.exports={driverSignup, login,logout,driverProfile,editDriverProfile,deleteDriverAccount,updateDriversLocation,pendingListing, }

