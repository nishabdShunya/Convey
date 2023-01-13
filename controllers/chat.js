const User = require('../models/user');

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

exports.postAddMsg = async (req, res, next) => {
    try {
        await req.loggedUser.createMessage({
            msg: req.body.msgSent
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
};