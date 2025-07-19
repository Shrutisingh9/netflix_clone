import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import logo from '../assets/netflix-logo.png';
import Row from '../components/Row';
import { fetchTrending, fetchTopRated, fetchActionMovies } from '../api/tmdb';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [action, setAction] = useState([]);
  const [myList, setMyList] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchData() {
      setTrending(await fetchTrending());
      setTopRated(await fetchTopRated());
      setAction(await fetchActionMovies());
    }
    fetchData();
  }, []);

  // Fetch user's My List
  useEffect(() => {
    const fetchMyList = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:5000/api/auth/mylist', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyList(res.data);
      } catch (err) {
        console.error('Failed to fetch My List:', err);
      }
    };
    fetchMyList();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('fullName');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    navigate('/login');
  };

  useEffect(() => {
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <img src={logo} alt="Netflix" className={styles.logo} />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              <Link to="/profile" style={{ color: '#fff', marginRight: 16, textDecoration: 'none', fontWeight: 600 }}>Profile</Link>
              <button onClick={handleSignOut} style={{ background: '#e50914', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#fff', marginRight: 16, textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
              <Link to="/register" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 600 }}>Sign Up</Link>
            </>
          )}
        </div>
      </header>
      <section className={styles.hero}>
        <div className={styles.heroTitle}>Welcome to Netflix</div>
        <div className={styles.heroDesc}>
          Unlimited movies, TV shows, and more. Watch anywhere. Cancel anytime.
        </div>
      </section>
      {myList.length > 0 && <Row title="My List" movies={myList} showMyListButton={true} />}
      <Row title="Trending Now" movies={trending} showMyListButton={true} />
      <Row title="Top Rated" movies={topRated} showMyListButton={true} />
      <Row title="Action Movies" movies={action} showMyListButton={true} />
    </div>
  );
}

export default Home; 