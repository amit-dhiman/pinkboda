const db = require('../models/index');
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
require('dotenv').config();
const sequelize = require('sequelize');
const Notify = require('../libs/notifications');

//const { Op, Sequelize } = require("sequelize")

// Create a map to store driver socket connections
const driverSockets = new Map();


// Function to set up Socket.io events
function setupSocketEvents(socket, io) {
  socket.on('new_ride_request_send', (riderPickupLocation) => {
    //console.log(socket.id);
    console.log('--------------new_ride_request_send-1-----------------');
    const socketId = socket.id;
    driverSockets.set(1, socket.id);
    //console.log('New ride request:', riderPickupLocation);
    requestRide(riderPickupLocation, io);
  });


  socket.on('accept_ride', (driver) => {
    //console.log(socket.id);
    // console.log('Accepted driver-----:', driver);
    acceptRideRequest(driver, io);
  });


  socket.on('update_driver_loc', (driver) => {
    //console.log(socket.id);

    driverSockets.set(1, socket.id);
    updateLoc(driver, io);
  });


  socket.on('update_driver_status', (driver) => {
    //console.log(socket.id);

    // driverSockets.set(1, socket.id);
    //console.log('Loc update driver-----:', driver);
    updateDirStatus(driver, io);
  });



  socket.on('update_user_socket', (user) => {
    // driverSockets.set(1, socket.id);
    // console.log('Loc update driver-----:', user);
    updateUserSocket(user, io);
  });



  socket.on('user_cancel_request', (user) => {
    //console.log('Loc update driver-----:', user);
    userCancel(user, io);
  });


  socket.on('start_ride', (user) => {
    //console.log('Ride endded-----:', user);
    driverStartRide(user, io);
  });


  socket.on('end_ride', (user) => {
    //console.log('Ride endded-----:', user);
    driverEndRide(user, io);
  });


  socket.on('ride_chat', (chatData) => {
    //console.log('New message-----:', chatData);
    rideChat(chatData, io);
  });


  // update driver location after ride confirm to show user
  socket.on('update_driver_loc_after_confirm', (data) => {
    //console.log('New message-----:', chatData);
    updateDriverLocAfterConfirm(data, io);
  });

   socket.on('cancel_ride_after_accept', (data) => {
    //console.log('New message-----:', chatData);
    cancelRideAfterAccept(data, io);
  });

  // Add other socket event handlers here, as needed
}


async function requestRide(riderPickupLocation, io) {
  // console.log('----------riderPickupLocation------------',riderPickupLocation);
  let models = db.drivers;
  let modelsRequest = db.requests;
  try {
    let userLatitude = riderPickupLocation.pickupLatitude;
    let userLongitude = riderPickupLocation.pickupLongitude;
    let genderPreference = riderPickupLocation.genderPreference;
    let response = await models.findAll({
      attributes: ['id','username','latitude','longitude','socket_id',
      [sequelize.literal(`6371 * acos(
          cos(radians(${userLatitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${userLongitude})) +
          sin(radians(${userLatitude})) * sin(radians(latitude)))`),
          'distance',
        ],
      ],
      where: {
        [sequelize.Op.and]: [sequelize.where(sequelize.literal(`6371 * acos(
            cos(radians(${userLatitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${userLongitude})) +
            sin(radians(${userLatitude})) * sin(radians(latitude)))`), '<=',10 ),     // 10 km radius
          { driving_status: 'online' }, // Adding the status condition here
          { gender: genderPreference } // Gender condition
        ]
      },
      order: [[sequelize.col('distance'), 'ASC']],
      limit: 10, // Limit the results to 10 drivers
    });

    for (const driver of response) {
      // console.log("-------Here is driver socket id --in for loop----------------------------",driver);
      if (driver && driver.socket_id) {
        // Send a ride request to the driver
        //console.log("Here we send request to driver====================");
        dataRequest = { request_id: riderPickupLocation.rideTimestamp, driver_id: driver.id };
        let saveRequest = await modelsRequest.create(dataRequest);
        // console.log('----------saveRequest----------',saveRequest);

        io.to(driver.socket_id).emit('new_ride_request', riderPickupLocation);
        //io.emit('new_ride_request', riderPickupLocation);
        // Add push notifiction code here also save notification message in db
        // You can add additional logic here, like tracking which drivers received the request
      }
    }
  } catch (error) {
    throw error
  }
}





