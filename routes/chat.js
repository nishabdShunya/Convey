const express = require('express');

const chatController = require('../controllers/chat');

const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/online-users', authMiddleware.authenticate, chatController.getOnlineUsers);

module.exports = router;