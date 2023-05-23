const { Op } = require('sequelize');
const AWS = require('aws-sdk');
const formidable = require('formidable');
const User = require('../models/user');
const Message = require('../models/msg');

exports.getOnlineUsers = async (req, res, next) => {
  try {
    const loggedUser = await User.findOne({ where: { id: req.loggedUser.id } });
    const loggedUserGroups = await loggedUser.getGroups();
    const users = await User.findAll();
    const otherUsers = users.filter((user) => user.id !== loggedUser.id);
    res.status(200).json({
      success: true,
      otherUsers: otherUsers,
      loggedUser: loggedUser,
      loggedUserGroups: loggedUserGroups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database operation failed. Please try again.',
    });
  }
};

const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
exports.postAddMsg = (req, res, next) => {
  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    try {
      if (files.chat_image.originalFilename !== '') {
        const newFilename = files.chat_image.newFilename;
        const originalFilename = files.chat_image.originalFilename;
        const fileExtension = originalFilename.split('.').pop();
        const filename = `${newFilename}.${fileExtension}`;
        const fileURL = await s3Upload(filename, files.chat_image.filepath);
        await Message.create({
          msg: fields.chat_msg,
          fileURL: fileURL,
          date: `${new Date().getDate()} - ${
            months[new Date().getMonth()]
          } - ${new Date().getFullYear()}`,
          time: `${new Date().getHours()} : ${new Date().getMinutes()}`,
          userId: req.loggedUser.id,
        });
        res.status(201).json({
          success: true,
          message: 'Message sent.',
          by: req.loggedUser.name,

          dataValues: {
            createdAt: new Date(),
            date: `${new Date().getDate()} - ${
              months[new Date().getMonth()]
            } - ${new Date().getFullYear()}`,
            fileURL: fileURL,
            id: 1,
            msg: fields.chat_msg,
            time: `${new Date().getHours()} : ${new Date().getMinutes()}`,
            updatedAt: new Date(),
            userId: req.loggedUser.id,
          },
        });
      } else {
        await Message.create({
          msg: fields.chat_msg,
          date: `${new Date().getDate()} - ${
            months[new Date().getMonth()]
          } - ${new Date().getFullYear()}`,
          time: `${new Date().getHours()} : ${new Date().getMinutes()}`,
          userId: req.loggedUser.id,
        });
        res.status(201).json({
          success: true,
          message: 'Message sent.',
          by: req.loggedUser.name,

          dataValues: {
            createdAt: new Date(),
            date: `${new Date().getDate()} - ${
              months[new Date().getMonth()]
            } - ${new Date().getFullYear()}`,
            fileURL: null,
            id: 1,
            msg: fields.chat_msg,
            time: `${new Date().getHours()} : ${new Date().getMinutes()}`,
            updatedAt: new Date(),
            userId: req.loggedUser.id,
          },
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Database operation failed. Please try again.',
      });
    }
  });
};

const s3Upload = (filename, data) => {
  const s3Bucket = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  });
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filename,
    Body: Buffer.from(data, 'binary'),
    ACL: 'public-read',
  };
  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3Response) => {
      if (err) {
        reject(err);
      } else {
        resolve(s3Response.Location);
      }
    });
  });
};

exports.getMsgs = async (req, res, next) => {
  try {
    const lastMsgId = req.query.lastMsgId;
    const publicMessages = await Message.findAll({
      where: { groupId: { [Op.is]: null }, id: { [Op.gt]: lastMsgId } },
    });
    const publicMsgAndUser = [];
    for (let message of publicMessages) {
      const user = await User.findOne({ where: { id: message.userId } });
      const modifiedMessage = { ...message, by: user.name };
      publicMsgAndUser.push(modifiedMessage);
    }
    res.status(200).json({ success: true, messages: publicMsgAndUser });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database operation failed. Please try again.',
    });
  }
};
