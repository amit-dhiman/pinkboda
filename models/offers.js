'use strict';
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

  // Users.hasMany(db,{foreignKey:'user_id'});
  // Users.hasMany(Booking,{foreignKey:'user_id',as:'bookings'});
  return Offers;
}

