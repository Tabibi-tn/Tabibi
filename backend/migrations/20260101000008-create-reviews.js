"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Reviews', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      patientId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'Patients', key: 'id' }, onDelete: 'CASCADE' },
      doctorId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'Doctors', key: 'id' }, onDelete: 'CASCADE' },
      rating: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      comment: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Reviews');
  }
};
