const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  bio: String,
  skills: [String],
  location: String,
  social: {
    twitter: String,
    linkedin: String,
    github: String,
    website: String
  },
  education: String,
  contactInfo: String,
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }]
});

module.exports = mongoose.model('Profile', ProfileSchema);