'use strict';
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('admins', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    full_name:{ type: DataTypes.STRING },
    mobile_number: {type: DataTypes.STRING,defaultValue: null},
    country_code:{type: DataTypes.STRING,defaultValue: null},
    profile_image: { type: DataTypes.STRING ,defaultValue: null},
    email: { type: DataTypes.STRING,defaultValue: null },
    password: { type: DataTypes.STRING ,defaultValue: null},
    
    access_token: { type: DataTypes.STRING },
    device_type:{ type:DataTypes.ENUM("Android","Apple","Windows"),defaultValue:"Android"},
    device_token: { type: DataTypes.STRING },

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

  //   created_at:{type: DataTypes.BIGINT,defaultValue: null,defaultValue: null},
  //   updated_at:{type: DataTypes.BIGINT,defaultValue: null},
  //   deleted_at: {type: DataTypes.BIGINT,defaultValue: null},
  //   },{
  //     hooks: {
  //       beforeValidate: (instance, options) => {
  //       instance.created_at = +new Date(Date.now());
  //       instance.updated_at = +new Date(Date.now());
  //       },
  //       beforeDestroy: (instance, options) => {
  //         instance.deleted_at = +new Date(Date.now())
  //       },
  //     },
  //     timestamps: true,
  //   paranoid: true,
  //   createdAt: 'created_at',
  //   updatedAt: "updated_at",
  //   deletedAt: 'deleted_at',
  // })
  
  // Admin.hasMany(db, { foreignKey: 'user_id' });
  // Admin.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return Admin;
}
