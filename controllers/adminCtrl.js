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

const getloginPage = async (req, res) => {
  try {
    console.log('---------req.cookies getLogin---------',req.cookies);
    console.log('---------req query--------',req.query);
    console.log('---------req body--------',req.body);
    
    if(req.cookies.pinkbodaToken){
      const pinkbodaToken = req.cookies.pinkbodaToken;
      console.log('---------pinkbodaToken---------',pinkbodaToken);
      if (pinkbodaToken) {
        const email = pinkbodaToken.email;
        const password = pinkbodaToken.password;
        console.log('------------render---------');
        res.render('login',{email: email, password: password, message: req.query.message|| ""});   //
        return;
      }
    }
    // if (pinkbodaToken) {
    //   console.log('---------req.cookies getLogin---------',req.cookies);
    //   const user = await libs.getData(db.admins,{where:{access_token: pinkbodaToken}});
    //   if (user) {
    //     res.render('login',{email:user.email, password:user.password});
    //     return;
    //   }
    // }
    res.render('login',{email:'',password:'',message: req.query.message || ""});
  } catch (err) {
    console.log('----err----',err);
    return res.redirect('/admin/login');
  }
};


const login = async(req, res) => {
  try {
    // console.log('----------body---post----------',req.body);
    // console.log('----------cookies 1----------',req.cookies);
    const {email,password,rememberMe} = req.body;
    const getData = await libs.getData(db.admins,{where:{email:email}});
    if (getData) {
      let checkPswrd = await commonFunc.compPassword(password, getData.password)
      if(!checkPswrd){
        if(getData.password != password){
          // return res.status(400).json({code:400,message:"Incorrect Password"})
          return res.redirect('/admin/login?message=Incorrect_Password');
        }
      }
      req.session.admin = getData.toJSON();
      req.session.role = "admin";
      // const token = await commonFunc.generateAccessToken(getData,{email:email},process.env.admin_secretKey);
      if (rememberMe) {
        res.cookie('pinkbodaToken', {email:email, password:password});
      }else{
        res.clearCookie('pinkbodaToken');
      }
      res.redirect('/admin/renderRider');
      return;
    } 
    else {
      return res.redirect('/admin/login?message=Email doesnt exist');
    }
  } catch (err) {
    console.log('-----log err-----',err);
    return res.redirect('/admin/login');
  }
};


const renderProfile = async (req, res) => {
  try {
    // let getAdminData = await libs.getData(db.admins,{});
    let getAdminData = req.session.admin;
    // getAdminData.profile_image = `${process.env.admin_imageUrl_ejs}${getAdminData.profile_image}`;
    res.render('profile',{
    // res.status(200).json({ message: 'Status toggled successfully', 
    getAdmin: getAdminData,search:""});
  } catch (err) {
    console.log('---err---',err);
    return res.redirect('/admin/login');
    ERROR.INTERNAL_SERVER_ERROR(res,err);
  }
};


const getEditProfilePage = async (req, res) => {
  try {
    let getData= await libs.getData(db.admins,{});
    // res.status(200).json({
    res.render('edit-profile' ,{getAdmin: getData,search:""});
  
  } catch (err) {
    return res.redirect('/admin/login');
    res.status(500).json({code:500,message:"password not match"})
  }
};

const editProfile = async (req, res,next) => {
  try {
    let getData= await libs.getData(db.admins,{});
    console.log('-------getData-------',getData);
    // let getData = req.session.admin;

    const {admin_name, admin_email} = req.body;
    let update = {};

    if (admin_name) { update.full_name = admin_name }
    // if (admin_email) { update.email = admin_email }

    if(req.file){
      if(getData.profile_image){
        fs.unlink(`${process.env.fs_admin_image_baseUrl}${getData.profile_image}`,(err)=>{if(err){return}})
      }
      update.profile_image= req.file.filename
    };
    
    const editProfile = await libs.updateData(getData,update);
    // const editProfile = await libs.findAndUpdate(db.admins, req.session.admin.id, update);
    if(editProfile.profile_image){
      req.session.admin.profile_image = editProfile.profile_image
      // editProfile.profile_image = `${process.env.admin_imageUrl_ejs}${editProfile.profile_image}`;
    }
    // res.status(200).json({
    // res.status(200).redirect('/admin/renderProfile')
    res.render('profile',{
      getAdmin: editProfile,search:""
    })
  } catch (err) {
    console.log('-----err-----',err);
    if(req.file){ fs.unlink(req.file.path, (err)=>{if (err) return})}
    return res.redirect('/admin/login',{message:""});
    ERROR.ERROR_OCCURRED(res, err);
  }
};


