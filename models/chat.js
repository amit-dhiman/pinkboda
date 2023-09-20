'use strict';
// const db= require('./bookings');

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('chats', {
    
    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    sender_id: {
      type: DataTypes.INTEGER,
      // references: {model:'users',key:'id'},
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      // references:{model:'drivers',key:'id'},
    },
    message: { type: DataTypes.STRING},
    
    booking_id: {
      type: DataTypes.INTEGER,
      references:{model:'bookings',key:'id'},
    },
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
    createdAt: 'created_at',
    updatedAt: "updated_at",
    deletedAt: 'deleted_at',
    defaultScope:{where:{deleted_at: null}},
  })

  // Users.beforeCreate((user) => {
  //   user.created_at = moment().unix();        // Set created_at to current timestamp in seconds
  //   user.updated_at = moment().unix();        // Set updated_at to current timestamp in seconds
  // });

  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Users.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return Users;
}

