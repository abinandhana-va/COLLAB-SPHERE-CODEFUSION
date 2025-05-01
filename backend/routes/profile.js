const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');

// Create or update profile
router.post('/', async (req, res) => {
  try {
    console.log('Creating/updating profile:', req.body);
    const { userId, name, bio, skills, location, social } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if profile exists
    let profile = await Profile.findOne({ user: userId });
    
    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: userId },
        { $set: { name, bio, skills, location, social } },
        { new: true }
      );
    } else {
      // Create new profile
      profile = new Profile({
        user: userId,
        name,
        bio,
        skills: skills || [],
        location,
        social: social || {}
      });
      
      await profile.save();
    }
    
    console.log('Profile created/updated successfully:', profile._id);
    res.json(profile);
  } catch (error) {
    console.error('Profile creation/update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get profile by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;