// Function to request a ride
// async function requestRide(riderPickupLocation, io) {
//   console.log('----------riderPickupLocation------------',riderPickupLocation);
//   // Sort drivers by distance from the rider's pickup location
//   //console.log(riderPickupLocation);
//   let models = db.drivers;
//   let modelsRequest = db.requests;
//   try {
//     let userLatitude = riderPickupLocation.pickupLatitude;
//     let userLongitude = riderPickupLocation.pickupLongitude;
//     let genderPreference = riderPickupLocation.genderPreference;
//     // Query to retrieve nearby drivers within a 1 km radius in ascending order
//     let response = await models.findAll({
//       attributes: ['id','username','latitude','longitude','socket_id',
//       [sequelize.literal(`6371 * acos(
//           cos(radians(${userLatitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${userLongitude})) +
//           sin(radians(${userLatitude})) * sin(radians(latitude)))`),
//           'distance',
//         ],
//       ],
//       where: {
//         [sequelize.Op.and]: [sequelize.where(sequelize.literal(`6371 * acos(
//             cos(radians(${userLatitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${userLongitude})) +
//             sin(radians(${userLatitude})) * sin(radians(latitude)))`), '<=',10 ),     // 10 km radius
//           { driving_status: 'online' }, // Adding the status condition here
//           { gender: genderPreference } // Gender condition
//         ]
//       },
//       order: [[sequelize.col('distance'), 'ASC']],
//       limit: 10, // Limit the results to 10 drivers
//     });

//     //console.log('All near by driver are here------',response);
//     //console.log("here is available Drivers for this location =============================",response);

//     for (const driver of response) {
//       console.log("Here is driver socket id ------------------------------",driver);
//       if (driver && driver.socket_id) {
//         // Send a ride request to the driver
//         //console.log("Here we send request to driver====================");
//         dataRequest = { request_id: riderPickupLocation.rideTimestamp, driver_id: driver.id };
//         await modelsRequest.create(dataRequest);
//         io.to(driver.socket_id).emit('new_ride_request', riderPickupLocation);
//         //io.emit('new_ride_request', riderPickupLocation);
//         // Add push notifiction code here also save notification message in db
//         // You can add additional logic here, like tracking which drivers received the request
//       }
//     }
//   } catch (error) {
//     throw error
//   }
// }

