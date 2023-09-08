const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');


// Define associations here
let db = {};
db.sequelize= sequelize;

db.users = require('./users')(sequelize, DataTypes);
db.drivers = require('./drivers')(sequelize, DataTypes);
db.bookings = require('./bookings')(sequelize, DataTypes);
db.notifications = require('./notifications')(sequelize, DataTypes);



db.users.hasMany(db.bookings, { foreignKey: 'user_id'});             // ,as:"user_id" maybe as:"bookings" 
db.drivers.hasMany(db.bookings, { foreignKey: 'driver_id'});         // ,as:"driver_id" 


db.bookings.belongsTo(db.users, { foreignKey: 'user_id'  });        // , as: 'user_id'
db.bookings.belongsTo(db.drivers, { foreignKey: 'driver_id' });     // , as: 'driver_id'








module.exports = db;

