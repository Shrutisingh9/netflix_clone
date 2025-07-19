import React, { useState, useEffect } from 'react';
import styles from './Login.module.css';
import logo from '../assets/netflix-logo.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      
      // Fetch user details from backend
      const userRes = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${res.data.token}` },
      });
      
      // Update localStorage with latest user details
      localStorage.setItem('email', userRes.data.email);
      localStorage.setItem('fullName', userRes.data.fullName);
      localStorage.setItem('username', userRes.data.username);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className={styles.container}>
      <img src={logo} alt="Netflix" className={styles.logo} />
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <div style={{ position: 'relative' }}>
          <input
            className={styles.input}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ paddingRight: 40 }}
          />
          <span
            onClick={() => setShowPassword(s => !s)}
            style={{ position: 'absolute', right: 12, top: 12, cursor: 'pointer', color: '#bbb', userSelect: 'none' }}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>
        <button className={styles.button} type="submit">Sign In</button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        <div style={{ marginTop: 16, color: '#bbb', textAlign: 'center' }}>
          New to Netflix? <Link to="/register" style={{ color: '#e50914' }}>Sign Up</Link>
        </div>
      </form>
    </div>
  );
}

export default Login; 