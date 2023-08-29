const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');

// const sequelize = new Sequelize(process.env.database,process.env.username,process.env.password,{
//   host: process.env.host,
//   dialect: process.env.dialect,
//   logging: true,
//   // pool:{max:5,min:0,idle:10000}
// });

// sequelize.authenticate().then(()=>{
//   console.log('---mysql db connected---');
// })
// .catch(err=> console.log('---db err----',err))
// const db = {};
// db.Sequelize = Sequelize;
// db.sequelize = sequelize;

let db = {};

db.users = require('./users')(sequelize, DataTypes);
db.drivers = require('./drivers')(sequelize, DataTypes);
db.bookings = require('./bookings')(sequelize, DataTypes);


db.users.hasMany(db.bookings, { foreignKey: 'user_id'});             // ,as:"user_id" 
db.drivers.hasMany(db.bookings, { foreignKey: 'driver_id'});         // ,as:"driver_id" 


db.bookings.belongsTo(db.users, { foreignKey: 'user_id'  });        // , as: 'user_id'
db.bookings.belongsTo(db.drivers, { foreignKey: 'driver_id' });     // , as: 'driver_id'




// Define associations here

// sequelize.sync({ force: true }).then(() => {
//   console.log('---re-sync---');
// }).catch((err) => {
//   console.log('----re sync err---', err);
//   throw err;
// });



module.exports = db;





