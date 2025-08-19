// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login, getUsers, deleteUser, updateUser } = require('../controllers/auth.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Público
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Público
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/users
 * @desc    Ver todos los usuarios
 * @access  Privado (admin)
 */
router.get('/users', authenticateToken, authorizeRole('admin'), getUsers);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Eliminar un usuario por ID
 * @access  Privado (admin)
 */
router.delete('/users/:id', authenticateToken, authorizeRole('admin'), deleteUser);

/**
 * @route   PATCH /api/auth/users/:id
 * @desc    Editar un usuario por ID
 * @access  Privado (admin)
 */
router.patch('/users/:id', authenticateToken, authorizeRole('admin'), updateUser);

module.exports = router;
