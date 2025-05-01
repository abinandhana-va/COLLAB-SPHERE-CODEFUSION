// client-auth.js - This is the frontend JavaScript for handling auth
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Send login request to server
        fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
          if (data.userId) {
            // Store user data in localStorage consistently
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('username', data.username || email.split('@')[0]);
            
            // Redirect to dashboard with explicit path
            console.log("Login successful, redirecting to dashboard");
            window.location.href = '/dashboard.html';
          } else {
            // Handle login error
            console.error("Login failed:", data.message);
            const errorElement = document.getElementById('login-error');
            if (errorElement) {
              errorElement.textContent = data.message || 'Invalid email or password';
              errorElement.style.display = 'block';
            }
          }
        })
        .catch(error => {
          console.error('Login error:', error);
          const errorElement = document.getElementById('login-error');
          if (errorElement) {
            errorElement.textContent = 'An error occurred. Please try again.';
            errorElement.style.display = 'block';
          }
        });
      });
    }
  });