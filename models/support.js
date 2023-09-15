'use strict';
module.exports = (sequelize, DataTypes) => {

  const Supports = sequelize.define('supports', {

    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},

    email: { type: DataTypes.STRING },
    user_id:{ type: DataTypes.INTEGER, references:{model:'users',key:'id'}},
   
    message: { type: DataTypes.STRING, defaultValue:1},

  },{
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: "updated_at",
    deletedAt: 'deleted_at',
    defaultScope:{where:{deleted_at: null}},
  })

  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Users.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
  return Supports;
}

