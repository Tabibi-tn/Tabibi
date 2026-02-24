"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Consultations', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      appointmentId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'Appointments', key: 'id' }, onDelete: 'CASCADE' },
      doctorId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'Doctors', key: 'id' }, onDelete: 'CASCADE' },
      patientId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'Patients', key: 'id' }, onDelete: 'CASCADE' },
      diagnosis: { type: Sequelize.TEXT, allowNull: true },
      prescription: { type: Sequelize.TEXT, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      fileUrl: { type: Sequelize.STRING, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Consultations');
  }
};
