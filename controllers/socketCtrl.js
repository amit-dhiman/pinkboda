const db = require('../models/index');
const libs = require('../libs/queries');
const commonFunc = require('../libs/commonFunc');
require('dotenv').config();
const sequelize = require('sequelize');
//const { Op, Sequelize } = require("sequelize")


// Create a map to store driver socket connections
const driverSockets = new Map();




// Function to set up Socket.io events
function setupSocketEvents(socket, io) {
  socket.on('new_ride_request_send', (riderPickupLocation) => {
    console.log(socket.id);
    const socketId = socket.id;
    driverSockets.set(1, socket.id);

    // console.log('New ride request:', riderPickupLocation);

    requestRide(riderPickupLocation, io);
  });


  socket.on('accept_ride', (driver) => {
    // console.log(socket.id);


    // console.log('Accepted driver-----:', driver);

    acceptRideRequest(driver, io);
  });


  socket.on('update_driver_loc', (driver) => {
    // console.log(socket.id);


    driverSockets.set(1, socket.id);

    updateLoc(driver, io);
  });


  socket.on('update_driver_status', (driver) => {
    // console.log(socket.id);


    // driverSockets.set(1, socket.id);

    // console.log('Loc update driver-----:', driver);

    updateDirStatus(driver, io);
  });



  socket.on('update_user_socket', (user) => {



    // driverSockets.set(1, socket.id);

    // console.log('Loc update driver-----:', user);

    updateUserSocket(user, io);
  });



  socket.on('user_cancel_request', (user) => {



    // driverSockets.set(1, socket.id);

    // console.log('Loc update driver-----:', user);

    userCancel(user, io);
  });

  // Add other socket event handlers here, as needed
}




// Function to request a ride
async function requestRide(riderPickupLocation, io) {
  // Sort drivers by distance from the rider's pickup location

  // console.log(riderPickupLocation);

  let models = db.drivers;
  let modelsRequest = db.requests;

  try {
    let userLatitude = riderPickupLocation.pickupLatitude;
    let userLongitude = riderPickupLocation.pickupLongitude;
    let genderPreference = riderPickupLocation.genderPreference;
    // Query to retrieve nearby drivers within a 1 km radius in ascending order
    let response = await models.findAll({
      attributes: [
        'id',
        'username',
        'latitude',
        'longitude',
        'socket_id',
        [
          sequelize.literal(`
        6371 * acos(
          cos(radians(${userLatitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${userLongitude})) +
          sin(radians(${userLatitude})) * sin(radians(latitude))
        )
      `),
          'distance',
        ],
      ],
      where: {
        [sequelize.Op.and]: [
          sequelize.where(
            sequelize.literal(`
          6371 * acos(
            cos(radians(${userLatitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${userLongitude})) +
            sin(radians(${userLatitude})) * sin(radians(latitude))
          )
        `),
            '<=',
            1 // 1 km radius
          ),
          { status: 'online' }, // Adding the status condition here
          { gender: genderPreference } // Gender condition
        ]
      },
      order: [[sequelize.col('distance'), 'ASC']],
      limit: 10, // Limit the results to 10 drivers
    });


    //console.log('All near by driver are here------',response);



    // console.log("here is available Drivers for this location =============================",response);

    for (const driver of response) {

      // console.log("Here is driver socket id ------------------------------+++++++++",driver);
      if (driver && driver.socket_id) {
        // Send a ride request to the driver
        // console.log("Here we send request to driver====================");
        dataRequest = { request_id: riderPickupLocation.rideTimestamp, driver_id: driver.id };
        await modelsRequest.create(dataRequest);
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

// Function to accept a ride request (for drivers)
async function acceptRideRequest(driver, io) {
  //const acceptingDriver = availableDrivers.find((driver) => driver.id === driverId);
  // console.log("Here we have accpted od ============------------------+++++++++++++++++++++",driver);
  if (driver) {
    // Simulate accepting the ride request
    // console.log(`accepted the ride request!`);

    try {
      //io.emit('new_ride_request', acceptingDriver);
      let models = db.drivers;
      let modelsRequest = db.requests;

      let dataRequest = { pickup_long: driver.pickupLongitude, pickup_lat: driver.pickupLatitude, drop_long: driver.destinationLongitude, drop_lat: driver.destinationLatitude, pickup_address: driver.pickupAddress, drop_address: driver.destinationAddress, booking_status: 'accept', amount: driver.price, ride_type: 'Ride', driver_gender: driver.genderPreference, user_id: driver.userId, driver_id: driver.driverId };

      let savingResponse = await db.bookings.create(dataRequest);
      const lastBookingId = savingResponse.id;
      driver.bookingId = lastBookingId;

      let responceRequest = await modelsRequest.findAll({ where: { request_id: driver.rideTimestamp } });

      //  console.log("All Request D===================",responceRequest);
      let responceUser = await db.users.findOne({ where: { id: driver.userId } });

      for (const driver2 of responceRequest) {
        let responceDriver = await models.findOne({ where: { id: driver2.driver_id } });

        if (responceDriver.id == driver.driverId) {
          driver.driverName = responceDriver.username;
          driver.driverProfile = process.env.driver_image_baseUrl + '/' + responceDriver.profile_image;
          driver.driverRating = responceDriver.over_all_rating;
          driver.driverMobileNo = responceDriver.mobile_number;
          driver.vehicleModel = responceDriver.model;
          driver.vehicleNo = responceDriver.license_plate;
        }
        // console.log("All Request D===================",responceDriver);

        io.to(responceDriver.socket_id).emit('ride_request_accepted', driver);

        // console.log('Ride request accepted:', driver);
      }

      io.to(responceUser.socket_id).emit('ride_request_confirm', driver);

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

  if (driver) {
    try {

      let models = db.drivers;
      let response = await models.update({ status: driver.status }, {
        where: { id: driver.driverId }
      })
      const sendResponse = { code: 200, message: "Updated" };
      //io.emit('location_updated', sendResponse);
      // console.log('Ride request accepted:', driver);
      // console.log(`${driver} status updated successfully`);

    } catch (error) {
      throw error
    }



  }
}



async function updateUserSocket(user, io) {
  if (user) {
    try {
      let models = db.users;
      let response = await models.update({ socket_id: user.socketId }, {
        where: { id: user.userId }
      })
      // console.log('Ride request accepted:', user);
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
        // console.log("All Request D cancel===================",responceDriver);

        io.to(responceDriver.socket_id).emit('ride_request_cancel', driver);
        // console.log('Ride request cancel:', driver);
      }
    } catch (error) {
      throw error
    }



  }
}



//



module.exports = {
  requestRide,
  acceptRideRequest,
  setupSocketEvents,
};
