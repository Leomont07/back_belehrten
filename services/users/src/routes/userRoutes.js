const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', userController.users);
router.get('/users', userController.getAllUsers);
router.post('/register', userController.register);
router.get('/verificar', userController.verifyEmail);
router.post('/login', userController.login);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
