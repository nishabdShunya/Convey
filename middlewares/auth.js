const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Group = require('../models/group');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const tokenDecoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        const loggedUser = await User.findOne({ where: { id: tokenDecoded.userId } });
        req.loggedUser = loggedUser;
        next();
    } catch (error) {
        console.log(error);
    }
}