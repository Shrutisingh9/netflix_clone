import React, { useState, useEffect } from 'react';
import styles from './Row.module.css';
import axios from 'axios';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w300';

function Row({ title, movies, showMyListButton = false }) {
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState({});
  const token = localStorage.getItem('token');

  // Fetch user's My List
  const fetchMyList = async () => {
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

  useEffect(() => {
    if (showMyListButton) {
      fetchMyList();
    }
  }, [showMyListButton]);

  const isInMyList = (movieId) => {
    return myList.some(movie => movie.id === movieId);
  };

  const handleMyListToggle = async (movie) => {
    if (!token) return;
    
    setLoading(prev => ({ ...prev, [movie.id]: true }));
    try {
      if (isInMyList(movie.id)) {
        // Remove from list
        await axios.delete(`http://localhost:5000/api/auth/mylist/${movie.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyList(prev => prev.filter(m => m.id !== movie.id));
      } else {
        // Add to list
        await axios.post('http://localhost:5000/api/auth/mylist', movie, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyList(prev => [...prev, movie]);
      }
    } catch (err) {
      console.error('Failed to update My List:', err);
    }
    setLoading(prev => ({ ...prev, [movie.id]: false }));
  };

  return (
    <div className={styles.row}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.movies}>
        {movies.map((movie) => (
          <div key={movie.id} className={styles.card}>
            {movie.poster_path ? (
              <img
                src={IMAGE_BASE_URL + movie.poster_path}
                alt={movie.title}
                className={styles.poster}
              />
            ) : (
              <div className={styles.noPoster}>No Image</div>
            )}
            {showMyListButton && token && (
              <button
                onClick={() => handleMyListToggle(movie)}
                disabled={loading[movie.id]}
                className={styles.myListButton}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: isInMyList(movie.id) ? '#e50914' : 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {loading[movie.id] ? '...' : (isInMyList(movie.id) ? '−' : '+')}
              </button>
            )}
            <div className={styles.movieTitle}>{movie.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Row; 