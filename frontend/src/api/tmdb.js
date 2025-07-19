import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

export const fetchTrending = async () => {
  const res = await axios.get(`${BASE_URL}/trending`);
  return res.data;
};

export const fetchTopRated = async () => {
  const res = await axios.get(`${BASE_URL}/top-rated`);
  return res.data;
};

export const fetchActionMovies = async () => {
  const res = await axios.get(`${BASE_URL}/action`);
  return res.data;
}; 