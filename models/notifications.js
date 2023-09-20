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
    // timestamps:true,
    createdAt: 'created_at',
    updatedAt: "updated_at",
    deletedAt: 'deleted_at',
    defaultScope:{where:{deleted_at: null}},
  })
  // Notifications.beforeCreate((notification) => {
  //   notification.created_at = moment().unix(); // Set createdAt to current timestamp in seconds
  //   notification.updated_at = moment().unix(); // Set createdAt to current timestamp in seconds
  // });

  return Notifications;
}
