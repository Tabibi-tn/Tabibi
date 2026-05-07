'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('Doctors');

    if (!tableDesc.rejectionReason) {
      await queryInterface.addColumn('Doctors', 'rejectionReason', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'status'
      });
    }

    await queryInterface.changeColumn('Doctors', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Doctors', 'status', {
      type: Sequelize.ENUM('pending', 'approved'),
      allowNull: false,
      defaultValue: 'pending'
    });

    await queryInterface.removeColumn('Doctors', 'rejectionReason');
  }
};
