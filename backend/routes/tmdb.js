const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

router.get('/trending', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
    res.json(response.data.results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

router.get('/top-rated', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
    res.json(response.data.results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top rated movies' });
  }
});

router.get('/action', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`);
    res.json(response.data.results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch action movies' });
  }
});

module.exports = router; 