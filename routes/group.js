const express = require('express');

const groupController = require('../controllers/group');

const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post('/add-group', authMiddleware.authenticate, groupController.postAddGroup);
router.post('/add-group-pic', groupController.upload, groupController.postAddGroupPic);
// router.post('/login-user', userController.postLoginUser);

module.exports = router;