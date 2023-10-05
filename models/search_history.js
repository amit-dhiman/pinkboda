// const db= require('./index');
module.exports = (sequelize, DataTypes) => {

  const Bookings = sequelize.define('search_history', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    pickup_long: { type: DataTypes.FLOAT(10, 6)},
    pickup_lat: { type: DataTypes.FLOAT(10, 6)},
    drop_long: { type: DataTypes.FLOAT(10, 6)},
    drop_lat: { type: DataTypes.FLOAT(10, 6)},

    pickup_address: { type: DataTypes.STRING },
    drop_address: { type: DataTypes.STRING },

    booking_status: { type: DataTypes.ENUM("pending","accept","reject","cancel"),defaultValue: "pending"},
    cancel_reason:{type: DataTypes.STRING },
    cancelled_by:{ type: DataTypes.ENUM("Driver","User")},

    amount: { type: DataTypes.INTEGER, default: 1},
    ride_type:{type: DataTypes.ENUM("Ride","Delivery")},
    driver_gender:{type: DataTypes.ENUM("Male","Female","Both")},

    user_id: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' },
    },
    created_at:{type: DataTypes.BIGINT},
    updated_at:{type: DataTypes.BIGINT},
    deleted_at: {type: DataTypes.BIGINT, defaultValue: null},
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

  return Bookings;
}

