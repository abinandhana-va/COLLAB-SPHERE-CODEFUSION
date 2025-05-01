const Project = require('../models/Project');
const mongoose = require('mongoose');





// Create a new project
exports.createProject = async (req, res) => {
  try {
    console.log('Creating project with data:', req.body);
    
    // Only destructure if req.body exists
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Request body is missing'
      });
    }
    
    const {
      userId,
      title,
      description,
      field,
      category,
      maxContributors,
      difficulty,
      duration,
      languagesNeeded,
      technologiesNeeded,
      prerequisites,
      collaborationTools,
      goals,
      requirements,
      deadline
    } = req.body;
    
    console.log('Extracted userId:', userId);
    
    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }
    
    // Create a new project with proper data processing
    const newProject = new Project({
      creator: userId,
      title,
      description,
      field: field || 'Other',
      category: category || 'Other',
      maxContributors: parseInt(maxContributors) || 5,
      difficulty: difficulty || 'Intermediate',
      duration: duration || '2-4 weeks',
      languagesNeeded: typeof languagesNeeded === 'string' ? 
        languagesNeeded.split(',').map(lang => lang.trim()) : 
        (Array.isArray(languagesNeeded) ? languagesNeeded : []),
      technologiesNeeded: typeof technologiesNeeded === 'string' ? 
        technologiesNeeded.split(',').map(tech => tech.trim()) : 
        (Array.isArray(technologiesNeeded) ? technologiesNeeded : []),
      prerequisites: prerequisites || '',
      collaborationTools: typeof collaborationTools === 'string' ? 
        collaborationTools.split(',').map(tool => tool.trim()) : 
        (Array.isArray(collaborationTools) ? collaborationTools : []),
      goals: typeof goals === 'string' ? 
        goals.split(',').map(goal => goal.trim()) : 
        (Array.isArray(goals) ? goals : []),
      requirements: requirements || '',
      deadline: deadline ? new Date(deadline) : null,
      status: 'Open',
      contributors: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Attempting to save project with data:', JSON.stringify(newProject, null, 2));
    
    try {
      const savedProject = await newProject.save();
      console.log('Project saved successfully with ID:', savedProject._id);
      
      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        project: savedProject
      });
    } catch (saveError) {
      console.error('Error during project save:', saveError);
      // Check for validation errors
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(saveError.errors).map(e => e.message)
        });
      }
      throw saveError;
    }
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Attempt to create project with direct MongoDB operations (fallback method)
exports.createProjectDirect = async (req, res) => {
  try {
    console.log('Attempting direct MongoDB insert');
    
    if (!req.body || !req.body.userId || !req.body.title || !req.body.description) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Process the project data
    const projectData = {
      creator: req.body.userId,
      title: req.body.title,
      description: req.body.description,
      field: req.body.field || 'Other',
      category: req.body.category || 'Other',
      maxContributors: parseInt(req.body.maxContributors) || 5,
      difficulty: req.body.difficulty || 'Intermediate',
      duration: req.body.duration || '2-4 weeks',
      languagesNeeded: typeof req.body.languagesNeeded === 'string' ? 
        req.body.languagesNeeded.split(',').map(lang => lang.trim()) : 
        (Array.isArray(req.body.languagesNeeded) ? req.body.languagesNeeded : []),
      technologiesNeeded: typeof req.body.technologiesNeeded === 'string' ? 
        req.body.technologiesNeeded.split(',').map(tech => tech.trim()) : 
        (Array.isArray(req.body.technologiesNeeded) ? req.body.technologiesNeeded : []),
      prerequisites: req.body.prerequisites || '',
      collaborationTools: typeof req.body.collaborationTools === 'string' ? 
        req.body.collaborationTools.split(',').map(tool => tool.trim()) : 
        (Array.isArray(req.body.collaborationTools) ? req.body.collaborationTools : []),
      goals: typeof req.body.goals === 'string' ? 
        req.body.goals.split(',').map(goal => goal.trim()) : 
        (Array.isArray(req.body.goals) ? req.body.goals : []),
      requirements: req.body.requirements || '',
      deadline: req.body.deadline ? new Date(req.body.deadline) : null,
      status: 'Open',
      contributors: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Get direct collection access
    const db = mongoose.connection.db;
    const projectsCollection = db.collection('projects');
    
    const result = await projectsCollection.insertOne(projectData);
    
    if (result.acknowledged && result.insertedId) {
      console.log('Direct MongoDB insert successful, ID:', result.insertedId);
      res.status(201).json({
        success: true,
        message: 'Project created successfully via direct MongoDB operation',
        project: { _id: result.insertedId, ...projectData }
      });
    } else {
      throw new Error('MongoDB insert operation not acknowledged');
    }
  } catch (error) {
    console.error('Error in direct MongoDB operation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during direct MongoDB operation',
      error: error.message
    });
  }
};

