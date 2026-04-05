// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Register.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { registerUser } from '../services/authService';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../features/auth/authSlice';

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await registerUser(form);
      if (res?.data?.token) {
        dispatch(loginSuccess({ token: res.data.token, user: res.data.user }));
        toast.success('✅ Registro exitoso');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        toast.info('Respuesta inesperada del servidor');
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al registrar';
      toast.error(message);
      console.error('Error en registro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Registrarse</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          className={styles.input}
        />
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
      <p className={styles.linkText}>
        ¿Ya tienes una cuenta?{' '}
        <span className={styles.link} onClick={() => navigate('/login')}>
          Inicia sesión
        </span>
      </p>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default Register;
