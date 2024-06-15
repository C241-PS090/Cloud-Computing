const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { getUsersHandler, registerUserHandler, loginHandler, updateProfileHandler, getUserByIdHandler, logoutHandler, uploadProfilePicture, getPredictionsByUserIdHandler } = require('../handlers/User');
const { verifyToken } = require('../middlewares/Auth');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/login', loginHandler);
router.post('/register', registerUserHandler);
router.get('/users', verifyToken, getUsersHandler);
router.get('/users/:userId', verifyToken, getUserByIdHandler);
router.put('/users/:userId', verifyToken, uploadProfilePicture, updateProfileHandler);
router.delete('/logout', logoutHandler);
router.get('/users/:userId/predictions', getPredictionsByUserIdHandler);

module.exports = router;

