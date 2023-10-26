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
const { Op } = require('sequelize');


const numberSignup = async (req, res) => {
  try {
    let { username, mobile_number, gender, country_code, device_type, device_token, } = req.body;

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

    if (device_type) { data.device_type = device_type }
    if (device_token) { data.device_token = device_token }

    let saveData = await libs.createData(User, data);

    let token_info = { id: saveData.id, mobile_number: saveData.mobile_number };

    let token = await commonFunc.generateAccessToken(saveData, token_info, process.env.user_secretKey);
    console.log('------token-----', token);
    return SUCCESS.DEFAULT(res, "signup successfully", token)
  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
    // console.log('-----er------',err);
    // res.status(500).json(err.toString());
  }
};


const numberLogin = async (req, res) => {
  try {
    const { mobile_number, country_code, device_type, device_token } = req.body;

    if (!(mobile_number.length <= 10)) return res.status(400).json({ code: 400, error: "mobile number should be less than 10 digits" });
    if (!mobile_number || !country_code) return res.status(400).json({ code: 400, error: "mobile_number,country_code is Required" });

    const getData = await libs.getData(User, { where: { mobile_number: mobile_number } });

    if (getData) {

      let token_info = { id: getData.id, mobile_number: getData.mobile_number };
      if (device_type) { token_info.device_type = device_type }
      if (device_token) { token_info.device_token = device_token }

      let token = await commonFunc.generateAccessToken(getData, token_info, process.env.user_secretKey);
      if (token.image) {
        token.image = `${process.env.user_image_baseUrl}${token.image}`
      }

      return SUCCESS.DEFAULT(res, "logged in", token);
    }
    else {
      res.status(400).json({ code: 400, message: "mobile number not found" })
    }
  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
  }
};


