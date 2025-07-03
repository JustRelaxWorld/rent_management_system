// API URL
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchToRegisterLink = document.getElementById('switchToRegister');
const switchToLoginLink = document.getElementById('switchToLogin');

// Event Listeners
if (loginForm) {
  loginForm.addEventListener('submit', login);
}

if (registerForm) {
  registerForm.addEventListener('submit', register);
}

if (switchToRegisterLink) {
  switchToRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('register');
  });
}

if (switchToLoginLink) {
  switchToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('login');
  });
}

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (token && user) {
    // Update UI for logged in user
    updateNavigation(true);
    document.getElementById('userName').textContent = user.name;
    return true;
  } else {
    // Update UI for guest
    updateNavigation(false);
    return false;
  }
}

// Update navigation based on authentication status
function updateNavigation(isLoggedIn) {
  const dashboardLink = document.getElementById('dashboardLink');
  const loginLink = document.getElementById('loginLink');
  const registerLink = document.getElementById('registerLink');
  const logoutLink = document.getElementById('logoutLink');

  if (isLoggedIn) {
    dashboardLink.style.display = 'block';
    loginLink.style.display = 'none';
    registerLink.style.display = 'none';
    logoutLink.style.display = 'block';
  } else {
    dashboardLink.style.display = 'none';
    loginLink.style.display = 'block';
    registerLink.style.display = 'block';
    logoutLink.style.display = 'none';
  }
}

// Login function
async function login(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Save token and user data to local storage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Show success notification
    showNotification('Login successful!', 'success');

    // Redirect to dashboard
    setTimeout(() => {
      checkAuth();
      showSection('dashboard');
    }, 1000);

  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Register function
async function register(e) {
  e.preventDefault();

  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const role = document.getElementById('registerRole').value;

  // Validate password
  if (password.length < 6) {
    return showNotification('Password must be at least 6 characters', 'error');
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Save token and user data to local storage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Show success notification
    showNotification('Registration successful!', 'success');

    // Redirect to dashboard
    setTimeout(() => {
      checkAuth();
      showSection('dashboard');
    }, 1000);

  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  checkAuth();
  showSection('home');
  showNotification('Logged out successfully', 'success');
}

// Show notification
function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type} show`;

  setTimeout(() => {
    notification.className = 'notification';
  }, 3000);
} 