// In project-details.js or a separate discussion.js file
document.addEventListener('DOMContentLoaded', function() {
    // Get project ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (!projectId) {
      console.error('Project ID not found in URL');
      return;
    }
    
    // Get user info from localStorage
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (!userId || !username) {
      console.warn('User not logged in, discussion features will be limited');
      // Handle non-logged in user UI adjustments
      document.getElementById('new-post-btn')?.classList.add('d-none');
    }
    
    // DOM elements
    const postsContainer = document.getElementById('posts-container');
    const postsLoading = document.getElementById('posts-loading');
    const noPostsMessage = document.getElementById('no-posts-message');
    const newPostBtn = document.getElementById('new-post-btn');
    const postFormContainer = document.getElementById('post-form-container');
    const newPostForm = document.getElementById('new-post-form');
    const cancelPostBtn = document.getElementById('cancel-post-btn');
    
    // Event listeners
    if (newPostBtn) {
      newPostBtn.addEventListener('click', showPostForm);
    }
    
    if (cancelPostBtn) {
      cancelPostBtn.addEventListener('click', hidePostForm);
    }
    
    if (newPostForm) {
      newPostForm.addEventListener('submit', handlePostSubmit);
    }
    
    // Load posts when discussion tab is clicked
    document.getElementById('discussion-tab').addEventListener('click', function() {
      loadPosts();
    });
    
    // Functions
    function showPostForm() {
      postFormContainer.style.display = 'block';
      document.getElementById('post-title').focus();
    }
    
    function hidePostForm() {
      postFormContainer.style.display = 'none';
      newPostForm.reset();
    }
    
    async function loadPosts() {
      try {
        postsContainer.innerHTML = '';
        postsLoading.style.display = 'block';
        noPostsMessage.style.display = 'none';
        
        const response = await fetch(`/api/posts/project/${projectId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load posts');
        }
        
        const data = await response.json();
        
        postsLoading.style.display = 'none';
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to load posts');
        }
        
        if (data.posts.length === 0) {
          noPostsMessage.style.display = 'block';
          return;
        }
        
        // Render posts
        data.posts.forEach(post => {
          postsContainer.appendChild(createPostElement(post));
        });
      } catch (error) {
        console.error('Error loading posts:', error);
        postsLoading.style.display = 'none';
        postsContainer.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Error loading discussions: ${error.message}
          </div>
        `;
      }
    }
    
    async function handlePostSubmit(e) {
      e.preventDefault();
      
      const titleInput = document.getElementById('post-title');
      const contentInput = document.getElementById('post-content');
      
      const title = titleInput.value.trim();
      const content = contentInput.value.trim();
      
      if (!title || !content) {
        alert('Please fill in all fields');
        return;
      }
      
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            projectId,
            title,
            content,
            userId,
            username
          })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to create post');
        }
        
        // Reset form and hide it
        hidePostForm();
        
        // Reload posts
        loadPosts();
        
        // Show success message
        showAlert('success', 'Post created successfully');
      } catch (error) {
        console.error('Error creating post:', error);
        showAlert('danger', `Error: ${error.message}`);
      }
    }
    
    async function handleReplySubmit(postId, form) {
      const contentInput = form.querySelector('.reply-content');
      const content = contentInput.value.trim();
      
      if (!content) {
        alert('Please enter a reply');
        return;
      }
      
      try {
        const response = await fetch(`/api/posts/${postId}/replies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content,
            userId,
            username
          })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to add reply');
        }
        
        // Reset and hide form
        contentInput.value = '';
        form.style.display = 'none';
        
        // Reload posts to show new reply
        loadPosts();
        
        // Show success message
        showAlert('success', 'Reply added successfully');
      } catch (error) {
        console.error('Error adding reply:', error);
        showAlert('danger', `Error: ${error.message}`);
      }
    }
    
    function createPostElement(post) {
      const postElement = document.createElement('div');
      postElement.className = 'card post-card mb-4';
      postElement.dataset.postId = post._id;
      
      // Format date
      const postDate = new Date(post.createdAt);
      const formattedDate = postDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      postElement.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${escapeHtml(post.title)}</h5>
          <div class="post-meta text-muted mb-3">
            <span class="post-author">${escapeHtml(post.authorName)}</span>
            <span class="post-date ms-2">${formattedDate}</span>
          </div>
          <div class="post-content">
            ${formatContent(post.content)}
          </div>
          
          <hr class="my-3">
          
          <div class="post-actions">
            <button class="btn btn-sm btn-outline-primary reply-btn" data-post-id="${post._id}">
              <i class="bi bi-reply"></i> Reply
            </button>
            ${post.author === userId ? `
              <button class="btn btn-sm btn-outline-danger float-end delete-post-btn" data-post-id="${post._id}">
                <i class="bi bi-trash"></i> Delete
              </button>
            ` : ''}
          </div>
          
          <!-- Reply form -->
          <div class="reply-form-container mt-3" style="display: none;">
            <form class="reply-form" data-post-id="${post._id}">
              <div class="mb-3">
                <textarea class="form-control reply-content" rows="2" placeholder="Write your reply..." required></textarea>
              </div>
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-sm btn-secondary me-2 cancel-reply-btn">Cancel</button>
                <button type="submit" class="btn btn-sm btn-primary">Submit Reply</button>
              </div>
            </form>
          </div>
          
          <!-- Replies -->
          <div class="replies-container mt-4">
            ${post.replies.length > 0 ? `
              <h6 class="replies-header mb-3">
                <i class="bi bi-chat-square-text"></i> 
                ${post.replies.length} ${post.replies.length === 1 ? 'Reply' : 'Replies'}
              </h6>
              <div class="replies-list">
                ${post.replies.map(reply => createReplyHtml(reply, post._id)).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
      
      // Add event listeners
      const replyBtn = postElement.querySelector('.reply-btn');
      const deleteBtn = postElement.querySelector('.delete-post-btn');
      const replyForm = postElement.querySelector('.reply-form');
      const cancelReplyBtn = postElement.querySelector('.cancel-reply-btn');
      
      if (replyBtn) {
        replyBtn.addEventListener('click', function() {
          // Show reply form
          const formContainer = this.closest('.card-body').querySelector('.reply-form-container');
          formContainer.style.display = 'block';
          formContainer.querySelector('textarea').focus();
        });
      }
      
      if (cancelReplyBtn) {
        cancelReplyBtn.addEventListener('click', function() {
          // Hide reply form
          const formContainer = this.closest('.reply-form-container');
          formContainer.style.display = 'none';
          formContainer.querySelector('textarea').value = '';
        });
      }
      
      if (replyForm) {
        replyForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const postId = this.dataset.postId;
          handleReplySubmit(postId, this);
        });
      }
      
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async function() {
          if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            const postId = this.dataset.postId;
            try {
              const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  userId
                })
              });
              
              const data = await response.json();
              
              if (!data.success) {
                throw new Error(data.message || 'Failed to delete post');
              }
              
              // Remove post from UI
              const postElement = document.querySelector(`.post-card[data-post-id="${postId}"]`);
              postElement.remove();
              
              // Show success message
              showAlert('success', 'Post deleted successfully');
              
              // Reload posts to ensure UI is up-to-date
              loadPosts();
            } catch (error) {
              console.error('Error deleting post:', error);
              showAlert('danger', `Error: ${error.message}`);
            }
          }
        });
      }
      
      return postElement;
    }
    
    function createReplyHtml(reply, postId) {
      // Format date
      const replyDate = new Date(reply.createdAt);
      const formattedDate = replyDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return `
        <div class="reply-item" data-reply-id="${reply._id}">
          <div class="reply-header d-flex justify-content-between">
            <div class="reply-meta">
              <span class="reply-author fw-semibold">${escapeHtml(reply.authorName)}</span>
              <span class="reply-date text-muted ms-2 small">${formattedDate}</span>
            </div>
            ${reply.author === userId ? `
              <button class="btn btn-sm btn-link text-danger p-0 delete-reply-btn" 
                      data-post-id="${postId}" data-reply-id="${reply._id}">
                <i class="bi bi-x-circle"></i>
              </button>
            ` : ''}
          </div>
          <div class="reply-content mt-1">
            ${formatContent(reply.content)}
          </div>
          <hr class="my-3">
        </div>
      `;
    }
    
    // Bind delete reply buttons after rendering
    function bindReplyDeleteButtons() {
      document.querySelectorAll('.delete-reply-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
          if (confirm('Are you sure you want to delete this reply?')) {
            const postId = this.dataset.postId;
            const replyId = this.dataset.replyId;
            
            try {
              const response = await fetch(`/api/posts/${postId}/replies/${replyId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  userId
                })
              });
              
              const data = await response.json();
              
              if (!data.success) {
                throw new Error(data.message || 'Failed to delete reply');
              }
              
              // Reload posts to ensure UI is up-to-date
              loadPosts();
              
              // Show success message
              showAlert('success', 'Reply deleted successfully');
            } catch (error) {
              console.error('Error deleting reply:', error);
              showAlert('danger', `Error: ${error.message}`);
            }
          }
        });
      });
    }
    
    // Helper functions
    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
    
    function formatContent(content) {
      // Basic formatting: replace newlines with <br> tags
      return escapeHtml(content).replace(/\n/g, '<br>');
    }
    
    function showAlert(type, message) {
      const alertElement = document.createElement('div');
      alertElement.className = `alert alert-${type} alert-dismissible fade show`;
      alertElement.role = 'alert';
      alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      
      // Insert at the top of the discussion container
      const discussionContainer = document.querySelector('.discussion-container');
      discussionContainer.insertBefore(alertElement, discussionContainer.firstChild);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        alertElement.remove();
      }, 5000);
    }
    
    // Observer to bind delete reply buttons when posts are loaded
    const postsObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          bindReplyDeleteButtons();
        }
      });
    });
    
    postsObserver.observe(postsContainer, { childList: true });
  });