const getChangePasswordPage = async (req, res) => {
  try {
    res.render('change_password',{getAdmin:req.session.admin, message: req.query.message || "",search:""})
  } catch (err) {
    console.log('-------er-----',err);
    return res.redirect('/admin/login');
  }
};


const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    // const userId = req.creds.id;

    if(newPassword != confirmPassword){
      return res.redirect('/admin/getChangePasswordPage?message=New password and Confirm password doesnt match');
    }

    const getData = await libs.getData(db.admins, {});
        
    const passwordMatches = await commonFunc.compPassword(oldPassword,getData.password);
    if(!passwordMatches){
      if(getData.password != oldPassword){
        return res.redirect('/admin/getChangePasswordPage?message=Incorrect Password');
      }
    }
    let newhashPassword = await commonFunc.securePassword(newPassword);

    await libs.updateData(getData, {password: newhashPassword});

    return res.redirect('/admin/getChangePasswordPage?message=Password changed successfully')
    // return res.status(200).json({code:200,data: upatedData});
  } catch (err) {
    return res.redirect('/admin/getChangePasswordPage?message=""')
  }
};


const getForgotPswrdPage = async (req, res) => {
  // try {
  //   res.render('forgot_password');
  // } catch (err) {
  //   console.log('-------er-----',err);
  //   return res.status(500).json({code:500,message:err.message,error:err})
  // }
};

const forgotPassword = async (req, res) => {
//   try {
//     let 
    
//     res.render('forgot_password');
//   } catch (err) {
//     console.log('-------er-----',err);
//     return res.status(500).json({code:500,message:err.message,error:err})
//   }
};


const logout = async (req, res) => {
  try {
    if (req.session.admin) {
      // Destroy the session to log the user out
      req.session.destroy((err) => {
        if (err) {
          res.redirect('/admin/renderProfile');
        } else {
          // res.json({ message: 'Logout successful' });
          return res.redirect('/admin/login?message=Logout successful');
        }
      });
    } else {return res.redirect('/admin/login')}
  } catch (err) {
    res.redirect("/admin/login")
  }
};


// render full index.ejs
// const renderIndex = async (req, res) => {
//   try {
//     let skp = req.body.skip || 0;
//     // let query= {where:{},limit:10,offset:skp};
//     let query= {where:{is_admin_verified: "accepted"}, order: [['created_at', 'DESC']],};

//     let getDrivers = await libs.getAllData(db.drivers,query);
    
//     let getRiders= await libs.getAllData(db.users,{order: [['created_at', 'DESC']]});

//     // res.status(200).json({code:200,message:"ALL Drivers and Riders",
//     res.render('index',{
//       getRiders: getRiders,
//       getDrivers: getDrivers,
//       getAdmin: req.session.admin,
//       totalUsers:[...getDrivers,...getRiders],
//       userImageUrl: process.env.user_imageUrl_ejs,
//       driverImageUrl : process.env.driver_imageUrl_ejs
//     });

//   } catch (err) {
//     console.log('-----err-----',err);
//     return res.redirect('/admin/login')
//   }
// };

// const renderIndex = async (req, res) => {
// try {
//   // console.log('----------req.body----------',req.body);
//   // console.log('----------req.query--------',req.query);
//   // console.log('------------search 1------------',search);
//   const totalDriversCount = await db.drivers.count({ where: {is_admin_verified:'accepted'}});
//   const totalRidersCount= await db.users.count({where:{}});
//   const totalUsersCount= (totalDriversCount + totalRidersCount);
//   console.log('-----------totalUsersCount-------------',totalUsersCount);

//   let search = req.query.searchInput || '';                           // Get search input value

//   const driver_page =  parseInt(req.query.driver_page) || 1;       // Current page
//   const rider_page =  parseInt(req.query.rider_page) || 1;        // Current page

//   const itemsPerPage = 10;                                // Number of items per page
//   const driverOffset = (driver_page - 1) * itemsPerPage;        // Calculate offset for pagination
//   const riderOffset = (rider_page - 1) * itemsPerPage;        // Calculate offset for pagination

//   // console.log('------------search 1---------------',search);

