const { Op } = require('sequelize');
const Group = require('../models/group');
const Message = require('../models/msg');
const User = require('../models/user');
const GroupAndUsers = require('../models/groupAndUsers');

exports.getGroupMembers = async (req, res, next) => {
    try {
        const groupName = req.query.chatGroup;
        const currentGroup = await Group.findOne({ where: { name: groupName } });
        const members = await currentGroup.getUsers();
        const allUsers = await User.findAll();
        const notMembers = allUsers.filter(user => !members.filter(member => member.id === user.id).length);
        res.status(200).json({
            success: true,
            groupInfo: currentGroup,
            members: members,
            notMembers: notMembers,
            loggedUser: req.loggedUser
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
exports.postAddMsg = async (req, res, next) => {
    try {
        const groupName = req.query.chatGroup;
        const currentGroup = await Group.findOne({ where: { name: groupName } });
        const currentGroupUser = req.loggedUser;
        await Message.create({
            msg: req.body.msgSent,
            date: `${new Date().getDate()} - ${months[new Date().getMonth()]} - ${new Date().getFullYear()}`,
            time: `${new Date().getHours()} : ${new Date().getMinutes()}`,
            userId: currentGroupUser.id,
            groupId: currentGroup.id
        });
        res.status(201).json({ success: true, message: 'Message sent.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
};

exports.getGroupMsgs = async (req, res, next) => {
    try {
        const lastMsgId = req.query.lastMsgId;
        const groupName = req.params.chatGroup;
        const currentGroup = await Group.findOne({ where: { name: groupName } });
        const groupMessages = await Message.findAll({ where: { groupId: currentGroup.id, id: { [Op.gt]: lastMsgId } } });
        const groupMsgAndUser = [];
        for (let message of groupMessages) {
            const user = await User.findOne({ where: { id: message.userId } });
            const modifiedMessage = { ...message, by: user.name };
            groupMsgAndUser.push(modifiedMessage);
        }
        res.status(200).json({ success: true, messages: groupMsgAndUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
}

exports.postMakeAdmin = async (req, res, next) => {
    try {
        const groupAndUser = await GroupAndUsers.findOne({ where: { id: req.body.groupAndUsersId } });
        await groupAndUser.update({ isAdmin: true });
        const userMadeAdmin = await User.findOne({ where: { id: groupAndUser.userId } });
        res.status(201).json({ success: true, nameOfUserMadeAdmin: userMadeAdmin.name });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
}

exports.removeMember = async (req, res, next) => {
    try {
        const groupAndUser = await GroupAndUsers.findOne({ where: { id: req.params.groupAndUsersId } });
        const userBeingRemoved = await User.findOne({ where: { id: groupAndUser.userId } });
        await GroupAndUsers.destroy({ where: { id: req.params.groupAndUsersId } });
        res.status(200).json({ success: true, nameOfMemberRemoved: userBeingRemoved.name });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
}

exports.postAddMember = async (req, res, next) => {
    try {
        const userAdded = await User.findOne({ where: { email: req.body.addMemberInput } });
        const addedToGroup = await Group.findOne({ where: { name: req.body.groupName } });
        await addedToGroup.addUser(userAdded);
        res.status(201).json({ success: true, userAdded: userAdded });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
}