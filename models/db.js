const {Sequelize} = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.database,process.env.user_name,process.env.password,{
  host: process.env.host,
  dialect: process.env.dialect,
  logging: true,
  // pool:{max:5,min:0,idle:10000}
});

sequelize.authenticate().then(()=>{
  console.log('---mysql db connected---');
})
.catch(err=> console.log('---db err----',err))


// sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }).then(() => {
// sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
// })

sequelize.sync({ force: false }).then(() => {
  console.log('----re-sync-----');
}).catch((err) => {
  console.log('----re sync err---', err);
  throw err
})


module.exports= sequelize;
//  master