//   let whereCondition = search ? {username:{[Op.like]:`%${search}%`}}:{};
//   whereCondition.is_admin_verified = 'accepted';

//   console.log('----------whereCondition-----------',whereCondition);
//   const getDrivers = await libs.getAllData(db.drivers, {
//     where: whereCondition,
//     limit: itemsPerPage,
//     driverOffset,
//     order: [['created_at', 'DESC']]
//   });
//   // console.log('--------------getDrivers-------------',getDrivers);

//   const totalDrivers = await db.drivers.count({ where: whereCondition});
//   const total_DriversPages = Math.ceil(totalDrivers / itemsPerPage);
//   console.log('------------total_DriversPages---------------',total_DriversPages);

//   const whereConditionUser = search ? {username:{[Op.like]:`%${search}%`}}:{};

//   const getRiders = await libs.getAllData(db.users,{
//     where: whereConditionUser,
//     limit: itemsPerPage,
//     riderOffset,
//     order: [['created_at', 'DESC']]
//   });
//   // console.log('--------------getRiders-------------',getRiders);
  
//   const totalRiders= await db.users.count({where:whereConditionUser});
//   const total_RidersPages = Math.ceil(totalRiders / itemsPerPage);
//   console.log('----------total_RidersPages---------',total_RidersPages);

// //  all Users section
//   let userslimit = 5;
//   let usersOffset = (riderOffset - 1) * userslimit;

//   // const getAllDrivers = await libs.getAllData(db.drivers, {
//   //   where: whereCondition,
//   //   limit: userslimit,
//   //   offset:usersOffset,
//   //   order: [['created_at', 'DESC']]
//   // });
//   const getAllDrivers =[];
//   // const getAllRiders = await libs.getAllData(db.users,{
//   //   where: whereConditionUser,
//   //   limit: userslimit,
//   //   offset: usersOffset,
//   //   order: [['created_at', 'DESC']]
//   // });
//   const getAllRiders =[];

//   const totalAllDrivers = await db.drivers.count({ where: whereCondition});
//   const total_AllDriversPages = Math.ceil(totalAllDrivers / itemsPerPage);

//   const totalAllRiders= await db.users.count({where:whereConditionUser});
//   const total_AllRidersPages = Math.ceil(totalAllRiders / itemsPerPage);

//   let totalUsers = [...getAllDrivers,...getAllRiders];

//   const total_UsersPages = Math.ceil(total_AllDriversPages+total_AllRidersPages);
//   console.log('----------total_UsersPages---------',total_UsersPages);

//   totalUsers.sort((a, b) => b.created_at - a.created_at);

//   // getDrivers.sort((a, b) => b.created_at - a.created_at);
//   // getRiders.sort((a, b) => b.created_at - a.created_at);

//   // res.status(200).json({
//   res.render('index', {
//     getDrivers: getDrivers,
//     getRiders : getRiders,
//     totalUsersCount,
//     totalDriversCount,
//     totalRidersCount,
//     totalRiders,
//     totalDrivers,
//     totalUsers: totalUsers,
//     userImageUrl: process.env.user_imageUrl_ejs,
//     driverImageUrl : process.env.driver_imageUrl_ejs,
//     getAdmin: req.session.admin || getAdmin,
//     itemsPerPage,
//     driver_page,
//     rider_page,
//     search,
//     total_UsersPages,
//     total_DriversPages,
//     total_RidersPages,
//   });
    
// } catch (err) {
//   console.log('-----err-------',err);
//   return res.redirect('/admin/login')
// }
// };


