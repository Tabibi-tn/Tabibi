"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Appointments', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      patientId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'Patients', key: 'id' }, onDelete: 'CASCADE' },
      doctorId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'Doctors', key: 'id' }, onDelete: 'CASCADE' },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      time: { type: Sequelize.TIME, allowNull: false },
      status: { type: Sequelize.ENUM('pending','approved','cancelled','completed'), defaultValue: 'pending' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Appointments');
  }
};
