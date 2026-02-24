"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Specialties', [
      { name: 'General Practitioner', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Cardiologist', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Dermatologist', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Specialties', null, {});
  }
};
