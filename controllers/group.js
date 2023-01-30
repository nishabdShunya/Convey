const path = require('path');
const multer = require('multer');
const Group = require('../models/group');
const User = require('../models/user');

exports.postAddGroup = async (req, res, next) => {
    try {
        if (req.body.groupName === '') {
            res.status(400).json({ success: false, message: 'Invalid request. Please provide a group name.' });
        } else {
            const group = await Group.findOne({ where: { name: req.body.groupName } });
            if (group) {
                res.status(403).json({ success: false, message: 'A group with this name already exist.' });
            } else {
                const newGroup = await Group.create({ name: req.body.groupName });
                console.log(req.loggedUser);
                await newGroup.addUser(req.loggedUser, { through: { isAdmin: true } });
                const membersId = req.body.membersId;
                for (let memberId of membersId) {
                    const user = await User.findOne({ where: { id: memberId } });
                    newGroup.addUser(user);
                }
                res.status(201).json({ success: true, message: 'Please provide a group picture.' });
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/groupPics/')
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
        cb('Give proper file format to upload.')
    }
}).single('group_pic')

exports.postAddGroupPic = async (req, res, next) => {
    try {
        const group = await Group.findOne({ where: { name: req.body.group_name } });
        await group.update({ group_pic: req.file.path });
        res.status(201).json({
            success: true,
            message: `Group "${group.name}" created successfully.`,
            group_pic: req.file.path,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database operation failed. Please try again.' });
    }
}