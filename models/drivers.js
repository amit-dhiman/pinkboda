'use strict';
// const db= require('./index');

module.exports = (sequelize, DataTypes) => {

  const Drivers = sequelize.define('drivers', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username:{ type: DataTypes.STRING },
    gender:{ type: DataTypes.ENUM("male","female","others"),default:"male" },

    otp: {type: DataTypes.INTEGER},
    mobile_number: {type: DataTypes.STRING},
    country_code:{type: DataTypes.INTEGER},
    profile_image: { type: DataTypes.STRING },
    license: { type: DataTypes.STRING },
    id_card: { type: DataTypes.STRING },
    passport_photo: { type: DataTypes.STRING },
    vechile_insurance: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    license_plate : { type: DataTypes.STRING },
    year:{ type:DataTypes.INTEGER },

    access_token: { type: DataTypes.STRING },
    device_type:{type:DataTypes.ENUM("android","apple"),default:"android"},
    device_token: { type: DataTypes.STRING },    // token 
  }, {
    // timestamps:true,
    createdAt: 'created_at',     // we can change their name
    updatedAt: "updated_at",
  })

  // Drivers.hasMany(db.bookings, { foreignKey: 'driver_id' });

//   Drivers.hasMany(Booking, { foreignKey: 'driver_id', as: 'bookings' }); 
  return Drivers;
}

