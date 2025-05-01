document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the signup page
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Check if we're on the login page
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Handle signup form submission
    async function handleSignup(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        
        try {
            // Show loading state
            Swal.fire({
                title: 'Creating account...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    role
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Registration successful
                // Store user data in localStorage
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userRole', data.role);
                
                // Show success message and redirect
                Swal.fire({
                    icon: 'success',
                    title: 'Registration Successful!',
                    text: 'Welcome to Collab Sphere!',
                    showConfirmButton: true,
                    confirmButtonText: 'Continue to Profile'
                }).then(() => {
                    // Redirect to profile creation page
                    window.location.href = 'profile.html';
                });
            } else {
                // Registration failed
                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: data.message || 'Something went wrong. Please try again.'
                });
            }
        } catch (error) {
            console.error('Error during registration:', error);
            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: 'Network or server error. Please try again later.'
            });
        }
    }
    
    // Handle login form submission
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            // Show loading state
            Swal.fire({
                title: 'Logging in...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Login successful
                // Store user data in localStorage
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('username', data.username);
                localStorage.setItem('userRole', data.role);
                
                // Check if the user has a profile already
                const profileResponse = await fetch(`http://localhost:5000/api/profile/${data.userId}`);
                
                if (profileResponse.ok) {
                    // User has profile, redirect to dashboard
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful!',
                        text: `Welcome back, ${data.username}!`,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = 'dashboard.html';
                    });
                } else {
                    // User needs to create profile
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful!',
                        text: 'Please complete your profile to continue.',
                        showConfirmButton: true,
                        confirmButtonText: 'Create Profile'
                    }).then(() => {
                        window.location.href = 'profile.html';
                    });
                }
            } else {
                // Login failed
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: data.message || 'Invalid credentials'
                });
            }
        } catch (error) {
            console.error('Error during login:', error);
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Network or server error. Please try again later.'
            });
        }
    }
});