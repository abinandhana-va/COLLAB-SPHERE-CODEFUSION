const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Make sure to import bcrypt

// Define the schema first
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['contributor', 'creator'],
    default: 'contributor'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add the comparePassword method to the schema
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Compare the provided password with the hashed password in the database
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Create the model after defining the schema and its methods
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;