// Get all projects with debugging
exports.getAllProjects = async (req, res) => {
  try {
    console.log('Getting all projects...');
    
    const projects = await Project.find().sort({ createdAt: -1 });
    
    console.log(`Found ${projects.length} projects in database`);
    if (projects.length > 0) {
      console.log('First project sample:', JSON.stringify(projects[0], null, 2));
    } else {
      console.log('No projects found in database');
      
      // If no projects found, try direct MongoDB check
      try {
        const db = mongoose.connection.db;
        const projectsCollection = db.collection('projects');
        const count = await projectsCollection.countDocuments();
        console.log(`Direct MongoDB query found ${count} projects`);
      } catch (dbError) {
        console.error('Error checking MongoDB directly:', dbError);
      }
    }

    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    console.log('Getting project with ID:', req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid project ID format'
      });
    }
    
    const project = await Project.findById(req.params.id);

    if (!project) {
      console.log('Project not found with ID:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    console.log('Found project:', project.title);
    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get projects by creator
exports.getProjectsByCreator = async (req, res) => {
  try {
    console.log('Getting projects for creator:', req.params.userId);
    
    const projects = await Project.find({ creator: req.params.userId })
      .sort({ createdAt: -1 });

    console.log(`Found ${projects.length} projects created by ${req.params.userId}`);

    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error('Error fetching projects by creator:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    console.log('Updating project with ID:', req.params.id);
    console.log('Update data:', req.body);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid project ID format'
      });
    }
    
    const project = await Project.findById(req.params.id);

    if (!project) {
      console.log('Project not found for update, ID:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Process and prepare update fields
    const updatedFields = { ...req.body, updatedAt: new Date() };
    
    // Process array fields if they come as strings
    if (typeof updatedFields.languagesNeeded === 'string') {
      updatedFields.languagesNeeded = updatedFields.languagesNeeded.split(',').map(lang => lang.trim());
    }
    
    if (typeof updatedFields.technologiesNeeded === 'string') {
      updatedFields.technologiesNeeded = updatedFields.technologiesNeeded.split(',').map(tech => tech.trim());
    }
    
    if (typeof updatedFields.collaborationTools === 'string') {
      updatedFields.collaborationTools = updatedFields.collaborationTools.split(',').map(tool => tool.trim());
    }
    
    if (typeof updatedFields.goals === 'string') {
      updatedFields.goals = updatedFields.goals.split(',').map(goal => goal.trim());
    }
    
    // Convert maxContributors to number if it's a string
    if (typeof updatedFields.maxContributors === 'string') {
      updatedFields.maxContributors = parseInt(updatedFields.maxContributors) || 5;
    }
    
    // Convert deadline to Date if it's a string
    if (typeof updatedFields.deadline === 'string') {
      updatedFields.deadline = new Date(updatedFields.deadline);
    }

    console.log('Processed update fields:', updatedFields);

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    console.log('Project updated successfully:', updatedProject._id);

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    console.log('Deleting project with ID:', req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid project ID format'
      });
    }
    
    const project = await Project.findById(req.params.id);

    if (!project) {
      console.log('Project not found for deletion, ID:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    await Project.findByIdAndDelete(req.params.id);
    console.log('Project deleted successfully:', req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Apply to a project
exports.applyToProject = async (req, res) => {
  try {
    console.log('Applying to project with ID:', req.params.id);
    console.log('Application data:', req.body);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid project ID format'
      });
    }
    
    if (!req.body.userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required'
      });
    }
    
    const { userId, role } = req.body;
    
    const project = await Project.findById(req.params.id);

    if (!project) {
      console.log('Project not found for application, ID:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Initialize contributors array if it doesn't exist
    if (!project.contributors) {
      project.contributors = [];
    }

    // Check if user is already a contributor
    if (project.contributors.some(contributor => contributor.user === userId)) {
      console.log('User already applied to project:', userId);
      return res.status(400).json({ 
        success: false, 
        message: 'You have already applied to this project' 
      });
    }

    // Add user as a contributor with 'Applied' status
    project.contributors.push({
      user: userId,
      role: role || 'Contributor',
      status: 'Applied',
      appliedAt: new Date()
    });

    console.log('Saving project with new application from user:', userId);
    await project.save();
    console.log('Application saved successfully');

    res.json({
      success: true,
      message: 'Successfully applied to project'
    });
  } catch (error) {
    console.error('Error applying to project:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get projects a user has applied to or is contributing to
exports.getUserProjects = async (req, res) => {
  try {
    console.log('Getting projects for user:', req.params.userId);
    
    // Find projects where user is a contributor
    const projects = await Project.find({
      "contributors.user": req.params.userId
    }).sort({ createdAt: -1 });

    console.log(`Found ${projects.length} projects for user ${req.params.userId}`);

    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add this to your routes file
exports.testDatabaseConnection = async (req, res) => {
  try {
    console.log('Testing database connection...');
    console.log('Connection state:', mongoose.connection.readyState);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    const connectionStatus = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
    
    // Try to create a test project
    const testProject = new Project({
      creator: 'test-user-' + Date.now(),
      title: 'Test Connection Project',
      description: 'This is a test project to check database connectivity',
      field: 'Other',
      category: 'Test',
      status: 'Open',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    let testProjectId = null;
    let testSaveResult = null;
    
    try {
      const savedProject = await testProject.save();
      testProjectId = savedProject._id;
      testSaveResult = 'Success';
      console.log('Test project saved with ID:', testProjectId);
      
      // Clean up test project
      await Project.findByIdAndDelete(testProjectId);
      console.log('Test project cleaned up successfully');
    } catch (saveError) {
      console.error('Test project save failed:', saveError);
      testSaveResult = 'Failed: ' + saveError.message;
    }
    
    // Get collection stats
    let collections = [];
    let projectsCount = 0;
    
    try {
      collections = await mongoose.connection.db.listCollections().toArray();
      projectsCount = await Project.countDocuments();
    } catch (statsError) {
      console.error('Error getting database stats:', statsError);
    }
    
    res.json({
      success: true,
      connection: {
        state: mongoose.connection.readyState,
        status: connectionStatus[mongoose.connection.readyState] || 'Unknown',
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        port: mongoose.connection.port
      },
      test: {
        saveResult: testSaveResult,
        testProjectId: testProjectId
      },
      database: {
        collections: collections.map(c => c.name),
        projectsCount
      }
    });
  } catch (error) {
    console.error('Error testing database connection:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection test failed',
      error: error.message
    });
  }
};


// controllers/postController.js
const Post = require('../models/Post');


// Get all posts for a project
exports.getPostsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid project ID format'
      });
    }
    
    // Check if project exists
    const projectExists = await Project.exists({ _id: projectId });
    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const posts = await Post.find({ projectId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { projectId, title, content, userId, username } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid project ID format'
      });
    }
    
    if (!title || !content || !userId || !username) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Check if project exists
    const projectExists = await Project.exists({ _id: projectId });
    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const newPost = new Post({
      projectId,
      author: userId,
      authorName: username,
      title,
      content,
      replies: []
    });
    
    const savedPost = await newPost.save();
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: savedPost
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid post ID format'
      });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add a reply to a post
exports.addReply = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, userId, username } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid post ID format'
      });
    }
    
    if (!content || !userId || !username) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const newReply = {
      author: userId,
      authorName: username,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    post.replies.push(newReply);
    post.updatedAt = new Date();
    
    await post.save();
    
    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      reply: newReply
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid post ID format'
      });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user is the author of the post
    if (post.author !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }
    
    await Post.findByIdAndDelete(postId);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete a reply
exports.deleteReply = async (req, res) => {
  try {
    const { postId, replyId } = req.params;
    const { userId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(replyId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid ID format'
      });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Find the reply
    const reply = post.replies.id(replyId);
    
    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found'
      });
    }
    
    // Check if user is the author of the reply
    if (reply.author !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this reply'
      });
    }
    
    // Remove the reply
    reply.remove();
    post.updatedAt = new Date();
    
    await post.save();
    
    res.json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};