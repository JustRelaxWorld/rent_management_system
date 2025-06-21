// DOM Elements
const homeLink = document.getElementById('homeLink');
const dashboardLink = document.getElementById('dashboardLink');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const logoutLink = document.getElementById('logoutLink');
const getStartedBtn = document.getElementById('getStartedBtn');
const learnMoreBtn = document.getElementById('learnMoreBtn');

// Sections
const sections = {
  home: document.getElementById('home'),
  login: document.getElementById('login'),
  register: document.getElementById('register'),
  dashboard: document.getElementById('dashboard')
};

// Event Listeners
document.addEventListener('DOMContentLoaded', init);

if (homeLink) {
  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('home');
  });
}

if (dashboardLink) {
  dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (checkAuth()) {
      showSection('dashboard');
    } else {
      showSection('login');
      showNotification('Please login to access the dashboard', 'error');
    }
  });
}

if (loginLink) {
  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('login');
  });
}

if (registerLink) {
  registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection('register');
  });
}

if (logoutLink) {
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

if (getStartedBtn) {
  getStartedBtn.addEventListener('click', () => {
    if (checkAuth()) {
      showSection('dashboard');
    } else {
      showSection('register');
    }
  });
}

if (learnMoreBtn) {
  learnMoreBtn.addEventListener('click', () => {
    window.scrollTo({
      top: document.querySelector('.features').offsetTop - 100,
      behavior: 'smooth'
    });
  });
}

// Mobile Navigation
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links li');

if (burger) {
  burger.addEventListener('click', () => {
    // Toggle Nav
    navLinks.classList.toggle('nav-active');

    // Animate Links
    navLinksItems.forEach((link, index) => {
      if (link.style.animation) {
        link.style.animation = '';
      } else {
        link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
      }
    });

    // Burger Animation
    burger.classList.toggle('toggle');
  });
}

// Initialize Application
function init() {
  // Check authentication status
  const isLoggedIn = checkAuth();

  // Show appropriate section based on auth status
  if (isLoggedIn) {
    showSection('dashboard');
    loadDashboardData();
  } else {
    showSection('home');
  }
}

// Show section and hide others
function showSection(sectionId) {
  Object.keys(sections).forEach(key => {
    if (sections[key]) {
      if (key === sectionId) {
        sections[key].classList.add('active');
      } else {
        sections[key].classList.remove('active');
      }
    }
  });
}

// Load dashboard data
async function loadDashboardData() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return;
  }

  try {
    // Here you would fetch data from your API endpoints
    // This is a placeholder for demonstration purposes
    
    // Example: Fetch user data
    // const response = await fetch(`${API_URL}/auth/me`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   }
    // });
    // const data = await response.json();
    
    // For now, we'll just use mock data
    const mockProperties = [
      { id: 1, name: 'Sunset Apartments', address: '123 Main St', units: 24 },
      { id: 2, name: 'Ocean View Condos', address: '456 Beach Rd', units: 12 }
    ];
    
    const mockPayments = [
      { id: 1, amount: 1200, date: '2023-06-01', status: 'Paid' },
      { id: 2, amount: 1200, date: '2023-07-01', status: 'Pending' }
    ];
    
    const mockMaintenance = [
      { id: 1, issue: 'Leaking faucet', status: 'In Progress', date: '2023-06-15' },
      { id: 2, issue: 'AC not working', status: 'Completed', date: '2023-06-10' }
    ];
    
    // Update UI with data
    updatePropertiesUI(mockProperties);
    updatePaymentsUI(mockPayments);
    updateMaintenanceUI(mockMaintenance);
    
  } catch (error) {
    showNotification('Failed to load dashboard data', 'error');
  }
}

// Update Properties UI
function updatePropertiesUI(properties) {
  const container = document.getElementById('propertiesContainer');
  
  if (!container || !properties.length) {
    return;
  }
  
  container.innerHTML = properties.map(property => `
    <div class="dashboard-item">
      <h4>${property.name}</h4>
      <p>${property.address}</p>
      <p>Units: ${property.units}</p>
    </div>
  `).join('');
}

// Update Payments UI
function updatePaymentsUI(payments) {
  const container = document.getElementById('paymentsContainer');
  
  if (!container || !payments.length) {
    return;
  }
  
  container.innerHTML = payments.map(payment => `
    <div class="dashboard-item">
      <h4>$${payment.amount}</h4>
      <p>Date: ${payment.date}</p>
      <p>Status: <span class="status ${payment.status.toLowerCase()}">${payment.status}</span></p>
    </div>
  `).join('');
}

// Update Maintenance UI
function updateMaintenanceUI(maintenance) {
  const container = document.getElementById('maintenanceContainer');
  
  if (!container || !maintenance.length) {
    return;
  }
  
  container.innerHTML = maintenance.map(item => `
    <div class="dashboard-item">
      <h4>${item.issue}</h4>
      <p>Date: ${item.date}</p>
      <p>Status: <span class="status ${item.status.toLowerCase().replace(' ', '-')}">${item.status}</span></p>
    </div>
  `).join('');
} 