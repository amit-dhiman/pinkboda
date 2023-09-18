'use strict';
// const db= require('./bookings');
const moment= require('moment');

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('users', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username:{ type: DataTypes.STRING },
    gender:{ type: DataTypes.ENUM("Male","Female","Others"),default:"Male" },

    mobile_number: {type: DataTypes.STRING},
    country_code:{type: DataTypes.STRING},
    image: { type: DataTypes.STRING },
    
    access_token: { type: DataTypes.STRING },
    device_type:{ type:DataTypes.ENUM("android","apple"),default:"android"},
    device_token: { type: DataTypes.STRING },    // token 

    created_at: { type: DataTypes.INTEGER},
    updated_at: { type: DataTypes.INTEGER},
  },{
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: "updated_at",
    deletedAt: 'deleted_at',
    defaultScope:{where:{deleted_at: null}},
  })

  Users.beforeCreate((user) => {
    user.created_at = moment().unix(); // Set createdAt to current timestamp in seconds
    user.updated_at = moment().unix(); // Set createdAt to current timestamp in seconds
  });

  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Users.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  
  return Users;
}

