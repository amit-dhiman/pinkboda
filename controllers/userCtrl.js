const db = require("../models/index");
const User = db.users;
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
const ERROR = require('../config/responseMsgs').ERROR;
const SUCCESS = require('../config/responseMsgs').SUCCESS;
require('dotenv').config();
const CONFIG = require('../config/scope');
const fs = require('fs');
const Notify = require('../libs/notifications');

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
      if(token.image){
        token.image = `${process.env.user_image_baseUrl}/${token.image}`
      }

      return SUCCESS.DEFAULT(res, "logged in", token);
    } 
    else {
      res.status(400).json({code:400,message:"mobile number not found"})
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
    const getProfile = req.creds;
    return SUCCESS.DEFAULT(res,"users profile", getProfile);
  } catch (err) {
    console.log('----err-----',err);
    res.status(500).json({code:500,message:err.message});
  }
};


const editUserProfile = async (req, res,next) => {
  try {
    const userData = req.creds;
    console.log('---------userData----------',userData);
    const {device_type,device_token,gender,username} = req.body;
    // console.log('============',req.body);
    console.log('======---file---======',req.file);
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
    if(req.file){
      if(userData.image){
        fs.unlink(`${process.env.user_image_baseUrl}/${userData.image}`,(err)=>{if(err)return})
      }
      update.image= req.file.filename
    };
    console.log('-----update------',update);
    
    const editProfile = await libs.updateData(userData, update);
    if(editProfile.image){
      editProfile.image = `${process.env.user_image_baseUrl}/${editProfile.image}`
    }

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


const calcRideAmount = async (req, res) => {
  try {
   
    
    res.status(500).json({code:200,data: "calcRide Amount api"});    
  } catch (err) {
    res.status(500).json({code:500,message:err.message});
  }
};


const bookRide = async (req, res) => {
  try {
    const data={
      pickup_long: req.body.pickup_long,
      pickup_lat: req.body.pickup_lat,
      drop_long: req.body.drop_long,
      drop_lat: req.body.drop_lat,
      pickup_address: req.body.pickup_address,
      drop_address: req.body.drop_address,
      amount: 10,
      booking_status:"pending",
      ride_type: req.body.ride_type,
      driver_gender: req.body.driver_gender,
      user_id: req.creds.id
    }

    let saveData = await libs.createData(db.bookings,data);

    //--------------get nearby Drivers to send Notification---------------

    const latitude = data.pickup_lat || 30.718522;
    const longitude = data.pickup_long || 76.717959;
    const distance = 6;

    let findDrivers = null;
    // while(){
    //   const latitude = 30.718522;
    //   const longitude = 76.717959;
    //   const distance = 6;

    //   const haversine = `(
    //     6371 * acos(cos(radians(${latitude}))* cos(radians(latitude))* cos(radians(longitude) - radians(${longitude}))+ sin(radians(${latitude})) * sin(radians(latitude)))
    //   )`;
      
    //   findDrivers = await db.drivers.findAll({
    //     attributes: ['*', [db.sequelize.literal(haversine), 'distance']],
    //     where:db.sequelize.where(db.sequelize.literal(haversine),'<=',distance),
    //     raw: true,
    //     order: db.sequelize.col('distance'),
    //   });
    //   // console.log('----------findDrivers----------',findDrivers);

    //   let deviceTokens=[];
    //   let saveNotify= [];
        
    //   const notify_data= {user_id: req.creds.id,booking_id: 2}
      
    //   for(let i=0;i<findDrivers.length;i++){
    //     saveNotify.push(notify_data.driver_id=findDrivers[i].id);
    //     deviceTokens.push(findDrivers[i].device_token=findDrivers[i].device_token)
    //   }
    //   console.log('---------deviceTokens--------',deviceTokens);
    //   console.log('---------saveNotify----------',saveNotify);
    // }
    res.status(500).json({code:200,data: saveData});   
  
  } catch (err) {
    res.status(500).json({code:500,message:err.message});
  }
};


const cancelRide = async (req, res) => {
  try {
    let query= {
      user_id: req.creds.id,
      id: req.body.booking_id,
      // booking_status:"pending"
    }
    let updateMsg= await libs.updateData(db.bookings,{cancel_reason:req.body.cancel_reason});
    if(req.body.driver_id){
      let deleteData = await libs.destroyData(db.bookings,{where:query});
      
      if(deleteData){
        let getDriverData= await libs.getData(db.drivers,{id:req.body.driver_id});

        //  ---------send notification----------
        let data = {
          title:"Ride cancelation",
          message:"your ride has been canceled"
        }
        let deviceTokens= [req.creds.device_token,getDriverData.device_token];

        const sendNotify= await Notify.sendNotify(data,deviceTokens)

        return res.status(200).json({code:200,message:"your ride has been canceled"});
      }
      res.status(200).json({code:200,message:"cant cancelled the ride"});
    }else{
      
      let deleteData = await libs.destroyData(db.bookings,{where:query});
      console.log('----deleteData---',deleteData);
      res.status(200).json({code:200,message:"your ride has been canceled"});
    }
  } catch (err) {
    res.status(500).json({code:500,message:err.message});
  }
};


const findPreviousRide = async (req, res) => {
  try {

    // let findRide = await db.users.findAll({
    //   where:{id:req.creds.id},
    //   include:[{model:db.bookings}],
    // })

    let findRide = await db.bookings.findAll({
      where:{user_id:req.creds.id,booking_status:"pending"},
    })

    res.status(200).json({code:200,message: "your ride has been canceled",data:findRide});
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


// const findNearbyDrivers = async (req, res) => {
//   try {
//     let getAcceptedDetail = await db.notifications.
//     let findDrivers = null;
//     while(){
//       const latitude = 30.718522;
//       const longitude = 76.717959;
//       const distance = 6;

//       const haversine = `(
//         6371 * acos(cos(radians(${latitude}))* cos(radians(latitude))* cos(radians(longitude) - radians(${longitude}))+ sin(radians(${latitude})) * sin(radians(latitude)))
//       )`;
      
//       findDrivers = await db.drivers.findAll({
//         attributes: ['*', [db.sequelize.literal(haversine), 'distance']],
//         where:db.sequelize.where(db.sequelize.literal(haversine),'<=',distance),
//         raw: true,
//         order: db.sequelize.col('distance'),
//       });
//       // console.log('----------findDrivers----------',findDrivers);

//       let deviceTokens=[];
//       let saveNotify= [];
        
//       const notify_data= {user_id: req.creds.id,booking_id: 2}
      
//       for(let i=0;i<findDrivers.length;i++){
//         saveNotify.push(notify_data.driver_id=findDrivers[i].id);
//         deviceTokens.push(findDrivers[i].device_token=findDrivers[i].device_token)
//       }
//       console.log('---------deviceTokens--------',deviceTokens);
//       console.log('---------saveNotify----------',saveNotify);
//     }

//     res.status(200).json({code:200,message:"find nearby drivers",data:findDrivers});
//   } catch (err) {
//     console.log('-----err-------',err);
//     res.status(500).json({code:500,message: err.message});
//   }
// };


const sendMessage = async (req, res) => {
  try {
    let data= {
      sender_id: req.creds.id,
      receiver_id: req.body.receiver_id,
      booking_id: req.body.booking_id,
      message: req.body.message,
    }
    console.log('------data--------',data);
    let saveData = await libs.createData(db.chats,data);
    console.log('----saveData---',saveData);

    res.status(200).json({code:200,message:"message saved",data: saveData});
  } catch (err) {
    console.log('------err------',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const reportOnDriver = async (req, res) => {
  try {
    let data= {
      user_id: req.creds.id,
      driver_id: req.body.driver_id,
      booking_id: req.body.booking_id,
      report_message: req.body.report_message,
    }
    let saveReport = await libs.createData(db.reports, data);
    console.log('----saveReport---',saveReport);

    // let saveReport = await libs.getData(db.bookings,{
    //   where:{id:1},
    //   include:{model: db.reports }
    // })

    res.status(200).json({code:200,message:"Reported successfully"});
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const giveRating = async (req, res) => {
  try {
    let data= {
      user_id: req.creds.id,
      driver_id: req.body.driver_id,
      booking_id: req.body.booking_id,
      star: req.body.star,
    }
    let saveRatings = await libs.createData(db.ratings, data);
    console.log('----saveRatings----',saveRatings);

    res.status(200).json({code:200,message:"Rating successful"});
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};

const support = async (req, res) => {
  try {
    let data= {
      user_id: req.creds.id,
      email: req.body.email,
      message: req.body.message,
    }
    let saveSupport = await libs.createData(db.supports, data);
    console.log('----saveSupport----',saveSupport);

    res.status(200).json({code:200,message:"Your messages has been sent successfully"});
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const getNotifications = async (req, res) => {
  try {
    // let data= {
    //   user_id: req.creds.id,
    //   email: "abc@gmail.com",
    //   message: "hiii",
    //   title: "chat"
    // }

    // let save = await libs.createData(db.notifications, data);
    // console.log('-----save------',save.toJSON());

    let getNotify = await libs.getAllData(db.notifications, {where:{user_id: req.creds.id}});

    res.status(200).json({code:200,message:"get All Notifications",data: getNotify});
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const clearNotifications = async (req, res) => {
  try {
    let getNotify = await libs.destroyData(db.notifications, {where:{user_id: req.creds.id}});

    res.status(200).json({code:200,message:"Cleared All Notifications",data: getNotify});
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const getMyRides = async (req, res) => {
  try {
    // let data = {
    //   "pickup_long": 76.717957,
    //   "pickup_lat": 30.718521,
    //   "drop_long": 20.655001,
    //   "drop_lat": 25.569,
    //   "pickup_address": "mohali",
    //   "drop_address": "chandigarh",
    //   "vechile_type": "Bike",
    //   "amount": 10,
    //   "ride_status": "Completed",
    //   "user_id": req.creds.id,
    //   "driver_id": 1,
    //   "booking_id": 1,
    // }
    // // bookings me se data find kr k rides wali mw save krva do manually api se hi
    // let save = await libs.createData(db.myrides,data);

    let getRides = await libs.getAllData(db.myrides, {
      where:{user_id: req.creds.id},
      include:[{
        model: db.drivers,
        attributes: ['username','profile_image'],
      }],
    });

    let arr = []
    for(let i=0;i<getRides.length; i++){
      let a = await libs.getData(db.ratings,{where:{booking_id:getRides[i].booking_id}});
      let jsonData = getRides[i].toJSON();
      jsonData.star = a.star
      arr.push(jsonData) 
    }

    res.status(200).json({code:200,message:"My All Rides",data: arr});
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const getSingleRide = async (req, res) => {
  try {
    let booking_id = req.query.booking_id;

    let getOneNotify = await libs.getData(db.myrides, {where:{user_id: req.creds.id,booking_id:booking_id}});

    let getDriverData = await libs.getData(db.drivers, {where:{id:getOneNotify.driver_id}});

    let edit_data = getOneNotify.toJSON();

    edit_data.driver_username = getDriverData.username
    edit_data.driver_profile_image = getDriverData.profile_image

    let getRating = await libs.getData(db.ratings, {where:{booking_id: booking_id}});
    edit_data.star = getRating.star

    res.status(200).json({code:200,message:"detail of 1 notification",data: edit_data});
  } catch (err) {
    res.status(500).json({code:500,message:err.message});
  }
};

const getOffers = async (req, res) => {
  try {
    // let data = {
    //   user_id:req.creds.id,
    //   title:"Wow!",
    //   message:"you have completed 20 rides. Get a free ride now"
    // }

    // let add = await libs.createData(db.offers,data);
    
    let getData = await libs.getAllData(db.offers, {where:{ user_id: req.creds.id }});
    res.status(200).json({code:200,message:"users offer",data: getData});
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};



module.exports = {numberSignup, numberLogin, logout, userProfile, editUserProfile,deleteUserAccount,calcRideAmount,bookRide,cancelRide,findPreviousRide,//findNearbyDrivers ,
sendMessage, reportOnDriver, giveRating,support, getNotifications,clearNotifications,getMyRides,getSingleRide,getOffers
};

