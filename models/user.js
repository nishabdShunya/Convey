const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    phno: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    profile_pic: Sequelize.STRING
});

module.exports = User;