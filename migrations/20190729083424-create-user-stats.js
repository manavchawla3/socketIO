'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_stats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      redis_id: {
        type: Sequelize.TEXT
      },
      origin: {
        type: Sequelize.TEXT
      },
      browser: {
        type: Sequelize.TEXT
      },
      ip: {
        type: Sequelize.TEXT
      },
      token: {
        type: Sequelize.TEXT
      },
      connected_at: {
        type: Sequelize.DATE
      },
      disconnected_at: {
        type: Sequelize.DATE
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_stats');
  }
};