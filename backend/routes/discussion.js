const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');

// Get discussions for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const discussions = await Discussion.find({ project: req.params.projectId })
      .sort({ createdAt: -1 });
    res.json(discussions);
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// More discussion routes will be added later

module.exports = router;