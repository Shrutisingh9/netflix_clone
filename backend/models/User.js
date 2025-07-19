const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  id: Number,
  title: String,
  poster_path: String,
  backdrop_path: String,
  overview: String,
  vote_average: Number,
}, { _id: false });

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatarUrl: { type: String, required: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  myList: { type: [movieSchema], default: [] },
  profiles: { type: [profileSchema], default: [] },
});

module.exports = mongoose.model('User', userSchema); 