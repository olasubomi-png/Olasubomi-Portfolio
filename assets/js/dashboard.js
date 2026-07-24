/* ============================================================
   Dashboard — control panel JS
   ============================================================ */

'use strict';

// ── Globals ───────────────────────────────────────────────────────────────────
let currentUser = null;

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, type = 'info', duration = 4000) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${msg}</span>
    <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>`;
  document.querySelector('.toast-container').appendChild(el);
  if (duration > 0) setTimeout(() => el.style.opacity === '' && el.remove(), duration);
  return el;
}

// ── API ───────────────────────────────────────────────────────────────────────
async function api(endpoint, method = 'GET', body = null, isFormData = false) {
  const opts = { method, credentials: 'include' };
  if (body && !isFormData) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  } else if (isFormData) {
    opts.body = body; // FormData — let browser set Content-Type
  }
  const res  = await fetch(endpoint, opts);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ── Auth guard ────────────────────────────────────────────────────────────────
async function loadUser() {
  let { ok, data } = await api('/api/auth/me');
  if (!ok) {
    // Try token refresh
    const { ok: refreshed } = await api('/api/auth/refresh', 'POST');
    if (refreshed) {
      ({ ok, data } = await api('/api/auth/me'));
    }
  }
  if (!ok) {
    window.location.href = '/auth/login.html?redirect=/dashboard/';
    return null;
  }
  return data.data.user;
}

// ── Panel navigation ──────────────────────────────────────────────────────────
function showPanel(id) {
  document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const panel = document.getElementById('panel-' + id);
  if (panel) panel.classList.add('active');

  document.querySelectorAll(`[data-panel="${id}"]`).forEach(n => n.classList.add('active'));

  // Update header title
  const titles = {
    overview:    { title: 'Overview',    crumb: 'Dashboard / Overview' },
    portfolio:   { title: 'Portfolio',   crumb: 'Dashboard / Portfolio Builder' },
    products:    { title: 'Products',    crumb: 'Dashboard / Digital Products' },
    analytics:   { title: 'Analytics',   crumb: 'Dashboard / Analytics' },
    messages:    { title: 'Messages',    crumb: 'Dashboard / Messages' },
    settings:    { title: 'Settings',    crumb: 'Dashboard / Settings' },
    security:    { title: 'Security',    crumb: 'Dashboard / Security' },
  };
  const t = titles[id] || { title: id, crumb: 'Dashboard / ' + id };
  document.querySelector('.dash-page-title').textContent = t.title;
  document.querySelector('.dash-breadcrumb').textContent = t.crumb;

  closeSidebar();
}

// ── Populate UI with user data ────────────────────────────────────────────────
function populateUI(user) {
  // Sidebar
  setText('sidebar-username', user.firstName + ' ' + user.lastName);
  setText('sidebar-role', user.role);
  setImg('sidebar-avatar', user.avatarUrl || user.avatar, user.firstName?.[0]);

  // Overview
  setText('ov-name', user.firstName + ' ' + user.lastName);
  setText('ov-username', '@' + user.username);
  setText('ov-role', user.role);
  setText('ov-email', user.email);
  setText('ov-joined', new Date(user.createdAt).toLocaleDateString('en', { year:'numeric', month:'long', day:'numeric' }));
  setText('ov-last-login', user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'First login');
  setText('ov-views', user.stats?.profileViews ?? 0);
  setText('ov-sales', user.stats?.totalSales ?? 0);
  setText('ov-products', user.stats?.totalProducts ?? 0);
  setImg('ov-avatar', user.avatarUrl || user.avatar, user.firstName?.[0]);

  // Verification badge
  const badge = document.getElementById('ov-verified-badge');
  if (badge) {
    badge.textContent = user.isVerified ? '✅ Verified' : '⚠️ Email not verified';
    badge.className = 'badge ' + (user.isVerified ? 'verified' : 'unverified');
  }

  // Portfolio status badge
  const pubBadge = document.getElementById('ov-publish-badge');
  if (pubBadge) {
    pubBadge.textContent = user.isPublished ? '🌐 Published' : '📝 Draft';
    pubBadge.className = 'badge ' + (user.isPublished ? 'published' : 'draft');
  }

  // Profile form
  setVal('pf-first-name', user.firstName);
  setVal('pf-last-name',  user.lastName);
  setVal('pf-headline',   user.profile?.headline || '');
  setVal('pf-bio',        user.profile?.bio || '');
  setVal('pf-location',   user.profile?.location || '');
  setVal('pf-phone',      user.profile?.phone || '');
  setVal('pf-github',     user.profile?.socialLinks?.github || '');
  setVal('pf-linkedin',   user.profile?.socialLinks?.linkedin || '');
  setVal('pf-twitter',    user.profile?.socialLinks?.twitter || '');
  setVal('pf-website',    user.profile?.socialLinks?.website || '');
  setImg('pf-avatar',     user.avatarUrl || user.avatar, user.firstName?.[0]);

  // Skills
  renderSkills(user.profile?.skills || []);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '';
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val ?? '';
}
function setImg(id, src, initial = '?') {
  const el = document.getElementById(id);
  if (!el) return;
  if (src) {
    el.src = src;
    el.onerror = () => { el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=6c63ff&color=fff&size=200`; };
  } else {
    el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=6c63ff&color=fff&size=200`;
  }
}

// ── Skills management ─────────────────────────────────────────────────────────
let userSkills = [];

function renderSkills(skills) {
  userSkills = [...skills];
  const container = document.getElementById('skills-tags');
  if (!container) return;
  container.innerHTML = userSkills.map((s, i) => `
    <span class="skill-tag">
      ${escHtml(s)}
      <button type="button" onclick="removeSkill(${i})" aria-label="Remove ${s}">×</button>
    </span>
  `).join('');
}

function removeSkill(i) {
  userSkills.splice(i, 1);
  renderSkills(userSkills);
}

window.removeSkill = removeSkill;

function addSkill() {
  const input = document.getElementById('skill-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  if (userSkills.length >= 20) { toast('Max 20 skills.', 'warning'); return; }
  if (userSkills.includes(val)) { toast('Already added.', 'warning'); return; }
  userSkills.push(val);
  renderSkills(userSkills);
  input.value = '';
  input.focus();
}

// ── Avatar upload ─────────────────────────────────────────────────────────────
function setupAvatarUpload() {
  const fileInput   = document.getElementById('avatar-file-input');
  const uploadBtn   = document.getElementById('avatar-upload-btn');
  const previewPf   = document.getElementById('pf-avatar');
  const previewSb   = document.getElementById('sidebar-avatar');
  const previewOv   = document.getElementById('ov-avatar');

  if (!fileInput || !uploadBtn) return;

  uploadBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast('Image must be under 5 MB.', 'error');
      return;
    }

    // Preview immediately
    const reader = new FileReader();
    reader.onload = e => {
      [previewPf, previewSb, previewOv].forEach(img => { if (img) img.src = e.target.result; });
    };
    reader.readAsDataURL(file);

    // Upload
    uploadBtn.disabled = true;
    uploadBtn.textContent = '⏳ Uploading…';
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const { ok, data } = await api('/api/auth/avatar', 'PATCH', fd, true);
      if (ok) {
        toast('Avatar updated!', 'success');
        if (data.data?.user) currentUser = data.data.user;
      } else {
        toast(data.message || 'Upload failed.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = '📷 Change Avatar';
      fileInput.value = '';
    }
  });
}

// ── Profile save ──────────────────────────────────────────────────────────────
async function saveProfile(e) {
  e.preventDefault();
  const btn = document.getElementById('save-profile-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Saving…';

  try {
    const payload = {
      firstName: document.getElementById('pf-first-name')?.value.trim(),
      lastName:  document.getElementById('pf-last-name')?.value.trim(),
      profile: {
        headline: document.getElementById('pf-headline')?.value.trim(),
        bio:      document.getElementById('pf-bio')?.value.trim(),
        location: document.getElementById('pf-location')?.value.trim(),
        phone:    document.getElementById('pf-phone')?.value.trim(),
        skills:   userSkills,
        socialLinks: {
          github:    document.getElementById('pf-github')?.value.trim(),
          linkedin:  document.getElementById('pf-linkedin')?.value.trim(),
          twitter:   document.getElementById('pf-twitter')?.value.trim(),
          website:   document.getElementById('pf-website')?.value.trim(),
        },
      },
    };

    const { ok, data } = await api('/api/auth/profile', 'PATCH', payload);
    if (ok) {
      currentUser = data.data.user;
      populateUI(currentUser);
      toast('Profile saved successfully!', 'success');
    } else {
      toast(data.message || 'Save failed.', 'error');
    }
  } catch {
    toast('Network error.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Save Profile';
  }
}

// ── Change password ───────────────────────────────────────────────────────────
async function changePassword(e) {
  e.preventDefault();
  const btn     = document.getElementById('change-pw-btn');
  const current = document.getElementById('sec-current-pw')?.value;
  const newPw   = document.getElementById('sec-new-pw')?.value;
  const confirm = document.getElementById('sec-confirm-pw')?.value;

  if (!current || !newPw || !confirm) { toast('All fields are required.', 'warning'); return; }
  if (newPw !== confirm) { toast('New passwords do not match.', 'error'); return; }
  if (newPw.length < 8)  { toast('Password must be at least 8 characters.', 'error'); return; }

  btn.disabled = true;
  btn.textContent = '⏳ Changing…';

  try {
    const { ok, data } = await api('/api/auth/change-password', 'PATCH', {
      currentPassword: current,
      newPassword:     newPw,
    });

    if (ok) {
      toast('Password changed! Other sessions logged out.', 'success');
      e.target.reset();
    } else {
      toast(data.message || 'Failed.', 'error');
    }
  } catch {
    toast('Network error.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🔒 Change Password';
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
async function logout() {
  try {
    await api('/api/auth/logout', 'POST');
  } catch {}
  window.location.href = '/auth/login.html';
}

// ── Mobile sidebar ────────────────────────────────────────────────────────────
function openSidebar() {
  document.querySelector('.sidebar')?.classList.add('open');
  document.querySelector('.sidebar-overlay')?.classList.add('visible');
}
function closeSidebar() {
  document.querySelector('.sidebar')?.classList.remove('open');
  document.querySelector('.sidebar-overlay')?.classList.remove('visible');
}

// ── Utility ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await loadUser();
  if (!currentUser) return;

  populateUI(currentUser);
  setupAvatarUpload();

  // Panel navigation
  document.querySelectorAll('[data-panel]').forEach(el => {
    el.addEventListener('click', () => showPanel(el.dataset.panel));
  });

  // Default panel
  showPanel('overview');

  // Profile form
  const profileForm = document.getElementById('profile-form');
  if (profileForm) profileForm.addEventListener('submit', saveProfile);

  // Add skill
  document.getElementById('add-skill-btn')?.addEventListener('click', addSkill);
  document.getElementById('skill-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  });

  // Security form
  const secForm = document.getElementById('security-form');
  if (secForm) secForm.addEventListener('submit', changePassword);

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  // Hamburger
  document.getElementById('hamburger-btn')?.addEventListener('click', openSidebar);
  document.querySelector('.sidebar-overlay')?.addEventListener('click', closeSidebar);
});
