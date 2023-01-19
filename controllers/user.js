const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/user');

exports.postAddUser = async (req, res, next) => {
    try {
        if (req.body.name === '' || req.body.email === '' || req.body.phno === '' || req.body.password === '') {
            res.status(400).json({ success: false, message: 'Invalid request. Please enter all the fields.' });
        } else {
            const user = await User.findOne({ where: { email: req.body.email } });
            if (user) {
                res.status(403).json({ success: false, message: 'A user with this email already exist.' });
            } else {
                bcrypt.hash(req.body.password, 10, async (err, hash) => {
                    await User.create({
                        name: req.body.name,
                        email: req.body.email,
                        phno: req.body.phno,
                        password: hash
                    });
                    res.status(201).json({ success: true, message: 'Please provide a profile picture.' });
                });
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/profilePics')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

exports.upload = multer({
    storage: storage,
    limits: { fileSize: '1000000' },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/
        const mimeType = fileTypes.test(file.mimetype)
        const extname = fileTypes.test(path.extname(file.originalname))
        if (mimeType && extname) {
            return cb(null, true)
        }
        cb('Give proper files format to upload.')
    }
}).single('profile_pic')

exports.postAddProfilePic = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email_copy } });
        await user.update({ profile_pic: req.file.path });
        res.status(201).json({
            success: true,
            message: 'Congratulations! You signed up successfully.',
            profile_pic: req.file.path
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
}

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
                        res.status(201).json({
                            success: true,
                            message: 'Logged in successfully.',
                            token: generateAccessToken(user.id),
                            loggedUser: user.name
                        });
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