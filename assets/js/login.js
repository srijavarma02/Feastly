'use strict';

const BACKEND_BASE = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  ? 'http://localhost:5000'
  : 'https://kateringking-backend.onrender.com';

const form     = document.getElementById('login-form');
const errorBox = document.getElementById('login-error');
const btn      = document.getElementById('login-btn');

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.add('visible');
}
function clearError() {
  errorBox.textContent = '';
  errorBox.classList.remove('visible');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const email    = form.email.value.trim();
  const password = form.password.value;

  if (!email || !password) {
    showError('Please enter your email and password.');
    return;
  }

  btn.disabled     = true;
  btn.textContent  = 'Logging in…';

  try {
    const res  = await fetch(`${BACKEND_BASE}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password })
    });
    const json = await res.json();

    if (res.ok && json.success) {
      // Store JWT and user info
      localStorage.setItem('kk_token', json.token);
      localStorage.setItem('kk_role',  json.user.role);
      localStorage.setItem('kk_email', json.user.email);

      // Redirect based on role
      if (json.user.role === 'manager') {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    } else {
      showError(json.error || 'Invalid credentials. Please try again.');
      btn.disabled    = false;
      btn.textContent = 'Login';
    }
  } catch (_err) {
    showError('Unable to connect to server. Please try again.');
    btn.disabled    = false;
    btn.textContent = 'Login';
  }
});
