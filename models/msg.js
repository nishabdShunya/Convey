const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Message = sequelize.define('message', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    msg: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fileURL: Sequelize.STRING,
    date: Sequelize.STRING,
    time: Sequelize.STRING
},
    {
        timestamps: false
    });

module.exports = Message;