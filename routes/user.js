const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

router.post('/add-user', userController.postAddUser);
router.post('/add-profile-pic', userController.upload, userController.postAddProfilePic);
router.post('/login-user', userController.postLoginUser);

module.exports = router;