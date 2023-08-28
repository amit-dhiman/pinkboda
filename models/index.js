const {Sequelize,DataTypes} = require('sequelize');
const {sequelize} = require('./db');

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


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.user = require('./users')(sequelize, DataTypes);







db.sequelize.sync({ force: false }).then(() => {
  console.log('---re-sync---');
}).catch((err) => {
  console.log('----re sync err---', err);
  throw err
})

module.exports=  db;