const logout = async (req, res) => {
  try {
    const logoutUser = await libs.updateData(req.creds, { access_token: null });

    return res.status(200).json({ code: 200, message: "User logged Out" });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
};


// -----------get my profile----------

const userProfile = async (req, res) => {
  try {
    const getProfile = req.creds;
    return SUCCESS.DEFAULT(res, "users profile", getProfile);
  } catch (err) {
    console.log('----err-----', err);
    res.status(500).json({ code: 500, message: err.message });
  }
};

const editUserProfile = async (req, res, next) => {
  try {
    const userData = req.creds;
    const { device_type, device_token, gender, username } = req.body;
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
    if (req.file) {
      if (userData.image) {
        fs.unlink(`${process.env.user_image_baseUrl}${userData.image}`, (err) => { if (err) return })
      }
      update.image = req.file.filename
    };

    const editProfile = await libs.updateData(userData, update);

    if (editProfile.image) {
      editProfile.image = `${process.env.user_image_baseUrl}${editProfile.image}`
    }

    return SUCCESS.DEFAULT(res, "profile updated successfully", editProfile);
  } catch (err) {
    console.log('------err------', err);
    if (req.file) { fs.unlink(req.file.path, (err) => { if (err) return }) }
    ERROR.ERROR_OCCURRED(res, err);
  }
};


const deleteUserAccount = async (req, res) => {
  try {
    let del = await libs.destroyData(User, { where: { id: req.creds.id } });  //It will store date in deleted_at's fields
    res.status(200).json({ code: 204, message: "Account deleted", data: del });

  } catch (err) {
    ERROR.ERROR_OCCURRED(res, err);
  }
};

//  working n drop lat long maybe it will be same

const calcRideAmount = async (req, res) => {
  try {
    const { pickup_long, pickup_lat, drop_long, drop_lat, pickup_address, drop_address, ride_type, driver_gender } = req.body;

    let data = {
      pickup_long: pickup_long,
      pickup_lat: pickup_lat,
      drop_long: drop_long,
      drop_lat: drop_lat,
      pickup_address: pickup_address,
      drop_address: drop_address,
      booking_status: "pending",
      ride_type: ride_type,
      driver_gender: driver_gender,
      user_id: req.creds.id,
    }

    let distance = await commonFunc.findDistanceByRoad(data);

    let base_price = 5;
    let perKm_price = 1.5;
    let km = parseFloat(distance.replace(/[, ]/g, ''));

    let price = (base_price + (perKm_price * km))
    data.amount = Number(price.toFixed(2));

    let getData = await libs.getData(db.search_history, { where: { drop_lat: data.drop_lat, drop_long: data.drop_long } });
    let getAddress = await libs.getData(db.search_history, { where: { drop_address: data.drop_address } });
    // console.log('--------getData---------',getData);
    let saveData = null;

    if (getData) {
      data.updated_at = +new Date(Date.now());
      saveData = await libs.setData(getAddress, data);
    } else if (getAddress) {
      let dr_lat = data.drop_lat;
      let dr_long = data.drop_long;

      const drLat = new RegExp(`^${dr_lat.toString().slice(0, -1)}`);
      const drLong = new RegExp(`^${dr_long.toString().slice(0, -1)}`);

      if ((drLat.test(getAddress.drop_lat)) && (drLong.test(getAddress.dr_long))) {
        data.updated_at = +new Date(Date.now());
        saveData = await libs.setData(getAddress, data);
      }
    } else {
      saveData = await libs.createData(db.search_history, data);
    }
    res.status(200).json({ code: 200, message: "calcRide Amount api", data: data });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
};



// const bookRide = async (req, res) => {
//   try {
//     const data={
//       pickup_long: req.body.pickup_long,
//       pickup_lat: req.body.pickup_lat,
//       drop_long: req.body.drop_long,
//       drop_lat: req.body.drop_lat,
//       pickup_address: req.body.pickup_address,
//       drop_address: req.body.drop_address,
//       amount: 10,
//       booking_status:"pending",
//       ride_type: req.body.ride_type,
//       driver_gender: req.body.driver_gender,
//       user_id: req.creds.id
//     }

//     let saveData = await libs.createData(db.bookings,data);

//     //--------------get nearby Drivers to send Notification---------------

//     const latitude = data.pickup_lat || 30.718522;
//     const longitude = data.pickup_long || 76.717959;
//     const distance = 6;

//     let findDrivers = null;
//     // while(){
//     //   const latitude = 30.718522;
//     //   const longitude = 76.717959;
//     //   const distance = 6;

//     //   const haversine = `(
//     //     6371 * acos(cos(radians(${latitude}))* cos(radians(latitude))* cos(radians(longitude) - radians(${longitude}))+ sin(radians(${latitude})) * sin(radians(latitude)))
//     //   )`;

//     //   findDrivers = await db.drivers.findAll({
//     //     attributes: ['*', [db.sequelize.literal(haversine), 'distance']],
//     //     where:db.sequelize.where(db.sequelize.literal(haversine),'<=',distance),
//     //     raw: true,
//     //     order: db.sequelize.col('distance'),
//     //   });
//     //   // console.log('----------findDrivers----------',findDrivers);

//     //   let deviceTokens=[];
//     //   let saveNotify= [];

//     //   const notify_data= {user_id: req.creds.id,booking_id: 2}

//     //   for(let i=0;i<findDrivers.length;i++){
//     //     saveNotify.push(notify_data.driver_id=findDrivers[i].id);
//     //     deviceTokens.push(findDrivers[i].device_token=findDrivers[i].device_token)
//     //   }
//     //   console.log('---------deviceTokens--------',deviceTokens);
//     //   console.log('---------saveNotify----------',saveNotify);
//     // }
//     res.status(500).json({code:200,data: saveData});   

//   } catch (err) {
//     res.status(500).json({code:500,message:err.message});
//   }
// };


const cancelRide = async (req, res) => {
  try {
    let query = {
      user_id: req.creds.id,
      driver_id: req.body.driver_id,
      id: req.body.booking_id,
      // booking_status:"pending"
    }
    let updateMsg = await libs.findAndUpdate(db.bookings, req.body.booking_id, { cancel_reason: req.body.cancel_reason, cancelled_by: "User" });

    if (updateMsg) {
      // let getDriverData = await libs.getData(db.drivers, { where: { id: req.body.user_id } });

      //  ---------send notification----------
      // let data = {
      //   title: "Ride Canceled",
      //   message: `${req.creds.username} canceled your ride`
      // }

      // Notify.sendNotifyToDriver(data, getDriverData.device_token);

      // data.driver_id = updateMsg.driver_id;
      // let saveNotify = await libs.createData(db.notifications, data);

      return res.status(200).json({ code: 200, message: "your ride has been canceled" });
    }
    res.status(200).json({ code: 200, message: "cant canceled the ride" });
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};


const findPreviousRide = async (req, res) => {
  try {

    // let findRide = await db.users.findAll({
    //   where:{id:req.creds.id},
    //   include:[{model:db.bookings}],
    // })

    let findRide = await libs.getData(db.bookings, {
      where: { user_id: req.creds.id, booking_status: { [Op.or]: ['accept', 'started'] } },
      include: db.drivers
    });
    if (!findRide) {
      return res.status(404).json({ code: 404, message: "Ride not found" });
    }
    findRide.driver.profile_image = `${process.env.driver_image_baseUrl}${findRide.driver.profile_image}`

    res.status(200).json({ code: 200, message: "You have pending previous ride", data: findRide });
  } catch (err) {
    console.log('------err-----', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
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
    let data = {
      sender_id: req.creds.id,
      receiver_id: req.body.receiver_id,
      booking_id: req.body.booking_id,
      message: req.body.message,
      sender_type: "User"
    }
    let saveData = await libs.createData(db.chats, data);

    let getData = await libs.getData(db.drivers, {
      where: { id: data.receiver_id },
      attributes: ["id", "username", "device_token"],
    });

    let notify_data = {
      title: 'rider sends you a message',
      message: data.message,
    }

    Notify.sendNotifyToDriver(notify_data, getData.device_token);

    res.status(200).json({ code: 200, message: "message saved", data: saveData });
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};


const getAllMessages = async (req, res) => {
  try {
    let query = { where: { booking_id: req.query.booking_id } }

    let getData = await libs.getAllData(db.chats, query);

    res.status(200).json({ code: 200, message: "message saved", data: getData });
  } catch (err) {
    console.log('------err------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};


const reportOnDriver = async (req, res) => {
  try {
    let data = {
      user_id: req.creds.id,
      driver_id: req.body.driver_id,
      booking_id: req.body.booking_id,
      report_message: req.body.report_message,
      reported_by: "User"
    }

    let getData = await libs.getData(db.reports, { where: { user_id: data.user_id, booking_id: data.booking_id, reported_by: "User" } });

    if (getData) {
      res.status(409).json({ code: 409, message: "You have already reported on this booking and driver" });
    } else {
      await libs.createData(db.reports, data);
      res.status(200).json({ code: 200, message: "Reported successfully" });
    }

  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};


const giveRating = async (req, res) => {
  try {
    let data = {
      user_id: req.creds.id,
      driver_id: req.body.driver_id,
      booking_id: req.body.booking_id,
      star: req.body.star,
    }
    let saveRatings = await libs.createData(db.ratings, data);

    let getRatings = await libs.getAllData(db.ratings, { where: { driver_id: data.driver_id } });

    //  update OverAll rating in drivers models

    if (getRatings) {
      let totalStars = 0;
      for (const item of getRatings) {
        totalStars += item.star;
      }

      const averageRating = totalStars / getRatings.length;
      console.log("Average Star Rating:", averageRating);

      let updateOverAllRating = await libs.findAndUpdate(db.drivers, req.body.driver_id, { over_all_rating: averageRating });

      //  ---------send notification----------
      // let notify_data = {
      //   title: "rating",
      //   message: "user sents you stars"
      // }
      // await Notify.sendNotifyToDriver(notify_data, updateOverAllRating.device_token)
    }

    res.status(200).json({ code: 200, message: "Rating successful" });
  } catch (err) {
    console.log('--------err--------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};


const support = async (req, res) => {
  try {
    let data = {
      user_id: req.creds.id,
      email: req.body.email,
      message: req.body.message,
    }
    let saveSupport = await libs.createData(db.supports, data);

    res.status(200).json({ code: 200, message: "Your messages has been sent successfully" });
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
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

    let getNotify = await libs.getAllData(db.notifications, { where: { user_id: req.creds.id }, order: [['created_at', 'DESC']] });

    res.status(200).json({ code: 200, message: "get All Notifications", data: getNotify });
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};


const clearNotifications = async (req, res) => {
  try {
    let getNotify = await libs.destroyData(db.notifications, { where: { user_id: req.creds.id } });

    res.status(200).json({ code: 200, message: "Cleared All Notifications", data: getNotify });
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
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
      where: { user_id: req.creds.id },
      include: [{
        model: db.drivers,
        attributes: ['username', 'profile_image'],
      }],
      order: [['created_at', 'DESC']]
    });

    let arr = []
    for (let i = 0; i < getRides.length; i++) {
      let getRating = await libs.getData(db.ratings, { where: { booking_id: getRides[i].booking_id } });
      let jsonData = getRides[i].toJSON();
      if (getRating) {
        jsonData.star = getRating.star
      }
      jsonData.driver.profile_image = `${process.env.driver_image_baseUrl}${getRides[i].driver.profile_image}`
      arr.push(jsonData)
    }

    res.status(200).json({ code: 200, message: "My All Rides", data: arr });
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};


const getSingleRide = async (req, res) => {
  try {
    let booking_id = req.query.booking_id;

    let getOneNotify = await libs.getData(db.myrides, { where: { user_id: req.creds.id, booking_id: booking_id } });

    let getDriverData = await libs.getData(db.drivers, { where: { id: getOneNotify.driver_id } });

    let edit_data = getOneNotify.toJSON();

    edit_data.driver_username = getDriverData.username
    edit_data.driver_profile_image = `${process.env.driver_image_baseUrl}${getDriverData.profile_image}`
    edit_data.star = null

    let getRating = await libs.getData(db.ratings, { where: { booking_id: booking_id } });
    if (getRating) { edit_data.star = getRating.star }

    res.status(200).json({ code: 200, message: "detail of 1 notification", data: edit_data });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
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

    // // let del = await libs.destroyData(db.offers,{where:{user_id:req.creds.id}})

    let getData = await libs.getAllData(db.offers, { where: { user_id: req.creds.id } });
    res.status(200).json({ code: 200, message: "users offer", data: getData });
  } catch (err) {
    console.log('------err---------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};

// destination search history
const previousHistory = async (req, res) => {
  try {
    let query = { where: { user_id: req.creds.id }, limit: 5, order: [['updated_at', 'DESC']] };

    let get = await libs.getAllData(db.search_history, query);

    res.status(200).json({ code: 200, message: "My previous search", data: get });
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};


const findNearByDrivers = async (req, res) => {
  try {
    let { latitude, longitude } = req.query;
    const distance = 15;

    const haversine = `(
        6371 * acos(cos(radians(${latitude}))* cos(radians(latitude))* cos(radians(longitude) - radians(${longitude}))+ sin(radians(${latitude})) * sin(radians(latitude)))
      )`;

    let findDrivers = await db.drivers.findAll({
      attributes: ['*', [db.sequelize.literal(haversine), 'distance']],
      where: db.sequelize.where(db.sequelize.literal(haversine), '<=', distance),
      where: {
        [Op.and]: [
          db.sequelize.where(db.sequelize.literal(haversine), '<=', distance),
          { driving_status: 'Online' },
        ],
      },
      raw: true,
      order: db.sequelize.col('distance'),

    });
    // console.log('-------findDrivers-----',findDrivers);

    res.status(200).json({ code: 200, message: "users offer", data: findDrivers });
  } catch (err) {
    console.log('-------err---------', err);
    ERROR.INTERNAL_SERVER_ERROR(res, err);
  }
};



module.exports = {
  numberSignup, numberLogin, logout, userProfile, editUserProfile, deleteUserAccount, calcRideAmount, cancelRide, findPreviousRide,//findNearbyDrivers ,
  sendMessage, getAllMessages, reportOnDriver, giveRating, support, getNotifications, clearNotifications, getMyRides, getSingleRide, getOffers, previousHistory, findNearByDrivers
};

