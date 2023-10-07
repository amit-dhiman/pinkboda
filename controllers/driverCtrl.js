const db = require('../models/index');
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
require('dotenv').config();
const CONFIG = require('../config/scope');
const ERROR= require('../config/responseMsgs').ERROR;
const SUCCESS= require('../config/responseMsgs').SUCCESS;
const fs = require('fs');
const Notify = require('../libs/notifications');
const { Op } = require('sequelize');


const driverSignup = async (req, res) => {
  try {
    let {username,gender,country_code,mobile_number,model,license_plate,year,device_type, device_token} = req.body;
    console.log('------req.files-------',req.files); 
    const getData=await libs.getData(db.drivers,{where:{mobile_number: mobile_number}});

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
      model: model,
      license_plate: license_plate,
      year: year,
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
    console.log('---------saveData---------',saveData.toJSON());

    let token_info = { id: saveData.id, mobile_number: saveData.mobile_number };
    let token = await commonFunc.generateAccessToken(saveData, token_info, process.env.driver_secretKey);
    console.log('-----token-------',token.toJSON());

    if(req.files.license){token.license= `${process.env.driver_image_baseUrl}${req.files.license[0].filename}`}
    if(req.files.id_card){token.id_card= `${process.env.driver_image_baseUrl}${req.files.id_card[0].filename}`}
    if(req.files.passport_photo){token.passport_photo= `${process.env.driver_image_baseUrl}${req.files.passport_photo[0].filename}`}
    if(req.files.vechile_insurance){token.vechile_insurance= `${process.env.driver_image_baseUrl}${req.files.vechile_insurance[0].filename}`}

    return SUCCESS.DEFAULT(res,"signUp successfully", token);
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


      if(token.profile_image){token.profile_image= `${process.env.driver_image_baseUrl}${token.profile_image}`}
      if(token.license){token.license= `${process.env.driver_image_baseUrl}${token.license}`}
      if(token.id_card){token.id_card= `${process.env.driver_image_baseUrl}${token.id_card}`}
      if(token.passport_photo){token.passport_photo= `${process.env.driver_image_baseUrl}${token.passport_photo}`}
      if(token.vechile_insurance){token.vechile_insurance= `${process.env.driver_image_baseUrl}${token.vechile_insurance}`}


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
  //   if (profile_image) {update.profile_image = profile_image }

    if(req.files){
      for(let key in req.files){
        fs.unlink(`${process.env.driver_image_baseUrl}${userData[key]}`,(err)=>{
          if(err){
          console.log('-------key---------',key);
          console.log('-------err---------',err);
          return
        }})
        update[key] = req.files[key][0].filename
      }
    } 
    console.log('---------update----------',update);
    console.log('---------req.files----------',req.files);    
    const editProfile = await libs.updateData(userData, update);

    if(editProfile.profile_image && !req.files.profile_image){editProfile.profile_image= `${process.env.driver_image_baseUrl}${editProfile.profile_image}`}
    if(editProfile.license && !req.files.license){editProfile.license= `${process.env.driver_image_baseUrl}${editProfile.license}`}
    if(editProfile.id_card && !req.files.id_card){editProfile.id_card= `${process.env.driver_image_baseUrl}${editProfile.id_card}`}
    if(editProfile.passport_photo && !req.files.passport_photo){editProfile.passport_photo= `${process.env.driver_image_baseUrl}${editProfile.passport_photo}`}
    if(editProfile.vechile_insurance && !req.files.vechile_insurance){editProfile.vechile_insurance= `${process.env.driver_image_baseUrl}${req.files.vechile_insurance}`}

    if(req.files){
      for(let key in req.files){
        console.log('-------------------',`${process.env.driver_image_baseUrl}${req.files[key][0].filename}`);
        editProfile[key] = `${process.env.driver_image_baseUrl}${req.files[key][0].filename}`}
    }

    return SUCCESS.DEFAULT(res,"profile updated successfully", editProfile);
  } catch (err) {
    console.log('---------err----------',err);
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


const cancelRide = async (req, res) => {
  try {
    let query= {
      driver_id: req.creds.id,
      id: req.body.booking_id,
      // booking_status:"pending"
    }
    let updateMsg= await libs.updateData(db.bookings,{cancel_reason: req.body.cancel_reason, cancelled_by:"Driver"});
    let deleteData = await libs.destroyData(db.bookings,{where:query});
    
    if(deleteData){
      let getUserData= await libs.getData(db.users,{id:req.body.user_id});

      //  ---------send notification----------
      let notifyData = {
        title: "Ride cancelation",
        message: "your ride has been canceled",
        user_id: req.body.user_id,
        driver_id: req.creds.id,
        booking_id: req.body.booking_id
      }

      const sendNotify= await Notify.sendNotifyToUser(notifyData,getUserData.device_token);
      console.log('-----sendNotify---------',sendNotify);

      // notifyData
      const saveNotify= await libs.createData(db.notifications,notifyData)

      return res.status(200).json({code:200,message:"your ride has been canceled"});
    }
    res.status(200).json({code:200,message:"cant cancelled the ride or maybe wrong boooking id"});
  } catch (err) {
    res.status(500).json({code:500,message:err.message});
  }
};

const endRide = async (req, res) => {
  try {
    let {booking_id,user_id }= req.body;
    // let updateEndRide = await libs.updateData(db.bookings,{booking_status:"completed"},{where:{ id:booking_id }});
    let updateEndRide = await libs.findAndUpdate(db.bookings,booking_id,{booking_status:"completed"});

    if(updateEndRide){
      let data = {
        "pickup_long": updateEndRide.pickup_long,
        "pickup_lat": updateEndRide.pickup_lat,
        "drop_long": updateEndRide.drop_long,
        "drop_lat": updateEndRide.drop_lat,
        "pickup_address": updateEndRide.pickup_address,
        "drop_address": updateEndRide.drop_address,
        "vechile_type":updateEndRide.vechile_type,
        "amount": updateEndRide.amount,
        "ride_status": "Completed",
        "driver_id": req.creds.id,
        "user_id": user_id,
        "booking_id":updateEndRide.id,
      }
      
      let save = await libs.createData(db.myrides,data);
      // console.log('------save------',save.toJSON());

      let notify_data={
        title: 'Ride Completed',
        message: 'Your ride has been completed',
      }
      let getData= await libs.getData(db.users,{
        where:{id:user_id},
        attributes:["id","username","device_token"]
      })
  
      Notify.sendNotifyToUser(notify_data,getData.device_token);
  
      return res.status(200).json({code:200,message:"Ride Completed"});
    }
    return res.status(200).json({code:404,message:"boooking not found"});
    
  } catch (err) {
    console.log('----err-----',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};

const sendMessage = async (req, res) => {
  try {
    let data= {
      sender_id: req.creds.id,
      receiver_id: req.body.receiver_id,
      booking_id: req.body.booking_id,
      message: req.body.message,
      sender_type: "Driver"
    }
    console.log('----data-----',data);
    let saveData = await libs.createData(db.chats,data);
    console.log('----saveData---',saveData);

    let getData = await libs.getData(db.users, {
      where: { id: data.receiver_id },
      attributes: ["id","username", "device_token"],
    });

    let notify_data={
      title: 'driver sends you a message',
      message: data.message,
    }

    Notify.sendNotifyToUser(notify_data,getData.device_token);

    res.status(200).json({code:200,message:"message saved",data: saveData});
  } catch (err) {
    console.log('-----err-----',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const getAllMessages = async (req, res) => {
  try {
    let query= {where: { booking_id: req.query.booking_id }}

    let getData = await libs.getAllData(db.chats,query);
    console.log('----getData---',getData);

    res.status(200).json({code:200,message:"get my all messages",data: getData});
  } catch (err) {
    console.log('------err------',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


// To show Accept Or Reject Rides

const pendingListing = async (req, res) => {
    try {   // {where: bookin_id: , booking_status:"pending"}
    //   let pendingList =await libs.getData(db.bookings,{where})
      res.status(200).json({code:204,message:"show pending list",data:pendingList});    
  
    } catch (err) {
      ERROR.ERROR_OCCURRED(res, err);
    }
};

const reportOnUser = async (req, res) => {
  try {
    console.log('------req.body---------',req.body);
    let data= {
      driver_id: req.creds.id,
      user_id: req.body.user_id,
      booking_id: req.body.booking_id,
      report_message: req.body.report_message,
      reported_by:"Driver"
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

const support = async (req, res) => {
    try {
      let data= {
        driver_id: req.creds.id,
        email: req.body.email,
        message: req.body.message,
      }
      let saveSupport = await libs.createData(db.supports, data);
  
      res.status(200).json({code:200,message:"Your messages has been sent successfully"});
    } catch (err) {
        console.log('-----err-----------',err);
      ERROR.INTERNAL_SERVER_ERROR(res,err);
    }
};

const getNotifications = async (req, res) => {
  try {
  //   let data= {
  //     driver_id: req.creds.id,
  //     email: "abc@gmail.com",
  //     message: "hiii",
  //     title: "chat"
  //   }

  //   let save = await libs.createData(db.notifications, data);
  //   console.log('-----save------',save.toJSON());

    let getNotify = await libs.getAllData(db.notifications, {where:{driver_id: req.creds.id}});

    res.status(200).json({code:200,message:"get All Notifications",data: getNotify});
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};

const clearNotifications = async (req, res) => {
    try {
      let getNotify = await libs.destroyData(db.notifications, {where:{driver_id: req.creds.id}});
  
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
      //   "driver_id": req.creds.id,
      //   "user_id": 1,
      //   "booking_id": 1,
      // }
      // // bookings me se data find kr k rides wali mw save krva do manually api se hi
      // let save = await libs.createData(db.myrides,data);
      // console.log('-------save--------',save.toJSON());
      
      let getRides = await libs.getAllData(db.myrides, {
        where:{driver_id: req.creds.id},
        include:[{
          model: db.users,
          attributes: ['username','image'],
        }],
      });
        
      let arr = []
      if(getRides.length){
        for(let i=0;i<getRides.length; i++){
          let getRating = await libs.getData(db.ratings,{where:{booking_id:getRides[i].booking_id}});
          let jsonData = getRides[i].toJSON();
          if(jsonData.user.image){jsonData.user.image= `${process.env.user_image_baseUrl}${jsonData.user.image}`}

          if(getRating){ jsonData.star = getRating.star }

          arr.push(jsonData)
        }
      }
  
      res.status(200).json({code:200,message:"My All Rides",data: arr});
    } catch (err) {
      ERROR.INTERNAL_SERVER_ERROR(res,err);
    }
};

// get single notification detail
const getSingleRide = async (req, res) => {
  try {
    let booking_id = req.query.booking_id;

    let getOneNotify = await libs.getData(db.myrides, {where:{driver_id: req.creds.id,booking_id:booking_id}});
    if(!getOneNotify){
      res.status(404).json({code:404,message:"notification not found",data: getOneNotify });
    }

    let getUserData = await libs.getData(db.users, {where:{id: getOneNotify.user_id}});

    let edit_data = getOneNotify.toJSON();

    edit_data.user_username = getUserData.username;
    edit_data.user_profile_image = getUserData.profile_image;
    edit_data.star= null;

    let getRating = await libs.getData(db.ratings, {where:{booking_id: booking_id}});
    if(getRating){edit_data.star = getRating.star}

    res.status(200).json({code:200,message:"detail of 1 notification",data: edit_data });
  } catch (err) {
    console.log('--------err--------',err);
    res.status(500).json({code:500,message: err.message,error:err});
  }
};

const getTotalRatings = async (req, res) => {
  try {
    let getNotify = await libs.getAllData(db.ratings, {
      where:{ driver_id: req.creds.id},
      include:[{
        model: db.users,
        attributes: ["username","image"]
      }]
    });

    const allRatings = getNotify.map(item => {
      if(item.user.image){item.user.image=`${process.env.user_image_baseUrl}${item.user.image}`}
      return item;
    });

    function calculateStarPercentages(data) {
      const totalRatings = data.length;
      const starCounts = [0, 0, 0, 0, 0]; 
  
      for (const item of data) {
        starCounts[item.star - 1]++;
      }
      const starPercentages = starCounts.map(count => (count / totalRatings) * 100);
      return starPercentages;
    }
  
    const starPercentages = calculateStarPercentages(allRatings);

    let obj = {
      star_5: starPercentages[4] || 0,
      star_4: starPercentages[3] || 0,
      star_3: starPercentages[2] || 0,
      star_2: starPercentages[1] || 0,
      star_1: starPercentages[0] || 0,
    };

    let totalStars = 0;
    for (const item of allRatings) {
      totalStars += item.star;
    }

    const averageRating = totalStars / allRatings.length;
    console.log("Average Star Rating:", averageRating);

    res.status(200).json({code:200,message:"get All Ratings",
    "overAllRating": averageRating, 
    "totalReviews":allRatings.length,
    "percentageData": obj,
    "data": allRatings
    });
  } catch (err) {
    console.log('------err--------',err);
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};

const findPreviousRide = async (req, res) => {
  try {
    
    let findRide = await libs.getData(db.bookings,{
      where:{driver_id: req.creds.id, booking_status: 'accept'}, // {[Op.or]:['accept']},'pending'
      include:db.users
    });

    if(!findRide){
      return res.status(404).json({code:404,message: "Ride not found"});
    }
    findRide.user.image = `${process.env.user_image_baseUrl}${findRide.user.image}`

    res.status(200).json({code:200,message:"You have pending previous ride",data:findRide});
  } catch (err) {
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};



module.exports={driverSignup, login,logout,driverProfile,editDriverProfile,deleteDriverAccount,updateDriversLocation,cancelRide,endRide,sendMessage, getAllMessages, pendingListing, reportOnUser,support,getNotifications,clearNotifications,getMyRides, getSingleRide,getTotalRatings,findPreviousRide}
