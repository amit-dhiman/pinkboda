'use strict';
// const db= require('./index');
module.exports = (sequelize, DataTypes) => {

  const Drivers = sequelize.define('drivers', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username:{ type: DataTypes.STRING },
    gender:{ type: DataTypes.ENUM("Male","Female","Others"),default:"Male"},

    latitude: { type: DataTypes.FLOAT(10, 6)},     // latitude
    longitude: { type: DataTypes.FLOAT(10, 6)},    // longitude

    mobile_number: {type: DataTypes.STRING},
    country_code:{type: DataTypes.STRING},
    profile_image: { type: DataTypes.STRING },
    license: { type: DataTypes.STRING },
    id_card: { type: DataTypes.STRING },
    passport_photo: { type: DataTypes.STRING },
    vechile_insurance: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    license_plate : { type: DataTypes.STRING },
    year:{ type:DataTypes.INTEGER },

    is_admin_verified:{type:DataTypes.ENUM("accepted","rejected","pending"),default:"accepted"},

    over_all_rating: { type: DataTypes.STRING },    // OverAll Rating

    driving_status:{ type: DataTypes.ENUM("Online","Offline")},

    total_rides: { type: DataTypes.INTEGER },
    action: { type: DataTypes.ENUM("Enable","Disable")},

    access_token: { type: DataTypes.STRING },
    device_type:{type:DataTypes.ENUM("Android","Apple"),default:"Android"},
    device_token: { type: DataTypes.STRING },

    created_at:{type: DataTypes.BIGINT},
    updated_at:{type: DataTypes.BIGINT},
    deleted_at: {type: DataTypes.BIGINT},
    },{
        hooks: {
          beforeValidate: (instance, options) => {
          instance.created_at = +new Date(Date.now());
          instance.updated_at = +new Date(Date.now());
          },
        },
        beforeDestroy: (instance, options) => {
          instance.deleted_at = +new Date(Date.now())
        },
        timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    defaultScope:{where:{deleted_at: null}},
  })

  // Drivers.beforeCreate((driver) => {
  //   driver.created_at = moment().unix();        // Set createdAt to current timestamp in seconds
  //   driver.updated_at = moment().unix();        // Set createdAt to current timestamp in seconds
  // });

  // Drivers.hasMany(db.bookings, { foreignKey: 'driver_id' });
  // Drivers.hasMany(Booking, { foreignKey: 'driver_id', as: 'booking_id' }); 
  return Drivers;
}

