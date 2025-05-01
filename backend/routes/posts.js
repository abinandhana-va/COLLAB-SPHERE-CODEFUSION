
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/project/:projectId', postController.getPostsByProject);


router.post('/', postController.createPost);


router.get('/:postId', postController.getPostById);


router.post('/:postId/replies', postController.addReply);

router.delete('/:postId', postController.deletePost);

router.delete('/:postId/replies/:replyId', postController.deleteReply);

module.exports = router;