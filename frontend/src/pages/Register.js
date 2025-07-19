import React, { useState, useEffect } from 'react';
import styles from './Login.module.css';
import logo from '../assets/netflix-logo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const location = useLocation();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        fullName,
        username,
        email,
        password
      });
      // Auto-login after registration
      const loginRes = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', loginRes.data.token);
      
      // Fetch user details from backend
      const userRes = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${loginRes.data.token}` },
      });
      
      // Update localStorage with latest user details
      localStorage.setItem('email', userRes.data.email);
      localStorage.setItem('fullName', userRes.data.fullName);
      localStorage.setItem('username', userRes.data.username);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className={styles.container}>
      <img src={logo} alt="Netflix" className={styles.logo} />
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
        <input
          className={styles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
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
        <div style={{ position: 'relative' }}>
          <input
            className={styles.input}
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            style={{ paddingRight: 40 }}
          />
          <span
            onClick={() => setShowConfirmPassword(s => !s)}
            style={{ position: 'absolute', right: 12, top: 12, cursor: 'pointer', color: '#bbb', userSelect: 'none' }}
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </span>
        </div>
        <button className={styles.button} type="submit">Sign Up</button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        {success && <div style={{ color: 'limegreen', marginTop: 10 }}>{success}</div>}
        <div style={{ marginTop: 16, color: '#bbb', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: '#e50914' }}>Sign In</Link>
        </div>
      </form>
    </div>
  );
}

export default Register; 