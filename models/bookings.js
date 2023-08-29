'use strict';
// const db= require('./index');
module.exports = (sequelize, DataTypes) => {

    const Bookings = sequelize.define('bookings', {

        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

        pickup_long: { type: DataTypes.FLOAT },
        pickup_lat: { type: DataTypes.FLOAT },
        drop_long: { type: DataTypes.FLOAT },
        drop_lat: { type: DataTypes.FLOAT },

        pickup_address: { type: DataTypes.STRING },
        drop_address: { type: DataTypes.STRING },

        booking_status: { type: DataTypes.ENUM("pending", "accept", "reject", "cancel"), default: "pending" },
        amount: { type: DataTypes.INTEGER, default: 10 },

        user_id: {
            type: DataTypes.INTEGER,
            references: { model: 'users', key: 'id' },
        },
        driver_id: {
            type: DataTypes.INTEGER,
            references: { model: 'drivers', key: 'id' },
        },
    }, {
        createdAt: 'created_at',     // we can change their name
        updatedAt: "updated_at",
    })

    // Bookings.belongsTo(db.users, { foreignKey: 'user_id', as: 'user_id'  });
    // Bookings.belongsTo(db.drivers, { foreignKey: 'driver_id', as: 'driver_id' });
    
    return Bookings;
}

