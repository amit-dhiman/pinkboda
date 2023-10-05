const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db');


// Define associations here
let db = {};
db.sequelize= sequelize;
db.DataTypes= DataTypes;

db.users = require('./users')(sequelize, DataTypes);
db.admins = require('./admins')(sequelize, DataTypes);
db.drivers = require('./drivers')(sequelize, DataTypes);
db.bookings = require('./bookings')(sequelize, DataTypes);
db.search_history = require('./search_history')(sequelize, DataTypes);
db.notifications = require('./notifications')(sequelize, DataTypes);

db.chats = require('./chat')(sequelize, DataTypes);
db.reports = require('./reports')(sequelize, DataTypes);
db.ratings = require('./ratings')(sequelize, DataTypes);
db.supports = require('./support')(sequelize, DataTypes);
db.myrides = require('./myrides')(sequelize, DataTypes);
db.offers = require('./offers')(sequelize, DataTypes);



//  user driver bookings relationship

db.users.hasMany(db.bookings, { foreignKey: 'user_id'});             // ,as:"user_id"  maybe as:"bookings" 
db.drivers.hasMany(db.bookings, { foreignKey: 'driver_id'});         // ,as:"driver_id"  maybe as:"bookings" 

db.bookings.belongsTo(db.users, { foreignKey: 'user_id'});        // , as: 'user_id'
db.bookings.belongsTo(db.drivers, { foreignKey: 'driver_id'});     // , as: 'driver_id'


// for user driver chat relationship

// db.users.hasMany(db.chats, { foreignKey: 'user_id'});             // ,as:"user_id" maybe as:"chats" 
// db.drivers.hasMany(db.chats, { foreignKey: 'driver_id'});         // ,as:"driver_id" 

db.bookings.hasMany(db.chats, { foreignKey: 'booking_id'});       // , as: 'messages'
db.chats.belongsTo(db.bookings, { foreignKey: 'booking_id'});  


// For user's, driver, booking & report  relationship

db.users.hasMany(db.reports,{foreignKey:"user_id"})                 // , as: "reports"
db.drivers.hasMany(db.reports,{foreignKey:"driver_id"})             // , as: "reports"
db.bookings.hasMany(db.reports,{foreignKey:"booking_id"})    // ,as: "allReports"

db.reports.belongsTo(db.users,{foreignKey:"user_id"})
db.reports.belongsTo(db.drivers,{foreignKey:"driver_id"})
db.reports.belongsTo(db.bookings,{foreignKey:"booking_id"})




// For user's, drivers, bookings & ratings  relationship

db.users.hasMany(db.ratings, {foreignKey:"user_id"})                 // , as: "ratings"
db.drivers.hasMany(db.ratings,{foreignKey:"driver_id"})             // , as: "ratings"
db.bookings.hasMany(db.ratings,{foreignKey:"booking_id"})    // ,as: "allRatings"

db.ratings.belongsTo(db.users,{foreignKey:"user_id"})
db.ratings.belongsTo(db.drivers,{foreignKey:"driver_id"})
db.ratings.belongsTo(db.bookings,{foreignKey:"booking_id"})




// For user's, drivers, bookings & Notifications relationship

db.users.hasMany(db.notifications, {foreignKey:"user_id"})                 // , as: "ratings"
db.drivers.hasMany(db.notifications,{foreignKey:"driver_id"})             // , as: "ratings"
db.bookings.hasMany(db.notifications,{foreignKey:"booking_id"})    // ,as: "allRatings"

db.notifications.belongsTo(db.users,{foreignKey:"user_id"})
db.notifications.belongsTo(db.drivers,{foreignKey:"driver_id"})
db.notifications.belongsTo(db.bookings,{foreignKey:"booking_id"})



// For user's, drivers, bookings & myrides  relationship

db.users.hasMany(db.myrides, {foreignKey:"user_id"})                 // , as: "ratings"
db.drivers.hasMany(db.myrides,{foreignKey:"driver_id"})             // , as: "ratings"
db.bookings.hasMany(db.myrides,{foreignKey:"booking_id"})    // ,as: "allRatings"


db.myrides.belongsTo(db.users,{foreignKey:"user_id"})
db.myrides.belongsTo(db.drivers,{foreignKey:"driver_id"})
db.myrides.belongsTo(db.bookings,{foreignKey:"booking_id"})


// For user's, drivers, bookings & supports  relationship

db.users.hasMany(db.supports, {foreignKey:"user_id"})                 // , as: "ratings"
db.supports.belongsTo(db.users,{foreignKey:"user_id"})

db.drivers.hasMany(db.supports, {foreignKey:"driver_id"})                 // , as: "ratings"
db.supports.belongsTo(db.drivers,{foreignKey:"driver_id"})



module.exports = db;
