'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [apptDesc, msgDesc, userDesc] = await Promise.all([
      queryInterface.describeTable('Appointments'),
      queryInterface.describeTable('Messages'),
      queryInterface.describeTable('Users')
    ]);

    // Appointments.notes — model defines it, migration never added it
    if (!apptDesc.notes) {
      await queryInterface.addColumn('Appointments', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    // Messages.updatedAt — Sequelize default timestamps expect it, migration only has createdAt
    if (!msgDesc.updatedAt) {
      await queryInterface.addColumn('Messages', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      });
    }

    // Users profile fields — route handles them but model/DB never had them
    const profileFields = {
      phone:              { type: Sequelize.STRING(30),  allowNull: true },
      dateOfBirth:        { type: Sequelize.DATEONLY,    allowNull: true },
      address:            { type: Sequelize.STRING,      allowNull: true },
      emergencyContact:   { type: Sequelize.STRING,      allowNull: true },
      bloodType:          { type: Sequelize.STRING(10),  allowNull: true },
      allergies:          { type: Sequelize.TEXT,        allowNull: true },
      medicalConditions:  { type: Sequelize.TEXT,        allowNull: true }
    };

    for (const [col, def] of Object.entries(profileFields)) {
      if (!userDesc[col]) {
        await queryInterface.addColumn('Users', col, def);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Appointments', 'notes');
    await queryInterface.removeColumn('Messages', 'updatedAt');
    for (const col of ['phone','dateOfBirth','address','emergencyContact','bloodType','allergies','medicalConditions']) {
      await queryInterface.removeColumn('Users', col);
    }
  }
};
