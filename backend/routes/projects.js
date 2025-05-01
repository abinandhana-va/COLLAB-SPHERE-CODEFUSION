const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Add this line to your routes file
router.get('/test/connection', projectController.testDatabaseConnection);
router.post('/direct', projectController.createProjectDirect); // Alternative method for creating projects
// Create a new project
router.post('/', projectController.createProject);

// Get all projects
router.get('/', projectController.getAllProjects);

// Get project by ID
router.get('/:id', projectController.getProjectById);

// Get projects created by a specific user
router.get('/creator/:userId', projectController.getProjectsByCreator);

// Update project
router.put('/:id', projectController.updateProject);

// Delete project
router.delete('/:id', projectController.deleteProject);

// Apply to a project
router.post('/:id/apply', projectController.applyToProject);

// Get projects a user has applied to or is contributing to
router.get('/user/:userId', projectController.getUserProjects);

module.exports = router;