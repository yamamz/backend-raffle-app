'use strict';
var bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Roles', [{
      name: 'user',
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'moderator', createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      name: 'admin', createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }], {});

    await queryInterface.bulkInsert('Users', [{
      username: 'moderator',
      email: 'meleciort@gmail.com',
      firstName: 'Nelson',
      lastName: 'Boren',
      address: 'New Found Land, Canada',
      password: bcrypt.hashSync('@admin1234', 8),
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }
    ], {});

    await queryInterface.bulkInsert('user_roles', [{
      roleId: 1,
      userId: 1,
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      roleId: 2,
      userId: 1,
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }, {
      roleId: 3,
      userId: 1,
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('user_roles', null, {});

  }
};
