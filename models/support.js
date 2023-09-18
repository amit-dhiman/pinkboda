'use strict';
const moment= require('moment');
module.exports = (sequelize, DataTypes) => {
  const Supports = sequelize.define('supports', {

    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},

    email: { type: DataTypes.STRING },
    user_id:{ type: DataTypes.INTEGER, references:{model:'users',key:'id'}},
    driver_id:{ type: DataTypes.INTEGER, references:{model:'drivers',key:'id'}},
   
    message: { type: DataTypes.STRING, defaultValue:1},

    created_at: {type: DataTypes.INTEGER},
    updated_at: {type: DataTypes.INTEGER},
  },{
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: "updated_at",
    deletedAt: 'deleted_at',
    defaultScope:{where:{deleted_at: null}},
  })

  Supports.beforeCreate((support) => {
    support.created_at = moment().unix(); // Set created_at to current timestamp in seconds
    support.updated_at = moment().unix(); // Set updated_at to current timestamp in seconds
  });

  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Users.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return Supports;
}