const renderIndex = async (req, res) => {
  try {
    // console.log('----------req.body----------',req.body);
    // console.log('----------req.query--------',req.query);
    // console.log('------------search 1------------',search);
    const totalDriversCount = await db.drivers.count({ where: {is_admin_verified:'accepted'}});
    const totalRidersCount= await db.users.count({where:{}});
    const totalUsersCount= (totalDriversCount + totalRidersCount);
    console.log('--------totalUsersCount-------',totalUsersCount);
  
    let search = req.query.searchInput || '';                           // Get search input value
  
    const driver_page =  parseInt(req.query.driver_page) || 1;        // Current page
    const rider_page =  parseInt(req.query.rider_page) || 1;          // Current page
    
    const itemsPerPage = 10;                                          // Number of items per page
    const driverOffset = (driver_page - 1) * itemsPerPage;            // Calculate offset for pagination
    const riderOffset = (rider_page - 1) * itemsPerPage;              // Calculate offset for pagination
  
    // console.log('------------search 1---------------',search);
  
    let whereCondition = search ? {username:{[Op.like]:`%${search}%`}}:{};
    whereCondition.is_admin_verified = 'accepted';
  
    console.log('----------whereCondition-----------',whereCondition);
    const getDrivers = await libs.getAllData(db.drivers, {
      where: whereCondition,
      limit: itemsPerPage,
      driverOffset,
      order: [['created_at', 'DESC']]
    });
    // console.log('--------------getDrivers-------------',getDrivers);
  
    const totalDrivers = await db.drivers.count({ where: whereCondition});
    const total_DriversPages = Math.ceil(totalDrivers / itemsPerPage);
    console.log('------------total_DriversPages---------------',total_DriversPages);
  
    const whereConditionUser = search ? {username:{[Op.like]:`%${search}%`}}:{};
  
    const getRiders = await libs.getAllData(db.users,{
      where: whereConditionUser,
      limit: itemsPerPage,
      riderOffset,
      order: [['created_at', 'DESC']]
    });
    // console.log('--------------getRiders-------------',getRiders);
    
    const totalRiders= await db.users.count({where:whereConditionUser});
    const total_RidersPages = Math.ceil(totalRiders / itemsPerPage);
    console.log('----------total_RidersPages---------',total_RidersPages);
  
    //  all Users section
    let userslimit = 5;
    let usersOffset = (riderOffset - 1) * userslimit;
  
    // const getAllDrivers = await libs.getAllData(db.drivers, {
    //   where: whereCondition,
    //   limit: userslimit,
    //   offset:usersOffset,
    //   order: [['created_at', 'DESC']]
    // });
    const getAllDrivers =[];
    // const getAllRiders = await libs.getAllData(db.users,{
    //   where: whereConditionUser,
    //   limit: userslimit,
    //   offset: usersOffset,
    //   order: [['created_at', 'DESC']]
    // });
    const getAllRiders =[];
  
    const totalAllDrivers = await db.drivers.count({ where: whereCondition});
    const total_AllDriversPages = Math.ceil(totalAllDrivers / itemsPerPage);
  
    const totalAllRiders= await db.users.count({where:whereConditionUser});
    const total_AllRidersPages = Math.ceil(totalAllRiders / itemsPerPage);
  
    let totalUsers = [...getAllDrivers,...getAllRiders];
  
    const total_UsersPages = Math.ceil(total_AllDriversPages+total_AllRidersPages);
    console.log('----------total_UsersPages---------',total_UsersPages);
  
    totalUsers.sort((a, b) => b.created_at - a.created_at);
  
    // getDrivers.sort((a, b) => b.created_at - a.created_at);
    // getRiders.sort((a, b) => b.created_at - a.created_at);
  
    // res.status(200).json({
    res.render('index', {
      getDrivers: getDrivers,
      getRiders : getRiders,
      totalUsersCount,
      totalDriversCount,
      totalRidersCount,
      totalRiders,
      totalDrivers,
      totalUsers: totalUsers,
      userImageUrl: process.env.user_imageUrl_ejs,
      driverImageUrl : process.env.driver_imageUrl_ejs,
      getAdmin: req.session.admin || getAdmin,
      itemsPerPage,
      driver_page,
      rider_page,
      search,
      total_UsersPages,
      total_DriversPages,
      total_RidersPages,
    });
      
  } catch (err) {
    console.log('-----err-------',err);
    return res.redirect('/admin/login')
  }
};


// const renderRider = async (req, res) => {
//   try {
//     let skp = req.body.skip || 0;
//     // let query= {where:{},limit:10,offset:skp};
//     let query= {order: [['created_at', 'DESC']]};

//     let getRiders = await libs.getAllData(db.users,query);
//     console.log('------getRiders------',getRiders);
    
//     // res.status(200).json({code:200,message:"getRiders",
//     res.render('riders',{
//       getRiders: getRiders,
//       userImageUrl: process.env.user_imageUrl_ejs,
//       getAdmin: req.session.admin
//     });
//   } catch (err) {
//     console.log('----err----',err);
//     return res.render('login')
//   }
// };

