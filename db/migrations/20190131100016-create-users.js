'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER(10).UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      first_name: {
        type: Sequelize.STRING(63),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(63),
        allowNull: false
      },
      account: {
        type: Sequelize.STRING(127),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(127),
        allowNull: false
      },
      status: Sequelize.TEXT('tiny'),
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};