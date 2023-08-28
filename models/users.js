'use strict';
module.exports = (sequelize, DataTypes) => {

  const Users = sequelize.define('users', {

    username:{ type: DataTypes.STRING },
    gender:{ type: DataTypes.ENUM("Male","Female","Others"),default:"Male" },

    // email: { type: DataTypes.STRING },
    // password: { type: DataTypes.STRING},

    otp: {type: DataTypes.INTEGER},
    mobile_number: {type: DataTypes.STRING},    
    access_token: { type: DataTypes.STRING },
    device_type:{type:DataTypes.ENUM("Android","Apple","Windows"),default:"Android"},
    device_token: { type: DataTypes.STRING },    // token 
  }, {
    // timestamps:true,
    createdAt: 'created_at',     // we can change their name
    updatedAt: "updated_at",
  })
  return Users;
}