const renderRider = async (req, res) => {
  try {
    const totalDriversCount = await db.drivers.count({ where: {is_admin_verified:'accepted'}});
    const totalRidersCount= await db.users.count({where:{}});
    const totalUsersCount= (totalDriversCount + totalRidersCount);
    // console.log('--------totalUsersCount-------',totalUsersCount);
  
    let search = req.query.searchInput || '';              // Get search input value

    console.log('----------req.body----------',req.body);
    console.log('----------req.query--------',req.query);
    console.log('------------search 1---------------',search);

    const page =  parseInt(req.query.page) || 1;       // Current page
    const itemsPerPage = 10;                          // Number of items per page
    const offset = (page - 1) * itemsPerPage;        // Calculate offset for pagination

    const whereCondition = search ? {username:{[Op.like]:`%${search}%`}}:{};

    // console.log('----------whereCondition-----------',whereCondition);
    const getRiders = await libs.getAllData(db.users, {
      where: whereCondition,
      limit: itemsPerPage,
      offset,
      order: [['created_at', 'DESC']]
    });

    const totalUsers = await db.users.count({ where: whereCondition });
    const totalPages = Math.ceil(totalUsers / itemsPerPage);
    
    // console.log('------------totalPages---------------',totalPages);
    // console.log('------------search 2---------------',search);

    // res.status(200).json({
    res.render('riders', {
      getRiders: getRiders,
      userImageUrl: process.env.user_imageUrl_ejs,
      getAdmin: req.session.admin,
      itemsPerPage,
      totalItems: getRiders.length,
      page,
      search,
      totalPages,
      totalUsersCount,
      totalDriversCount,
      totalRidersCount
    });
  } catch (err) {
    console.log('-----err------',err);
    return res.redirect('/admin/login')
  }
};


const renderDriver = async (req, res) => {
  try {
    const totalDriversCount = await db.drivers.count({ where: {is_admin_verified:'accepted'}});
    const totalRidersCount= await db.users.count({where:{}});
    const totalUsersCount= (totalDriversCount + totalRidersCount);
  
    let search = req.query.searchInput || '';              // Get search input value

    const page =  parseInt(req.query.page) || 1;                        // Current page
    let pending_page =  parseInt(req.query.pending_page) || 1;          // Current pending_page
    const itemsPerPage = 10;                                            // Number of items per page
    const offset = (page - 1) * itemsPerPage;                           // Calculate offset for pagination
    let pending_page_offset = (pending_page - 1) * itemsPerPage;        // Calculate offset for pagination


    const whereCondition = search ? {username:{[Op.like]:`%${search}%`}}:{};
    whereCondition.is_admin_verified = 'accepted';

    const getDrivers = await libs.getAllData(db.drivers, {
      where: whereCondition,
      limit: itemsPerPage,
      offset,
      order: [['created_at', 'DESC']]
    });

    const totalDrivers = await db.drivers.count({ where: whereCondition });
    const totalPages = Math.ceil(totalDrivers / itemsPerPage);

    whereCondition.is_admin_verified="pending";

    let getPendingRequests = await libs.getAllData(db.drivers,{
      where: whereCondition,
      limit: itemsPerPage,
      offset: pending_page_offset,
      order: [['created_at', 'DESC']]
    });
    
    const total_pendingDrivers = await db.drivers.count({ where: whereCondition });
    const total_pendingPages = Math.ceil(total_pendingDrivers / itemsPerPage);
    // console.log('------------total_pendingDrivers---------------',total_pendingDrivers);
    // console.log('------------total_pendingPages---------------',total_pendingPages);
    console.log('------------search 2---------------',search);
    // console.log('------------getPendingRequests---------------',getPendingRequests);

    // res.status(200).json({
    res.render('drivers', {
      getDrivers: getDrivers,
      pendingRequests : getPendingRequests,
      driverImageUrl : process.env.driver_imageUrl_ejs,
      getAdmin: req.session.admin ,
      itemsPerPage,
      page,
      pending_page,
      search,
      totalPages,
      total_pendingPages,
      totalUsersCount,
      totalDriversCount,
      totalRidersCount
    });
  } catch (err) {
    console.log('-----err------',err);
    res.redirect('/admin/login')
    return;
  }
};


const actionOnDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    let query = {where:{id:driverId}}
    const driver = await libs.getData(db.drivers,query);
    if (driver) {
      driver.action = driver.action === 'Enable' ? 'Disable' : 'Enable';
      driver.access_token = null;
      await driver.save();
      // res.status(200).send(driver.action);
      res.status(200).json({ message: 'Status toggled successfully', data:driver.action});
    }
  } catch (err) {
    console.log('---err---',err);
    res.redirect('/admin/login')
  }
};


