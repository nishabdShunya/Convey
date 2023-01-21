const express = require('express');

const groupChatController = require('../controllers/groupChat');

const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/members', authMiddleware.authenticate, groupChatController.getGroupMembers);

router.post('/add-msg', authMiddleware.authenticate, groupChatController.postAddMsg);

router.get('/get-msgs/:chatGroup', authMiddleware.authenticate, groupChatController.getGroupMsgs);

module.exports = router;