const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const GroupAndUsers = sequelize.define('groupAndUsers', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    isAdmin: Sequelize.BOOLEAN
});

module.exports = GroupAndUsers;