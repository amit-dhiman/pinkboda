// const db= require('./index');
module.exports = (sequelize, DataTypes) => {

    const Bookings = sequelize.define('bookings', {

        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

        pickup_long: { type: DataTypes.INTEGER },
        pickup_lat: { type: DataTypes.INTEGER },
        drop_long: { type: DataTypes.INTEGER },
        drop_lat: { type: DataTypes.INTEGER },

        pickup_address: { type: DataTypes.STRING },
        drop_address: { type: DataTypes.STRING },

        booking_status: { type: DataTypes.ENUM("pending", "accept", "reject", "cancel"), default: "pending"},
        amount: { type: DataTypes.INTEGER, default: 10 },
        ride_type:{type: DataTypes.ENUM("ride","delivery")},
        driver_gender:{type: DataTypes.ENUM("male","female")},

        user_id: {
            type: DataTypes.INTEGER,
            references: { model: 'users', key: 'id' },
        },
        driver_id: {
            type: DataTypes.INTEGER,
            references: { model: 'drivers', key: 'id' },
        },
    }, {
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: "updated_at",
        deletedAt: 'deleted_at',
        defaultScope:{where:{deleted_at: null}},
      })

    // Bookings.belongsTo(db.users, { foreignKey: 'user_id', as: 'user_id'  });
    // Bookings.belongsTo(db.drivers, { foreignKey: 'driver_id', as: 'driver_id' });
    
    return Bookings;
}

