const express = require('express');

const groupChatController = require('../controllers/groupChat');

const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/members', authMiddleware.authenticate, groupChatController.getGroupMembers);

router.post('/add-msg', authMiddleware.authenticate, groupChatController.postAddMsg);

router.get('/get-msgs/:chatGroup', authMiddleware.authenticate, groupChatController.getGroupMsgs);

router.post('/make-admin', authMiddleware.authenticate, groupChatController.postMakeAdmin);

router.delete('/remove-member/:groupAndUsersId', authMiddleware.authenticate, groupChatController.removeMember);

router.post('/add-member', authMiddleware.authenticate, groupChatController.postAddMember);

module.exports = router;