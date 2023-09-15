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

  },{
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: "updated_at",
    deletedAt: 'deleted_at',
    defaultScope:{where:{deleted_at: null}},
  })

  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Users.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return Users;
}

