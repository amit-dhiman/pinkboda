'use strict';
module.exports = (sequelize, DataTypes) => {

  const Request = sequelize.define('requests', {
    id: {type:DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    driver_id: {
      type: DataTypes.INTEGER,
      references:{model:'drivers'},
    },
    request_id: {
      type: DataTypes.BIGINT,
      // references:{model:'bookings'},
    },
    created_at:{type: DataTypes.BIGINT, defaultValue: function(){
      return +new Date(Date.now());
    }},
    updated_at:{type: DataTypes.BIGINT, defaultValue: function(){
      return +new Date(Date.now());
    }},
    },{
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: "updated_at",
    })

  //   created_at:{type: DataTypes.BIGINT},
  //   updated_at:{type: DataTypes.BIGINT},
  //   },{
  //   hooks: {
  //     beforeValidate: (instance, options) => {
  //     instance.created_at = +new Date(Date.now());
  //     instance.updated_at = +new Date(Date.now());
  //     }},
  //   timestamps: true,
  //   createdAt: 'created_at',
  //   updatedAt: 'updated_at',
  // })
  return Request;
}

