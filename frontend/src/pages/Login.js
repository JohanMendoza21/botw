// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import styles from '../styles/Login.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../features/auth/authSlice';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginUser(form);

      if (res?.data?.token) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        // Guardar estado en Redux
        dispatch(loginSuccess({ token: res.data.token, user: res.data.user }));

        toast.success('✅ Inicio de sesión exitoso');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        toast.info('Respuesta inesperada del servidor');
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
      console.error('Error en login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
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
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>
      <p className={styles.linkText}>
        ¿No tienes cuenta?{' '}
        <span className={styles.link} onClick={() => navigate('/register')}>
          Regístrate aquí
        </span>
      </p>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default Login;