// Function to accept a ride request (for drivers)
async function acceptRideRequest(driver, io) {
  //const acceptingDriver = availableDrivers.find((driver) => driver.id === driverId);
  //console.log("Here we have accpted od ============------------------+++++++++++++++++++++",driver);
  if (driver) {
    // Simulate accepting the ride request
    //console.log(`accepted the ride request!`);
    try {
      //io.emit('new_ride_request', acceptingDriver);
      let models = db.drivers;
      let modelsRequest = db.requests;

      dataRequest = { pickup_long: driver.pickupLongitude, pickup_lat: driver.pickupLatitude, drop_long: driver.destinationLongitude, drop_lat: driver.destinationLatitude, pickup_address: driver.pickupAddress, drop_address: driver.destinationAddress, booking_status: 'accept', amount: driver.price, ride_type: 'Ride', driver_gender: driver.genderPreference, user_id: driver.userId, driver_id: driver.driverId};

      let savingResponse = await db.bookings.create(dataRequest);
      const lastBookingId = savingResponse.id;
      driver.bookingId = lastBookingId;

      let responceRequest = await modelsRequest.findAll({where:{request_id: driver.rideTimestamp}});

      //console.log("All Request D===================",responceRequest);
      let responceUser = await db.users.findOne({ where: { id: driver.userId } });
      let responceDriver = null;
      for (const driver2 of responceRequest) {
        responceDriver = await models.findOne({ where: { id: driver2.driver_id } });
        if (responceDriver.id == driver.driverId) {
          driver.driverName = responceDriver.username;
          driver.driverProfile =`${process.env.driver_image_baseUrl}${responceDriver.profile_image}`;
          driver.driverRating = responceDriver.over_all_rating;
          driver.driverMobileNo = responceDriver.mobile_number;
          driver.vehicleModel = responceDriver.model;
          driver.vehicleNo = responceDriver.license_plate;
        }
        //console.log("All Request D===================",responceDriver);

        io.to(responceDriver.socket_id).emit('ride_request_accepted', driver);
        //console.log('Ride request accepted:', driver);
      }
      io.to(responceUser.socket_id).emit('ride_request_confirm', driver);

      let notify_data={
        title: "Ride Accepted",
        message:`Driver(${responceDriver.username}) Acepted your ride`,
        user_id: driver.userId, driver_id: driver.driverId 
      }
      Notify.sendNotifyToUser(notify_data,responceUser.device_token)

      let saveNotify= await libs.createData(db.notifications,notify_data)
      console.log('-------saveNotify---------',saveNotify);
      //query save data of acceped ride will be added here
      // Add push notifiction code here also save notification message in db
      //io.emit('ride_request_accept', driver);
    } catch (error) {
      console.error('Error emitting ride_request_accepted:', error);
    }
  }
}

// function acceptRideRequest(driverId, io) {
//   const acceptingDriver = availableDrivers.find((driver) => driver.id === driverId);
//   console.log("Here we have accpted od ============------------------+++++++++++++++++++++",acceptingDriver);
//   if (acceptingDriver) {
//     // Simulate accepting the ride request
//     console.log(`${acceptingDriver.name} accepted the ride request!`);
//     // Notify the rider that the request has been accepted
//     //io.to(socket.riderSocketId).emit('ride_request_accepted', acceptingDriver);
//     try {
//     //io.emit('new_ride_request', acceptingDriver);
//     io.emit('ride_request_accept', acceptingDriver);
//     console.log('Ride request accepted:', acceptingDriver);
//     } catch (error) {
//     console.error('Error emitting ride_request_accepted:', error);
//     }
//   }
// }


async function updateLoc(driver, io) {
  if (driver) {
    try {
      let models = db.drivers;
      let response = await models.update({ latitude: driver.latitude, longitude: driver.longitude, socket_id: driver.socketId }, {
        where: { id: driver.driverId }
      })
      const sendResponse = { code: 200, message: "Updated" };
      io.emit('location_updated', sendResponse);
      // console.log('Ride request accepted:', driver);
      // console.log(`${driver} loc updated successfully`);
      //return response
    } catch (error) {
      throw error
    }
  }
}


async function updateDirStatus(driver, io) {
  try {
    if (driver) {
      let models = db.drivers;
      let response = await models.update({ driving_status: driver.status }, {
        where: { id: driver.driverId }
      })
      const sendResponse = { code: 200, message: "Updated" };
      //io.emit('location_updated', sendResponse);
      // console.log('Ride request accepted:', driver);
      // console.log(`${driver} status updated successfully`);
    }
  } catch (error) {
    throw error
  }
}


async function updateUserSocket(user, io) {

  if (user) {
    try {
      let models = db.users;
      let response = await models.update({ socket_id: user.socketId }, {
        where: { id: user.userId }
      })
      //console.log('Ride request accepted:', user);
    } catch (error) {
      throw error
    }
  }
}


