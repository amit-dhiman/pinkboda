// const db= require('./index');
module.exports = (sequelize, DataTypes) => {

    const myrides = sequelize.define('myrides', {

        id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},

        pickup_long: { type: DataTypes.DECIMAL(10, 6)},
        pickup_lat: { type: DataTypes.DECIMAL(10, 6)},
        drop_long: { type: DataTypes.DECIMAL(10, 6)},
        drop_lat: { type: DataTypes.DECIMAL(10, 6)},

        pickup_address: { type: DataTypes.STRING },
        drop_address: { type: DataTypes.STRING },

        vechile_type: { type: DataTypes.STRING},        //  bike
        amount: { type: DataTypes.DECIMAL(6,2) },

        ride_status: { type: DataTypes.ENUM("Completed","Canceled")},

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

    // Bookings.belongsTo(db.users,{foreignKey:'user_id',as:'user_id'});
    // Bookings.belongsTo(db.drivers,{foreignKey:'driver_id',as:'driver_id'});
    
    return myrides;
}

