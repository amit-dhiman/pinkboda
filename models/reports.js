'use strict';
module.exports = (sequelize, DataTypes) => {

  const Reports = sequelize.define('reports', {

    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    user_id: {
      type: DataTypes.INTEGER,
      references: {model:'users',key:'id'},
    },
    driver_id: {
      type: DataTypes.INTEGER,
      references:{model:'drivers',key:'id'},
    },
    booking_id: {
      type: DataTypes.INTEGER,
      references:{model:'bookings',key:'id'},
    },
    
    report_message: { type: DataTypes.STRING},

  },{
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: "updated_at",
    deletedAt: 'deleted_at',
    defaultScope:{where:{deleted_at: null}},
  })

  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Reports.belongsTo(sequelize.model.users, { foreignKey: 'booking_id'});      //, as: 'bookings'
  return Reports;
}