async function userCancel(driver, io) {

  if (driver) {
    try {
      let modelsRequest = db.requests;
      let models = db.drivers;
      let responceRequest = await modelsRequest.findAll({ where: { request_id: driver.rideTimestamp } });
      for (const driver2 of responceRequest) {
        let responceDriver = await models.findOne({ where: { id: driver2.driver_id } });
        //console.log("All Request D cancel===================",responceDriver);

        io.to(responceDriver.socket_id).emit('ride_request_cancel', driver);
        //console.log('Ride request cancel:', driver);
      }
    } catch (error) {
      throw error
    }
  }
}


async function driverStartRide(user, io) {

  let responceUser = await db.users.findOne({ where: { id: user.userId } });
  //console.log("===========================End ride user ",responceUser);

  let updateRideStatus = await libs.updateData(db.bookings, { booking_status: "started" }, { where: { id: user.bookingId } });
  io.to(responceUser.socket_id).emit('ride_started', user);
}


async function driverEndRide(user, io) {

  let responceUser = await db.users.findOne({ where: { id: user.userId } });
  //console.log("===========================End ride user ",responceUser);
  
  // let updateRideStatus = await libs.updateData(db.bookings, { booking_status: "completed" }, { where: { id: user.bookingId } });
  io.to(responceUser.socket_id).emit('show_rating_popup', user);
}

async function rideChat(chatData, io) {
  //console.log("Here is chat data for you===",chatData);
  let responceUser;
  let sender_type;
  if (chatData.userType == 1) {
    //console.log("it is user logic============",chatData.receiverId);
    responceUser = await db.drivers.findOne({ where: { id: chatData.receiverId } });
    sender_type = 'User';
  }
  else {
    //console.log("it is drivers logic==========",chatData.receiverId);
    responceUser = await db.users.findOne({ where: { id: chatData.receiverId } });
    sender_type = 'Driver';
  }

  let data = {
    sender_id: chatData.senderId,
    receiver_id: chatData.receiverId,
    booking_id: chatData.bookingId,
    message: chatData.message,
    sender_type: sender_type
  }
  let saveData = await libs.createData(db.chats, data);

  //console.log("==========================message reciver------ ",responceUser);
  io.to(responceUser.socket_id).emit('chat_message', chatData);
}


async function updateDriverLocAfterConfirm(data, io) {

  let responceUser = await db.users.findOne({ where: { id: data.userId } });
  // console.log("===========================End ride user ",responceUser);
  io.to(responceUser.socket_id).emit('show_driver_loc_user', data);
}




async function cancelRideAfterAccept(data, io) {
  let responceUser;
  if(data.type=="Driver"){
    responceUser = await db.users.findOne({where:{id: data.userId}});
  }else {
     responceUser = await db.drivers.findOne({where:{id: data.userId}});
  }
  
  // console.log("===========================End ride user ",responceUser);
  // let models = db.bookings;
  // let [ct , response] = await models.update({ booking_status: 'cancel',cancelled_by:data.type}, {
  //   where: { id: data.bookingId }
  // });

  let updateEndRide = await libs.findAndUpdate(db.bookings, data.bookingId,{ booking_status: 'cancel',cancelled_by:data.type});
  
  console.log('-------------cancelRideAfterAccept-bookings--------------',updateEndRide);

  let rideData = {
    "pickup_long": updateEndRide.pickup_long,
    "pickup_lat": updateEndRide.pickup_lat,
    "drop_long": updateEndRide.drop_long,
    "drop_lat": updateEndRide.drop_lat,
    "pickup_address": updateEndRide.pickup_address,
    "drop_address": updateEndRide.drop_address,
    "vechile_type": "Bike",
    "amount": updateEndRide.amount,
    "ride_status": "Cancelled",
    "driver_id": updateEndRide.driver_id,
    "user_id": updateEndRide.user_id,
    "booking_id" : updateEndRide.id,
  }
  
  let save = await libs.createData(db.myrides, rideData);
  console.log('------------save-----------',save);

  io.to(responceUser.socket_id).emit('ride_cancel_after_accept', data);
}








module.exports = {
  requestRide,acceptRideRequest,setupSocketEvents,
};
