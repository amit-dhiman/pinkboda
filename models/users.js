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
    device_token: { type: DataTypes.STRING },
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


  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Users.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  
  return Users;
}

