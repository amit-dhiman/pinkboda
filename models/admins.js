'use strict';
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('admins', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    full_name:{ type: DataTypes.STRING },
    mobile_number: {type: DataTypes.STRING},
    country_code:{type: DataTypes.STRING},
    profile_image: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    
    access_token: { type: DataTypes.STRING },
    device_type:{ type:DataTypes.ENUM("Android","Apple","Windows"),defaultValue:"Android"},
    device_token: { type: DataTypes.STRING },

    created_at:{type: DataTypes.BIGINT},
    updated_at:{type: DataTypes.BIGINT},
    deleted_at: {type: DataTypes.BIGINT,defaultValue: null},
    },{
      hooks: {
        beforeValidate: (instance, options) => {
        instance.created_at = +new Date(Date.now());
        instance.updated_at = +new Date(Date.now());
        },
        beforeDestroy: (instance, options) => {
          instance.deleted_at = +new Date(Date.now())
        },
      },
      timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: "updated_at",
    deletedAt: 'deleted_at',
  })
  
  // Admin.hasMany(db, { foreignKey: 'user_id' });
  // Admin.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return Admin;
}
