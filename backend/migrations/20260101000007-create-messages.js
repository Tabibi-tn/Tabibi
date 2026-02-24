"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Messages', {
      id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      senderId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      receiverId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      content: { type: Sequelize.TEXT, allowNull: false },
      appointmentId: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'Appointments', key: 'id' }, onDelete: 'SET NULL' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Messages');
  }
};
