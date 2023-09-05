'use strict';
// const db= require('./index');

module.exports = (sequelize, DataTypes) => {

  const Drivers = sequelize.define('drivers', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username:{ type: DataTypes.STRING },
    gender:{ type: DataTypes.ENUM("male","female","others"),default:"male"},

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

    access_token: { type: DataTypes.STRING },
    device_type:{type:DataTypes.ENUM("android","apple"),default:"android"},
    device_token: { type: DataTypes.STRING },    // token 
  }, {
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    defaultScope:{where:{deleted_at: null}},
  })

  // Drivers.hasMany(db.bookings, { foreignKey: 'driver_id' });
  // Drivers.hasMany(Booking, { foreignKey: 'driver_id', as: 'booking_id' }); 
  return Drivers;
}

