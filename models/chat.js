'use strict';
// const db= require('./bookings');

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('chats', {
    
    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    sender_id: {type: DataTypes.INTEGER},
    receiver_id: {type: DataTypes.INTEGER},
    
    message: { type: DataTypes.STRING},
    sender_type: { type: DataTypes.ENUM("User","Driver")},
    
    booking_id: {
      type: DataTypes.INTEGER,
      references:{model:'bookings',key:'id'},
    },

    created_at:{type: DataTypes.BIGINT, defaultValue: function(){
      return +new Date(Date.now());
    }},
    updated_at:{type: DataTypes.BIGINT, defaultValue: function(){
      return +new Date(Date.now());
    }},
    deleted_at: {type: DataTypes.DATE,defaultValue: null},
    },{
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: "updated_at",
      deletedAt: 'deleted_at',
    })

  //   created_at:{type: DataTypes.BIGINT},
  //   updated_at:{type: DataTypes.BIGINT},
  //   deleted_at: {type: DataTypes.BIGINT,defaultValue: null},
  //   },{
  //       hooks: {
  //         beforeValidate: (instance, options) => {
  //         instance.created_at = +new Date(Date.now());
  //         instance.updated_at = +new Date(Date.now());
  //         },
  //         beforeDestroy: (instance, options) => {
  //           instance.deleted_at = +new Date(Date.now())
  //         },
  //       },
  //       timestamps: true,
  //   paranoid: true,
  //   createdAt: 'created_at',
  //   updatedAt: "updated_at",
  //   deletedAt: 'deleted_at',
  // })

  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Users.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return Users;
}

