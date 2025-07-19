const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Register
router.post('/register', async (req, res) => {
  const { fullName, username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a default profile
    const defaultProfile = {
      name: fullName || username,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || username)}&background=222&color=fff&size=128`
    };
    const user = new User({ fullName, username, email, password: hashedPassword, profiles: [defaultProfile] });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', fullName, username, email });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Handle users without fullName (migrate old users)
    if (!user.fullName && user.username) {
      user.fullName = user.username;
      await user.save();
    }
    
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('Login response:', {
      email: user.email,
      fullName: user.fullName || user.username,
      username: user.username
    });
    
    res.json({ 
      token, 
      email: user.email, 
      fullName: user.fullName || user.username, 
      username: user.username 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { fullName, username, password } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ error: 'Username already taken' });
      user.username = username;
    }
    if (fullName) user.fullName = fullName;
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ fullName: user.fullName, username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Get current user details
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Handle users without fullName (migrate old users)
    if (!user.fullName && user.username) {
      user.fullName = user.username;
      await user.save();
    }
    
    res.json({
      fullName: user.fullName || user.username,
      username: user.username,
      email: user.email,
      myList: user.myList || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// --- My List Endpoints ---

// Get user's list
router.get('/mylist', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.myList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

// Add to list
router.post('/mylist', authMiddleware, async (req, res) => {
  const movie = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.myList.some(m => m.id === movie.id)) {
      return res.status(400).json({ error: 'Movie already in list' });
    }
    user.myList.push(movie);
    await user.save();
    res.json(user.myList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to list' });
  }
});

// Remove from list
router.delete('/mylist/:movieId', authMiddleware, async (req, res) => {
  const movieId = parseInt(req.params.movieId);
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.myList = user.myList.filter(m => m.id !== movieId);
    await user.save();
    res.json(user.myList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from list' });
  }
});

// Get all profiles for the logged-in user
router.get('/profiles', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.profiles || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Add a new profile for the logged-in user
router.post('/profiles', authMiddleware, async (req, res) => {
  const { name, avatarUrl } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.profiles.some(p => p.name === name)) {
      return res.status(400).json({ error: 'Profile name already exists' });
    }
    // Prevent adding a profile with the same name as the main profile
    if (user.profiles.length > 0 && user.profiles[0].name === name) {
      return res.status(400).json({ error: 'Cannot use the main profile name' });
    }
    user.profiles.push({ name, avatarUrl });
    await user.save();
    res.json(user.profiles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add profile' });
  }
});

// Edit a profile for the logged-in user
router.put('/profiles/:profileName', authMiddleware, async (req, res) => {
  const { profileName } = req.params;
  const { name, avatarUrl } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const profile = user.profiles.find(p => p.name === profileName);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    if (name && name !== profileName && user.profiles.some(p => p.name === name)) {
      return res.status(400).json({ error: 'Profile name already exists' });
    }
    if (name) profile.name = name;
    if (avatarUrl) profile.avatarUrl = avatarUrl;
    await user.save();
    res.json(user.profiles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit profile' });
  }
});

// Delete a profile for the logged-in user
router.delete('/profiles/:profileName', authMiddleware, async (req, res) => {
  const { profileName } = req.params;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Prevent deleting the main profile (first profile)
    if (user.profiles.length > 0 && user.profiles[0].name === profileName) {
      return res.status(400).json({ error: 'Cannot delete the main profile' });
    }
    user.profiles = user.profiles.filter(p => p.name !== profileName);
    await user.save();
    res.json(user.profiles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

module.exports = router; 