const express = require('express');

const chatController = require('../controllers/chat');

const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/online-users', authMiddleware.authenticate, chatController.getOnlineUsers);

router.post('/add-msg', authMiddleware.authenticate, chatController.postAddMsg);

router.get('/get-msgs', authMiddleware.authenticate, chatController.getMsgs);

module.exports = router;