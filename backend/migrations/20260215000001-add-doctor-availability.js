"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Doctors', 'availability', { type: Sequelize.JSON, allowNull: true });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Doctors', 'availability');
  }
};
