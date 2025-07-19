import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';
import Navbar from '../components/Navbar';
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
  const [mainProfile, setMainProfile] = useState(null);
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

  // Fetch main profile for Navbar
  useEffect(() => {
    const fetchMainProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profiles', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMainProfile(res.data[0]);
      } catch (err) {
        setMainProfile(null);
      }
    };
    fetchMainProfile();
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
      <Navbar profile={mainProfile} />
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