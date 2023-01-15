const { Op } = require('sequelize');
const User = require('../models/user');
const Message = require('../models/msg');

exports.getOnlineUsers = async (req, res, next) => {
    try {
        const loggedUser = await User.findOne({ where: { id: req.loggedUser.id } });
        const users = await User.findAll();
        const otherUsers = users.filter(user => user.id !== loggedUser.id);
        res.status(200).json({ success: true, otherUsers: otherUsers, loggedUser: loggedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
exports.postAddMsg = async (req, res, next) => {
    try {
        await req.loggedUser.createMessage({
            msg: req.body.msgSent,
            date: `${new Date().getDate()} - ${months[new Date().getMonth()]} - ${new Date().getFullYear()}`,
            time: `${new Date().getHours()} : ${new Date().getMinutes()}`
        });
        res.status(201).json({ success: true, message: 'Message sent.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
};

exports.getMsgs = async (req, res, next) => {
    const lastMsgId = req.query.lastMsgId;
    const messages = await Message.findAll({ where: { id: { [Op.gt]: lastMsgId } } });
    const msgAndUser = [];
    for (let message of messages) {
        const user = await User.findOne({ where: { id: message.userId } });
        const modifiedMessage = { ...message, by: user.name };
        msgAndUser.push(modifiedMessage);
    }
    res.status(200).json({ success: true, messages: msgAndUser });
}