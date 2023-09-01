const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');


// Define associations here
let db = {};

db.users = require('./users')(sequelize, DataTypes);
db.drivers = require('./drivers')(sequelize, DataTypes);
db.bookings = require('./bookings')(sequelize, DataTypes);


db.users.hasMany(db.bookings, { foreignKey: 'user_id'});             // ,as:"user_id" maybe as:"bookings" 
db.drivers.hasMany(db.bookings, { foreignKey: 'driver_id'});         // ,as:"driver_id" 


db.bookings.belongsTo(db.users, { foreignKey: 'user_id'  });        // , as: 'user_id'
db.bookings.belongsTo(db.drivers, { foreignKey: 'driver_id' });     // , as: 'driver_id'



// sequelize.sync({ force: true }).then(() => {
//   console.log('---re-sync---');
// }).catch((err) => {
//   console.log('----re sync err---', err);
//   throw err;
// });


module.exports = db;





