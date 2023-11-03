'use strict';
module.exports = (sequelize, DataTypes) => {

  const Ratings = sequelize.define('ratings', {

    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},

    user_id: {
      type: DataTypes.INTEGER,
      references: {model:'users',key:'id'},
    },
    driver_id: {
      type: DataTypes.INTEGER,
      references:{model:'drivers',key:'id'},
    },
    booking_id: {
      type: DataTypes.INTEGER,
      references:{model:'bookings',key:'id'},
    },
    
    star: { type: DataTypes.INTEGER, defaultValue:1},
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

  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Users.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return Ratings;
}

