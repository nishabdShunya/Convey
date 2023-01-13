const express = require('express');

const chatController = require('../controllers/chat');

const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/online-users', authMiddleware.authenticate, chatController.getOnlineUsers);

router.post('/add-msg', authMiddleware.authenticate, chatController.postAddMsg);

module.exports = router;