const actionOnUser = async (req, res) => {
  try {
    const { riderId } = req.params;
    let query = {where:{id:riderId}}
    const rider = await libs.getData(db.users,query);
    if (rider) {
      rider.action = rider.action === 'Enable' ? 'Disable' : 'Enable';
      rider.access_token = null;
      await rider.save();
      res.status(200).json({ message: 'Status toggled successfully', data:rider.action });
    }
  } catch (err) {
    console.log('---err---',err);
    res.redirect('/admin/login')
  }
};


const pendingRequests = async (req, res) => {
  try {
    const { pendingAction,driverId } = req.query;

    let updateRequest=null;

    if(pendingAction == 'accepted'){
      // send mail to the driver, admin accepted your signup request

      updateRequest = await libs.findAndUpdate(db.drivers,driverId, {is_admin_verified:pendingAction,driving_status:'Online',action:"Enable"});
    }else{
      let getData= await libs.getData(db.drivers,{where:{id:driverId}});

      let images=['profile_image','license','id_card','passport_photo','vechile_insurance'];

      for(let key of images){
        fs.unlink(`${process.env.fs_driver_image_baseUrl}${getData[key]}`,(err)=>{if(err){return}})
      }
      updateRequest = await libs.destroyData(getData,{force:true});
    }
    
    res.status(200).send(updateRequest);
    // res.status(200).json({message:'Status toggled successfully', data:updateRequest});
  } catch (err) {
    res.render('login')
  }
};

// const renderHelpSupport = async (req, res) => {
//   try {
//     console.log('----------req.session.admin-----------',req.session.admin);
    // const usersData = await libs.getAllData(db.supports,{
    //   where: {user_id: {[Op.gt]: 0}},
    //   include: [{model: db.users,attributes:["id","username","image","mobile_number"]}],
    // });
    
//     const driversData = await libs.getAllData(db.supports,{
//       where: {driver_id: {[Op.gt]: 0}},
//       include: [{model: db.drivers,attributes:["id","username","profile_image","mobile_number"]}],
//     });
    
//     // For example, combine usersData and driversData into a single array
//     const combinedData = usersData.concat(driversData);
//     combinedData.sort((a, b) => b.created_at - a.created_at);
       
//     // res.status(200).json({message:'help support data',
//     res.render('help&support',{
//      supportData: combinedData,
//      driverImageUrl : process.env.driver_imageUrl_ejs,
//      userImageUrl: process.env.user_imageUrl_ejs,
//      getAdmin: req.session.admin
//     });
//   } catch (err) {
//     console.log('--------err---------',err);
//     res.redirect("/admin/login")
//   }
// };


// working in this

const renderHelpSupport = async (req, res) => {
try {
  let search = req.query.searchInput || '';              // Get search input value

  console.log('----------req.body----------',req.body);
  console.log('----------req.query--------',req.query);
  console.log('------------search 1---------------',search);

  const page =  parseInt(req.query.page) || 1;       // Current page
  const itemsPerPage = 10;                          // Number of items per page
  const offset = (page - 1) * itemsPerPage;        // Calculate offset for pagination

  // const whereCondition = search ? {username:{[Op.like]:`%${search}%`}}:{};
  const whereCondition = {};
  console.log('-----------whereCondition------------',whereCondition);

  let query= {
    include: [{
        model: db.users,
        attributes: ["id", "username", "image", "mobile_number"],
        required: false,                                       // Use "required: false" to make it a LEFT JOIN
        where: {username: {[Op.like]: `%${search}%`}},
      },
      {
        model: db.drivers,
        attributes: ["id", "username", "profile_image", "mobile_number"],
        required: false,                                        // Use "required: false" to make it a LEFT JOIN
        where: {username: {[Op.like]: `%${search}%`}},
      },
    ],
    where: {
      [Op.or]: [{'$user.username$': {[Op.ne]: null}},{'$driver.username$': {[Op.ne]: null}}],
    },
    offset,
    limit: itemsPerPage,
    order: [['created_at', 'DESC']],
  }
  const supportData = await await libs.getAllData(db.supports,query);
  delete query.offset;
  delete query.limit;
  delete query.order;
  const totalUsers = await db.supports.count(query);
  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  console.log('------------totalUsers---------------',totalUsers);
  console.log('------------totalPages---------------',totalPages);
  console.log('------------totalPages---------------',totalPages);
  
  // res.status(200).json({message:'help support data',
    res.render('help&support', {
    supportData: supportData,
    driverImageUrl: process.env.driver_imageUrl_ejs,
    userImageUrl: process.env.user_imageUrl_ejs,
    getAdmin: req.session.admin,
    page,
    search,
    totalPages,
  });

} catch (err) {
  console.log('--------err---------', err);
  return res.status(200).json({err})
  res.redirect('/admin/login');
}
};


