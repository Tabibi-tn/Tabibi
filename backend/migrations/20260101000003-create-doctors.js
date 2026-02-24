"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Doctors', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      userId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      specialtyId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'Specialties', key: 'id' }, onDelete: 'SET NULL' },
      experience: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      clinicAddress: { type: Sequelize.STRING, allowNull: true },
      fee: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      licenseNumber: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.ENUM('pending','approved'), defaultValue: 'pending' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Doctors');
  }
};
