// frontend/assets/js/auth.js

// API URL - Update this with your backend URL
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  successMessage.style.display = 'none';
  
  // Hide error after 5 seconds
  setTimeout(() => {
    errorMessage.style.display = 'none';
  }, 5000);
}

// Show success message
function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  errorMessage.style.display = 'none';
}

// Handle login form submission
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important for cookies/sessions
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      showSuccess('Login successful! Redirecting...');
      
      // Store user info in localStorage (optional)
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1000);
      
    } catch (error) {
      showError(error.message);
    }
  });
}

// Handle signup form submission
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Check if passwords match
    if (password !== confirmPassword) {
      return showError('Passwords do not match');
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include' // Important for cookies/sessions
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      showSuccess('Account created successfully! Redirecting to login...');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      
    } catch (error) {
      showError(error.message);
    }
  });
}

// Check if user is already logged in
async function checkAuthStatus() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      // If we're on a login or signup page and already logged in, redirect to dashboard
      const currentPage = window.location.pathname;
      if (currentPage.includes('login.html') || currentPage.includes('signup.html')) {
        window.location.href = '../index.html';
      }
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
}

// Check auth status when page loads
document.addEventListener('DOMContentLoaded', checkAuthStatus);