"use strict";
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface) => {
    const hash = await bcrypt.hash('password', 10);
    await queryInterface.bulkInsert('Users', [
      { name: 'Admin User', email: 'admin@tabibi.test', password: hash, role: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Dr. Alice', email: 'alice@tabibi.test', password: hash, role: 'doctor', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Patient Bob', email: 'bob@tabibi.test', password: hash, role: 'patient', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
