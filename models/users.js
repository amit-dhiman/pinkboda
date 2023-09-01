'use strict';
// const db= require('./bookings');
// console.log('---------db ind------------',db);

module.exports = (sequelize, DataTypes) => {

  const Users = sequelize.define('users', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username:{ type: DataTypes.STRING },
    gender:{ type: DataTypes.ENUM("male","female","others"),default:"male" },

    mobile_number: {type: DataTypes.STRING},
    country_code:{type: DataTypes.STRING},
    image: { type: DataTypes.STRING },
    
    access_token: { type: DataTypes.STRING },
    device_type:{ type:DataTypes.ENUM("android","apple"),default:"android"},
    device_token: { type: DataTypes.STRING },    // token 
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

