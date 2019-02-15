'use strict';
module.exports = (sequelize, DataTypes) => {
  const attribution = sequelize.define('attribution', {
    id_noun: DataTypes.INTEGER,
    id_unit: DataTypes.INTEGER,
    id_author: DataTypes.INTEGER
  }, {
    paranoid: true
  });
  attribution.associate = function(models) {
    attribution.belongsTo(models.units, {
      foreignKey:"id_unit",
      targetKey: "id",
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    attribution.belongsTo(models.nouns, {
      foreignKey:"id_noun",
      targetKey: "id",
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  };
  return attribution;
};
