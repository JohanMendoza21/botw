const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

/**
 * @desc   Registro de nuevo usuario
 * @route  POST /api/auth/register
 * @access Público
 */
const register = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    name = validator.trim(validator.escape(name));
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'El email no es válido' });
    }
    email = validator.normalizeEmail(email);

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 6 caracteres, incluyendo una letra y un número',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Este correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role: role || 'user' });
    await newUser.save();

    return res.status(201).json({ message: 'Usuario registrado exitosamente' });

  } catch (error) {
    console.error('❌ Error en el registro:', error);
    return res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

/**
 * @desc   Iniciar sesión
 * @route  POST /api/auth/login
 * @access Público
 */
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'El email no es válido' });
    }
    email = validator.normalizeEmail(email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas (email)' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas (contraseña)' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secreto123',
      { expiresIn: '2h' }
    );

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    return res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

/**
 * @desc   Obtener todos los usuarios registrados
 * @route  GET /api/auth/users
 * @access Privado (admin)
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role _id').lean();
    return res.status(200).json({ users });
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    return res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

/**
 * @desc   Eliminar un usuario por ID
 * @route  DELETE /api/auth/users/:id
 * @access Privado (admin)
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    return res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

/**
 * @desc   Editar un usuario por ID
 * @route  PATCH /api/auth/users/:id
 * @access Privado (admin)
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role } = req.body;

    const updates = {};
    if (name) updates.name = validator.trim(validator.escape(name));
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'El email no es válido' });
      }
      updates.email = validator.normalizeEmail(email);
    }
    if (role) updates.role = role;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ message: 'Usuario actualizado correctamente', user: updatedUser });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    return res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getUsers,
  deleteUser,
  updateUser
};
  