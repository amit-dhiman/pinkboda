'use strict';
const moment = require('moment');

module.exports = (sequelize, DataTypes) => {
  
  const Notifications = sequelize.define('notifications', {
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
      references: { model: 'bookings', key:'id' },
    },
    title: { type: DataTypes.STRING },
    message: { type: DataTypes.STRING },
    // push_type:{type: DataTypes.ENUM("chat","offers")}
    
    created_at: { type: DataTypes.INTEGER },
    updated_at: { type: DataTypes.INTEGER },
  },{
    paranoid: true,
    // timestamps:true,
    createdAt: 'created_at',
    updatedAt: "updated_at",
    deletedAt: 'deleted_at',
    defaultScope:{where:{deleted_at: null}},
  })
  Notifications.beforeCreate((notification) => {
    notification.created_at = moment().unix(); // Set createdAt to current timestamp in seconds
    notification.updated_at = moment().unix(); // Set createdAt to current timestamp in seconds
  });

  return Notifications;
}
