const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.postAddUser = async (req, res, next) => {
    try {
        if (req.body.name === '' || req.body.email === '' || req.body.phno === '' || req.body.password === '') {
            res.status(400).json({ success: false, message: 'Invalid request. Please enter all the fields.' });
        } else {
            const user = await User.findOne({ where: { email: req.body.email } });
            if (user) {
                res.status(403).json({ success: false, message: 'A user with this email already exist. Please login instead.' });
            } else {
                bcrypt.hash(req.body.password, 10, async (err, hash) => {
                    await User.create({
                        name: req.body.name,
                        email: req.body.email,
                        phno: req.body.phno,
                        password: hash
                    });
                    res.status(201).json({ success: true, message: 'Congratulations! You successfully signed up.' });
                });
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
};

exports.postLoginUser = async (req, res, next) => {
    try {
        if (req.body.email === '' || req.body.password === '') {
            res.status(400).json({ success: false, message: 'Invalid request. Please enter all the fields.' });
        } else {
            const user = await User.findOne({ where: { email: req.body.email } });
            if (!user) {
                res.status(404).json({ success: false, message: 'Please enter registered email.' });
            } else {
                bcrypt.compare(req.body.password, user.password, (err, result) => {
                    if (!result) {
                        res.status(401).json({ success: false, message: 'Incorrect password.' });
                    } else {
                        res.status(201).json({ success: true, message: 'Logged in successfully.', token: generateAccessToken(user.id) });
                    }
                });
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
}

function generateAccessToken(id) {
    return jwt.sign({ userId: id }, process.env.TOKEN_SECRET_KEY);
}