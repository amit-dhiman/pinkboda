'use strict';
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('termsConditions', {

    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    terms:{ type: DataTypes.STRING },
    
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
  return Admin;
}
