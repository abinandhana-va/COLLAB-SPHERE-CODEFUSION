const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  creator: {
    type: String,  // Changed to String for simplified version
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  field: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  maxContributors: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  languagesNeeded: {
    type: [String],
    required: true
  },
  technologiesNeeded: {
    type: [String]
  },
  prerequisites: {
    type: String
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Open'
  },
  contributors: [{
    user: {
      type: String  // Changed to String for simplified version
    },
    role: String,
    status: {
      type: String,
      enum: ['Applied', 'Accepted', 'Rejected', 'Left'],
      default: 'Applied'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  collaborationTools: {
    type: [String]
  },
  goals: {
    type: [String]
  },
  requirements: {
    type: String
  },
  deadline: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', ProjectSchema);