'use strict';
const {Sequelize} = require('sequelize');
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

  // Users.hasMany(db,{foreignKey:'user_id'});
  // Users.hasMany(Booking,{foreignKey:'user_id',as:'bookings'});
  return Offers;
}

