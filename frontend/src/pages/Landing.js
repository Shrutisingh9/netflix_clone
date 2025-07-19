import React, { useState, useEffect } from 'react';
import styles from './Landing.module.css';
import logo from '../assets/netflix-logo.png';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/home');
    }
  }, [navigate]);

  const handleGetStarted = (e) => {
    e.preventDefault();
    // Pass email to register page if entered
    if (email) {
      navigate('/register', { state: { email } });
    } else {
      navigate('/register');
    }
  };

  return (
    <div className={styles.bgWrapper}>
      <div className={styles.overlay} />
      <div className={styles.centerBox}>
        <div className={styles.header}>
          <img src={logo} alt="Netflix" className={styles.logo} />
          <button className={styles.signInBtn} onClick={() => navigate('/login')}>Sign In</button>
        </div>
        <div className={styles.content}>
          <h1 className={styles.title}>Unlimited movies, TV shows, and more</h1>
          <h2 className={styles.subtitle}>Watch anywhere. Cancel anytime.</h2>
          <p className={styles.desc}>Ready to watch? Enter your email to create or restart your membership.</p>
          <form className={styles.form} onSubmit={handleGetStarted}>
            <input
              className={styles.input}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button className={styles.getStartedBtn} type="submit">Get Started &gt;</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Landing; 