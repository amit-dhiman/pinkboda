'use strict';
// const db= require('./index');
module.exports = (sequelize, DataTypes) => {

  const Drivers = sequelize.define('drivers', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username:{ type: DataTypes.STRING },
    gender:{ type: DataTypes.ENUM("Male","Female","Others"),default:"Male"},

    latitude: { type: DataTypes.DECIMAL(10, 6)},     // latitude
    longitude: { type: DataTypes.DECIMAL(10, 6)},    // longitude

    mobile_number: {type: DataTypes.STRING},
    country_code:{type: DataTypes.STRING},
    driving_status:{ type: DataTypes.ENUM("Online","Offline"),defaultValue:"Offline"},
    
    profile_image: { type: DataTypes.STRING, defaultValue:null},
    license: { type: DataTypes.STRING },
    id_card: { type: DataTypes.STRING },
    passport_photo: { type: DataTypes.STRING },
    vechile_insurance: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    license_plate : { type: DataTypes.STRING },
    year:{ type:DataTypes.INTEGER },

    is_admin_verified:{type:DataTypes.ENUM("accepted","rejected","pending"),defaultValue:"pending"},

    over_all_rating: { type: DataTypes.DECIMAL(6,1), defaultValue: null},    // OverAll Rating
    socket_id: { type: DataTypes.STRING },    
         
    total_rides: { type: DataTypes.INTEGER ,defaultValue: 0},         // Rides

    total_earning: { type: DataTypes.BIGINT ,defaultValue: 0},        // Earning

    total_complaints: { type: DataTypes.INTEGER ,defaultValue: 0},        // Complaints

    action: { type: DataTypes.ENUM("Enable","Disable"),defaultValue:"Disable"},
    already_on_ride: { type: DataTypes.ENUM("Yes","No"),defaultValue:"No"},

    access_token: { type: DataTypes.STRING },
    device_type:{type:DataTypes.ENUM("Android","Apple"),defaultValue:"Android"},
    device_token: { type: DataTypes.STRING },

    created_at:{type: DataTypes.BIGINT, defaultValue: function(){
      return +new Date(Date.now());
    }},
    updated_at:{type: DataTypes.BIGINT, defaultValue: function(){
      return +new Date(Date.now());
    }},
    deleted_at: {type: DataTypes.BIGINT,defaultValue: 0},
    },{
      timestamps: false,
      // paranoid: false,
      // createdAt: 'created_at',
      // updatedAt: "updated_at",
      // deletedAt: 'deleted_at',
    })



  // Drivers.hasMany(db.bookings, { foreignKey: 'driver_id' });
  // Drivers.hasMany(Booking, { foreignKey: 'driver_id', as: 'booking_id' }); 
  return Drivers;
}

