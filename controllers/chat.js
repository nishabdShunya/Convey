const { Op } = require('sequelize');
const User = require('../models/user');
const Message = require('../models/msg');

exports.getOnlineUsers = async (req, res, next) => {
    try {
        const loggedUser = await User.findOne({ where: { id: req.loggedUser.id } });
        const loggedUserGroups = await loggedUser.getGroups();
        const users = await User.findAll();
        const otherUsers = users.filter(user => user.id !== loggedUser.id);
        res.status(200).json({ success: true, otherUsers: otherUsers, loggedUser: loggedUser, loggedUserGroups: loggedUserGroups });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
exports.postAddMsg = async (req, res, next) => {
    try {
        await Message.create({
            msg: req.body.msgSent,
            date: `${new Date().getDate()} - ${months[new Date().getMonth()]} - ${new Date().getFullYear()}`,
            time: `${new Date().getHours()} : ${new Date().getMinutes()}`,
            userId: req.loggedUser.id
        });
        res.status(201).json({ success: true, message: 'Message sent.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
};

exports.getMsgs = async (req, res, next) => {
    try {
        const lastMsgId = req.query.lastMsgId;
        const publicMessages = await Message.findAll({ where: { groupId: { [Op.is]: null }, id: { [Op.gt]: lastMsgId } } });
        const publicMsgAndUser = [];
        for (let message of publicMessages) {
            const user = await User.findOne({ where: { id: message.userId } });
            const modifiedMessage = { ...message, by: user.name };
            publicMsgAndUser.push(modifiedMessage);
        }
        res.status(200).json({ success: true, messages: publicMsgAndUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
};