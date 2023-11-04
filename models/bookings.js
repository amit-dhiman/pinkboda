// const db= require('./index');
module.exports = (sequelize, DataTypes) => {

  const Bookings = sequelize.define('bookings', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    pickup_long: { type: DataTypes.DECIMAL(10, 6)},
    pickup_lat: { type: DataTypes.DECIMAL(10, 6)},
    drop_long: { type: DataTypes.DECIMAL(10, 6)},
    drop_lat: { type: DataTypes.DECIMAL(10, 6)},

    pickup_address: { type: DataTypes.STRING },
    drop_address: { type: DataTypes.STRING },

    booking_status: { type: DataTypes.ENUM("pending","accept","reject","started","cancel","completed"), defaultValue:"pending"},
    cancel_reason:{type: DataTypes.STRING },

    cancelled_by:{ 
      type: DataTypes.ENUM("Driver","User"),
      allowNull: true,
    },
    
    amount: { type: DataTypes.DECIMAL(6, 2)},
    ride_type:{ type: DataTypes.ENUM("Ride","Delivery")},
    vechile_type: { type: DataTypes.STRING,defaultValue:"Bike"},     // Statically Bike

    driver_gender:{type: DataTypes.ENUM("Male","Female","Both")},

    user_id: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' },defaultValue: null
    },
    driver_id: {
      type: DataTypes.INTEGER,
      references: { model: 'drivers', key: 'id' },defaultValue: null
    },

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

  //   created_at:{type: DataTypes.BIGINT,allowNull: true},
  //   updated_at:{type: DataTypes.BIGINT,allowNull: true},
  //   deleted_at: {type: DataTypes.BIGINT,allowNull: true},
  // },{
  //   hooks: {
  //     beforeValidate: (instance, options) => {
  //     instance.created_at = +new Date(Date.now());
  //     instance.updated_at = +new Date(Date.now());
  //     },
  //     beforeDestroy: (instance, options) => {
  //       instance.deleted_at = +new Date(Date.now())
  //     },
  //   },
  //   timestamps: true,
  //   paranoid: true,
  //   createdAt: 'created_at',
  //   updatedAt: "updated_at",
  //   deletedAt: 'deleted_at',
  // })

  return Bookings;
}

