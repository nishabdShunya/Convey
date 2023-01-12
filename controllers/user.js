const bcrypt = require('bcrypt');
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