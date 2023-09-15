'use strict';
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {

  const Offers = sequelize.define('offers', {

    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},

    user_id: {
      type: DataTypes.INTEGER,
      references: {model:'users',key:'id'},
    },

    icon: {type: DataTypes.STRING},
    title: {type: DataTypes.STRING},
    message: {type: DataTypes.STRING},
    
    created_at: {
      type: DataTypes.INTEGER,
    }
  },{
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: "updated_at",
    deletedAt: 'deleted_at',
    defaultScope:{where:{deleted_at: null}},
  })

  Offers.beforeCreate((offer) => {
    offer.created_at = moment().unix(); // Set createdAt to current timestamp in seconds
  });
  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Users.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return Offers;
}

