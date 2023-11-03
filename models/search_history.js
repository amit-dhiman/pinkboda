// const db= require('./index');
module.exports = (sequelize, DataTypes) => {

  const search_history = sequelize.define('search_history', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    pickup_long: { type: DataTypes.DECIMAL(10, 6)},
    pickup_lat: { type: DataTypes.DECIMAL(10, 6)},
    drop_long: { type: DataTypes.DECIMAL(10, 6)},
    drop_lat: { type: DataTypes.DECIMAL(10, 6)},

    pickup_address: { type: DataTypes.STRING },
    drop_address: { type: DataTypes.STRING },

    booking_status: { type: DataTypes.ENUM("pending","started","accept","reject","cancel"),defaultValue: "pending"},
    cancel_reason:{type: DataTypes.STRING },
    // cancelled_by:{ type: DataTypes.ENUM("Driver","User")},

    amount: { type: DataTypes.INTEGER, default: 1},
    ride_type:{type: DataTypes.ENUM("Ride","Delivery")},
    driver_gender:{type: DataTypes.ENUM("Male","Female","Both")},

    user_id: {
      type: DataTypes.INTEGER,
      references: { model: 'users', key: 'id' },
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

  return search_history;
}

