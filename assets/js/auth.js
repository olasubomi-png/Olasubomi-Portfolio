/* ============================================================
   Auth Pages — shared JS for login, register, forgot/reset
   ============================================================ */

'use strict';

// ── Toast system ──────────────────────────────────────────────────────────────

const toastContainer = (() => {
  let el = document.querySelector('.toast-container');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast-container';
    document.body.appendChild(el);
  }
  return el;
})();

function showToast(message, type = 'info', duration = 5000) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-msg">${message}</span>
    <button class="toast-close" aria-label="Close">✕</button>
  `;
  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
  toastContainer.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }
  return toast;
}

function removeToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(20px)';
  toast.style.transition = 'opacity .25s, transform .25s';
  setTimeout(() => toast.remove(), 260);
}

// ── Loading state ─────────────────────────────────────────────────────────────

function setLoading(btn, loading) {
  btn.disabled = loading;
  if (loading) {
    btn.classList.add('loading');
  } else {
    btn.classList.remove('loading');
  }
}

// ── Field validation display ──────────────────────────────────────────────────

function setFieldError(input, message) {
  input.classList.add('is-error');
  input.classList.remove('is-success');
  const err = input.closest('.form-group')?.querySelector('.field-error');
  if (err) { err.textContent = message; err.classList.add('visible'); }
}

function clearFieldError(input) {
  input.classList.remove('is-error');
  const err = input.closest('.form-group')?.querySelector('.field-error');
  if (err) { err.classList.remove('visible'); }
}

function setFieldSuccess(input) {
  input.classList.remove('is-error');
  input.classList.add('is-success');
  const err = input.closest('.form-group')?.querySelector('.field-error');
  if (err) err.classList.remove('visible');
}

// ── Password show/hide toggle ─────────────────────────────────────────────────

document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.closest('.input-wrap').querySelector('input');
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.textContent = isText ? '👁️' : '🙈';
  });
});

// ── Password strength ─────────────────────────────────────────────────────────

function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)                           score++;
  if (password.length >= 12)                          score++;
  if (/[A-Z]/.test(password))                         score++;
  if (/[a-z]/.test(password))                         score++;
  if (/[0-9]/.test(password))                         score++;
  if (/[^A-Za-z0-9]/.test(password))                  score++;

  const levels = [
    { label: 'Too weak',  color: '#ff5c72', pct: '15%'  },
    { label: 'Weak',      color: '#ff5c72', pct: '30%'  },
    { label: 'Fair',      color: '#ffc857', pct: '55%'  },
    { label: 'Good',      color: '#4facfe', pct: '75%'  },
    { label: 'Strong',    color: '#00e5a0', pct: '90%'  },
    { label: 'Very strong', color: '#00e5a0', pct: '100%' },
  ];

  return levels[Math.min(score, 5)];
}

const pwInput = document.querySelector('input[name="password"]');
const pwFill  = document.querySelector('.pw-strength-fill');
const pwText  = document.querySelector('.pw-strength-text');

if (pwInput && pwFill && pwText) {
  pwInput.addEventListener('input', () => {
    const { label, color, pct } = checkPasswordStrength(pwInput.value);
    pwFill.style.width = pwInput.value ? pct : '0';
    pwFill.style.background = color;
    pwText.textContent = pwInput.value ? label : '';
    pwText.style.color = color;
  });
}

// ── API helper ────────────────────────────────────────────────────────────────

async function apiCall(endpoint, method = 'POST', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };
  if (body) opts.body = JSON.stringify(body);

  const res  = await fetch(endpoint, opts);
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ── Auth state helpers ────────────────────────────────────────────────────────

async function getMe() {
  try {
    const { ok, data } = await apiCall('/api/auth/me', 'GET');
    return ok ? data.data.user : null;
  } catch {
    return null;
  }
}

async function tryRefresh() {
  try {
    const { ok } = await apiCall('/api/auth/refresh', 'POST');
    return ok;
  } catch {
    return false;
  }
}

// On auth pages: redirect to dashboard if already logged in
async function redirectIfLoggedIn() {
  const user = await getMe();
  if (user) {
    window.location.href = '/dashboard/';
  }
}

// On protected pages: redirect to login if not logged in
async function requireAuth() {
  let user = await getMe();
  if (!user) {
    // Try refreshing the token
    const refreshed = await tryRefresh();
    if (refreshed) {
      user = await getMe();
    }
  }
  if (!user) {
    window.location.href = '/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    return null;
  }
  return user;
}

// ── Server-side validation errors → field errors ──────────────────────────────

function applyServerErrors(errors = [], form) {
  errors.forEach(({ field, message }) => {
    const input = form?.querySelector(`[name="${field}"]`) || form?.querySelector(`[name="profile.${field}"]`);
    if (input) setFieldError(input, message);
  });
}

// ── LOGIN form ────────────────────────────────────────────────────────────────

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  redirectIfLoggedIn();

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn  = loginForm.querySelector('.btn-auth');
    const loginVal = loginForm.querySelector('[name="login"]').value.trim();
    const pwVal    = loginForm.querySelector('[name="password"]').value;

    if (!loginVal || !pwVal) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    setLoading(btn, true);
    try {
      const { ok, data } = await apiCall('/api/auth/login', 'POST', {
        login: loginVal,
        password: pwVal,
      });

      if (ok) {
        showToast('Login successful! Redirecting…', 'success', 2000);
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          window.location.href = params.get('redirect') || '/dashboard/';
        }, 800);
      } else {
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          showToast('Please verify your email first. <a href="/auth/verify-email.html">Resend link?</a>', 'warning', 8000);
        } else {
          showToast(data.message || 'Login failed.', 'error');
          applyServerErrors(data.errors, loginForm);
        }
      }
    } catch {
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setLoading(btn, false);
    }
  });
}

// ── REGISTER form ─────────────────────────────────────────────────────────────

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  redirectIfLoggedIn();

  // Real-time username validation
  const usernameInput = registerForm.querySelector('[name="username"]');
  if (usernameInput) {
    usernameInput.addEventListener('blur', () => {
      const val = usernameInput.value.trim();
      if (val && !/^[a-z0-9_-]{3,30}$/i.test(val)) {
        setFieldError(usernameInput, 'Only letters, numbers, hyphens and underscores (3–30 chars).');
      } else if (val) {
        clearFieldError(usernameInput);
      }
    });
  }

  // Confirm password
  const confirmInput = registerForm.querySelector('[name="confirmPassword"]');
  if (confirmInput) {
    confirmInput.addEventListener('input', () => {
      const pw = registerForm.querySelector('[name="password"]').value;
      if (confirmInput.value && confirmInput.value !== pw) {
        setFieldError(confirmInput, 'Passwords do not match.');
      } else {
        clearFieldError(confirmInput);
        if (confirmInput.value) setFieldSuccess(confirmInput);
      }
    });
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn  = registerForm.querySelector('.btn-auth');
    const fd   = new FormData(registerForm);
    const body = Object.fromEntries(fd);

    // Client-side validation
    let hasError = false;

    ['firstName', 'lastName', 'username', 'email', 'password'].forEach(f => {
      const input = registerForm.querySelector(`[name="${f}"]`);
      if (!body[f]?.trim()) {
        setFieldError(input, 'This field is required.');
        hasError = true;
      }
    });

    if (body.password && body.confirmPassword && body.password !== body.confirmPassword) {
      setFieldError(registerForm.querySelector('[name="confirmPassword"]'), 'Passwords do not match.');
      hasError = true;
    }

    const terms = registerForm.querySelector('[name="terms"]');
    if (terms && !terms.checked) {
      showToast('Please accept the terms and conditions.', 'warning');
      hasError = true;
    }

    if (hasError) return;

    setLoading(btn, true);
    try {
      const { ok, data } = await apiCall('/api/auth/register', 'POST', {
        firstName: body.firstName,
        lastName:  body.lastName,
        username:  body.username,
        email:     body.email,
        password:  body.password,
      });

      if (ok) {
        showToast(data.message, 'success', 0);
        registerForm.style.display = 'none';
        const success = document.getElementById('registerSuccess');
        if (success) success.style.display = 'block';
      } else {
        showToast(data.message || 'Registration failed.', 'error');
        applyServerErrors(data.errors || [], registerForm);
        if (data.field) {
          const input = registerForm.querySelector(`[name="${data.field}"]`);
          if (input) setFieldError(input, data.message);
        }
      }
    } catch {
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setLoading(btn, false);
    }
  });
}

// ── FORGOT PASSWORD form ──────────────────────────────────────────────────────

const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
  redirectIfLoggedIn();

  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn   = forgotForm.querySelector('.btn-auth');
    const email = forgotForm.querySelector('[name="email"]').value.trim();

    if (!email) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setLoading(btn, true);
    try {
      const { ok, data } = await apiCall('/api/auth/forgot-password', 'POST', { email });
      if (ok || data.success) {
        showToast(data.message, 'success', 0);
        forgotForm.style.display = 'none';
        const sent = document.getElementById('forgotSent');
        if (sent) sent.style.display = 'block';
      } else {
        showToast(data.message || 'Something went wrong.', 'error');
      }
    } catch {
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setLoading(btn, false);
    }
  });
}

// ── RESET PASSWORD form ───────────────────────────────────────────────────────

const resetForm = document.getElementById('resetForm');
if (resetForm) {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('token');

  if (!token) {
    showToast('Invalid reset link. Please request a new one.', 'error', 0);
    resetForm.style.display = 'none';
  } else {
    document.getElementById('resetToken').value = token;
  }

  // Confirm new password
  const newPw    = resetForm.querySelector('[name="password"]');
  const confirmPw = resetForm.querySelector('[name="confirmPassword"]');
  if (confirmPw) {
    confirmPw.addEventListener('input', () => {
      if (confirmPw.value && confirmPw.value !== newPw.value) {
        setFieldError(confirmPw, 'Passwords do not match.');
      } else {
        clearFieldError(confirmPw);
      }
    });
  }

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = resetForm.querySelector('.btn-auth');

    if (newPw.value !== confirmPw.value) {
      setFieldError(confirmPw, 'Passwords do not match.');
      return;
    }

    setLoading(btn, true);
    try {
      const { ok, data } = await apiCall(`/api/auth/reset-password/${token}`, 'POST', {
        password: newPw.value,
      });

      if (ok) {
        showToast(data.message, 'success', 0);
        resetForm.style.display = 'none';
        const done = document.getElementById('resetDone');
        if (done) done.style.display = 'block';
      } else {
        showToast(data.message || 'Reset failed.', 'error');
      }
    } catch {
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setLoading(btn, false);
    }
  });
}

// ── VERIFY EMAIL page ─────────────────────────────────────────────────────────

const verifyPage = document.getElementById('verifyEmailPage');
if (verifyPage) {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');

  const success = document.getElementById('verifySuccess');
  const invalid = document.getElementById('verifyInvalid');
  const loading = document.getElementById('verifyLoading');

  if (loading) loading.style.display = 'none';

  if (status === 'success') {
    if (success) success.style.display = 'block';
    if (invalid) invalid.style.display = 'none';
  } else if (status === 'invalid') {
    if (success) success.style.display = 'none';
    if (invalid) invalid.style.display = 'block';
  }

  // Resend verification
  const resendForm = document.getElementById('resendForm');
  if (resendForm) {
    resendForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn   = resendForm.querySelector('.btn-auth');
      const email = resendForm.querySelector('[name="email"]').value.trim();

      if (!email) { showToast('Enter your email address.', 'error'); return; }

      setLoading(btn, true);
      try {
        const { data } = await apiCall('/api/auth/resend-verification', 'POST', { email });
        showToast(data.message, 'success', 0);
        resendForm.style.display = 'none';
      } catch {
        showToast('Network error.', 'error');
      } finally {
        setLoading(btn, false);
      }
    });
  }
}
