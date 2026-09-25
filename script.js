'use strict';
(function () {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const navbar = document.getElementById('navbar');
  function onScroll() { if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
      });
    });
  }
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link[href^="#"]');
  function updateActive() {
    let current = '';
    sections.forEach((s) => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
    links.forEach((l) => { l.classList.toggle('active', l.getAttribute('href') === '#' + current); });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg, type, ms) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.classList.remove('show'); }, ms || 5000);
  }
  const form = document.getElementById('contactForm');
  if (!form) return;
  const submitBtn = document.getElementById('submitBtn');
  const fields = {
    name: { el: document.getElementById('contactName'), err: document.getElementById('nameError') },
    email: { el: document.getElementById('contactEmail'), err: document.getElementById('emailError') },
    subject: { el: document.getElementById('contactSubject'), err: document.getElementById('subjectError') },
    message: { el: document.getElementById('contactMessage'), err: document.getElementById('messageError') },
  };
  function setFieldError(name, msg) {
    const f = fields[name]; if (!f) return;
    f.err.textContent = msg || '';
    f.el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validateField(name, val) {
    val = (val || '').trim();
    if (!val) return 'This field is required.';
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address.';
    if (name === 'message' && val.length < 10) return 'Message should be at least 10 characters.';
    if (name === 'name' && val.length < 2) return 'Name should be at least 2 characters.';
    return '';
  }
  function validateAll() {
    let valid = true;
    Object.keys(fields).forEach((name) => {
      const msg = validateField(name, fields[name].el.value);
      setFieldError(name, msg);
      if (msg) valid = false;
    });
    return valid;
  }
  Object.keys(fields).forEach((name) => {
    fields[name].el.addEventListener('blur', () => setFieldError(name, validateField(name, fields[name].el.value)));
    fields[name].el.addEventListener('input', () => {
      if (fields[name].err.textContent) setFieldError(name, validateField(name, fields[name].el.value));
    });
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    const payload = {
      name: fields.name.el.value.trim(),
      email: fields.email.el.value.trim(),
      subject: fields.subject.el.value.trim(),
      message: fields.message.el.value.trim(),
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Message received!', 'success', 6000);
        form.reset();
        Object.keys(fields).forEach((n) => setFieldError(n, ''));
      } else if (data.errors && Array.isArray(data.errors)) {
        data.errors.forEach(({ field, message }) => { if (fields[field]) setFieldError(field, message); });
        showToast('Please fix the errors and try again.', 'error');
      } else {
        showToast(data.message || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      showToast('Could not send your message. Please try again later.', 'error', 6000);
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });
})();
