"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Doctors', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('Doctors', 'diplomaUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Doctors', 'licenseDocUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Doctors', 'additionalDocuments', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Doctors', 'bio');
    await queryInterface.removeColumn('Doctors', 'diplomaUrl');
    await queryInterface.removeColumn('Doctors', 'licenseDocUrl');
    await queryInterface.removeColumn('Doctors', 'additionalDocuments');
  }
};
