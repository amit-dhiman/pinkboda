// const db= require('./index');
module.exports = (sequelize, DataTypes) => {

    const myrides = sequelize.define('myrides', {

        id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},

        pickup_long: { type: DataTypes.FLOAT(10, 6)},
        pickup_lat: { type: DataTypes.FLOAT(10, 6)},
        drop_long: { type: DataTypes.FLOAT(10, 6)},
        drop_lat: { type: DataTypes.FLOAT(10, 6)},

        pickup_address: { type: DataTypes.STRING },
        drop_address: { type: DataTypes.STRING },

        vechile_type: { type: DataTypes.STRING},
        amount: { type: DataTypes.INTEGER },

        ride_status: { type: DataTypes.ENUM("Completed","Cancelled")},

        user_id: {
            type: DataTypes.INTEGER,
            references: { model: 'users', key: 'id' },
        },
        driver_id: {
            type: DataTypes.INTEGER,
            references: { model: 'drivers', key: 'id' },
        },
        booking_id: {
            type: DataTypes.INTEGER,
            references: { model:'bookings', key: 'id' },
        },
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

    // Bookings.belongsTo(db.users,{foreignKey:'user_id',as:'user_id'});
    // Bookings.belongsTo(db.drivers,{foreignKey:'driver_id',as:'driver_id'});
    
    return myrides;
}