const termsAndConditions = async (req, res) => {
  try {
    res.render('termsAndConditions')
    } catch (err) {
    res.redirect("/admin/login")
  }
}


const resolvedIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    let query = {where:{id: issueId}}

    const getSupport = await libs.getData(db.supports,query);

    if(getSupport.issue_status == 'Unselected'){
      getSupport.issue_status = 'Resolved'
    }
    await getSupport.save();
    // console.log('-----------getSupport---------',getSupport);
    return res.status(200).json({ message:'Issue resolved successfully',data: getSupport.issue_status})
  } catch (err) {
    res.redirect("/admin/login")
  }
}

const massPushPage = async (req, res) => {
  try {
    res.render('mass_push', { getAdmin:req.session.admin,search:""});
  } catch (err) {
    console.log('----err----',err);
    res.redirect("/admin/login")
  }
};


// const sendMassPush = async (req, res) => {
//   try {
//     const {role,title,description} = req.body;

//     let getUsers = await libs.getAllData(db.users, {});
//     let getDrivers = await libs.getAllData(db.drivers, {});

//     let data={
//       title: title,
//       message: description,
//       pushType:'masspush'
//     }

//     let driversData = [];
//     let usersData = [];

//     let driverDeviceTokens = [];
//     let userDeviceTokens = [];

//     for(let key of getDrivers){
//       driversData.push({
//         driver_id: key.id,
//         title: title,
//         message: description,
//         pushType:'masspush'
//       })
//       if(key.device_token){ driverDeviceTokens.push(key.device_token)}
//     }

//     for(let key of getUsers){
//       usersData.push({
//         user_id: key.id,
//         title: title,
//         message : description,
//         pushType:'masspush'
//       })
//       if(key.device_token){ userDeviceTokens.push(key.device_token)}
//     }
    
//     if (role === 'Driver' || role === 'Both') {
//       Notify.sendMassNotifyToDriver(data, driverDeviceTokens);
//       await libs.createData(db.notifications, driversData);
//     }
//     if (role === 'Rider' || role === 'Both') {
//       Notify.sendMassNotifyToUser(data, userDeviceTokens);
//       await libs.createData(db.notifications, usersData);
//     }
//     res.redirect('/admin/massPushPage');

//   } catch (err) {
//     res.redirect("/admin/login")
//   }
// };


const sendMassPush = async (req, res) => {
  try {
    const {role,title,description} = req.body;

    let getUsers = await libs.getAllData(db.users, {});
    let getDrivers = await libs.getAllData(db.drivers, {});

    let data={
      title: title,
      message: description,
      pushType:'masspush'
    }
  
    if (role === 'Driver' || role === 'Both') {
      for(let key of getDrivers){

        let driver_dt = { driver_id: key.id, ...data }

        await libs.createData(db.notifications, driver_dt);
        if(key.device_token){ Notify.sendNotifyToDriver(data, key.device_token);}
      }
    }

    if (role === 'Rider' || role === 'Both') {
      for(let key of getUsers){

        let user_dt = { user_id: key.id, ...data }

        await libs.createData(db.notifications, user_dt);
        if(key.device_token){Notify.sendNotifyToUser(data,key.device_token)}
      }
    }
    res.redirect('/admin/massPushPage');

  } catch (err) {
    console.log('-------err--------------',err);
    res.redirect("/admin/login")
  }
};



module.exports= {addAdmin,getloginPage,login,getChangePasswordPage,changePassword,getForgotPswrdPage,forgotPassword,logout,renderIndex,actionOnDriver,getEditProfilePage,editProfile,renderRider,renderDriver,actionOnUser,pendingRequests,renderHelpSupport,termsAndConditions,renderProfile,resolvedIssue, massPushPage, sendMassPush}
