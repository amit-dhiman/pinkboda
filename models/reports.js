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
    reported_by:{type:DataTypes.ENUM("User","Driver")},
    
    report_message: { type: DataTypes.STRING},
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
  // Reports.beforeCreate((report) => {
  //   report.created_at = moment().unix(); // Set created_at to current timestamp in seconds
  //   report.updated_at = moment().unix(); // Set updated_at to current timestamp in seconds
  // });

  // Users.hasMany(db, { foreignKey: 'user_id' });
  // Reports.belongsTo(sequelize.model.users, { foreignKey: 'booking_id'});      //, as: 'bookings'
  return Reports;
}

