'use strict';
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {

  const Ratings = sequelize.define('ratings', {

    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},

    user_id: {
      type: DataTypes.INTEGER,
      references: {model:'users',key:'id'},
    },
    driver_id: {
      type: DataTypes.INTEGER,
      references:{model:'drivers',key:'id'},
    },
    booking_id: {
      type: DataTypes.INTEGER,
      references:{model:'bookings',key:'id'},
    },
    
    star: { type: DataTypes.STRING, defaultValue:1},
    created_at: {
      type: DataTypes.INTEGER,
    },

  },{
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: "updated_at",
    deletedAt: 'deleted_at',
    defaultScope:{where:{deleted_at: null}},
  })

  Ratings.beforeCreate((rating) => {
    rating.created_at = moment().unix(); // Set createdAt to current timestamp in seconds
  });
  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Users.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return Ratings;
}

