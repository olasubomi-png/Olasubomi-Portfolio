/* ============================================================
   OLASUBOMI — Portfolio Script v2.0
   Production-ready vanilla JS — no dependencies
   ============================================================ */

'use strict';

/* ── Loader ── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    initAnimations();
  }, 2800);
});
document.body.style.overflow = 'hidden';

/* ── Toast Notification System ── */
const toastEl = document.getElementById('toast');
let toastTimer = null;

function showToast(message, type = 'info', duration = 4000) {
  if (toastTimer) clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.className   = `toast ${type} show`;
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, duration);
}

/* ── Particle Canvas ── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const isDark = () => document.body.classList.contains('dark-mode');

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.1,
      color: Math.random() > 0.5 ? '0,245,255' : '191,0,255',
    };
  }

  for (let i = 0; i < 130; i++) particles.push(createParticle());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (!isDark()) { requestAnimationFrame(draw); return; }

    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
      ctx.fill();
    });

    // Connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p    = particles[i];
        const q    = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,245,255,${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── Navbar Scroll ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveNav();
}, { passive: true });

/* ── Mobile Menu ── */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksEl.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ── Active Nav on Scroll ── */
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 120;
  sections.forEach(sec => {
    const top    = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    const link   = document.querySelector(`.nav-link[href="#${sec.id}"]`);
    if (link) link.classList.toggle('active', scrollY >= top && scrollY < bottom);
  });
}

/* ── Theme Toggle ── */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = themeToggle.querySelector('.theme-icon');

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light-mode');
  document.body.classList.toggle('dark-mode', !isLight);
  themeIcon.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});
(function loadTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    themeIcon.textContent = '☀️';
  }
})();

/* ── Typing Animation ── */
const typingTexts = [
  'JavaScript Developer',
  'WhatsApp Bot Creator',
  'Node.js Developer',
  'AWS Cloud Builder',
  'AI Automation Developer',
  'Express.js Engineer',
];
const typingEl = document.getElementById('typingText');
let tIdx = 0, cIdx = 0, deleting = false;

function typeEffect() {
  const current = typingTexts[tIdx];
  if (!deleting) {
    typingEl.textContent = current.slice(0, cIdx + 1);
    cIdx++;
    if (cIdx === current.length) {
      deleting = true;
      setTimeout(typeEffect, 2000);
      return;
    }
  } else {
    typingEl.textContent = current.slice(0, cIdx - 1);
    cIdx--;
    if (cIdx === 0) {
      deleting = false;
      tIdx = (tIdx + 1) % typingTexts.length;
    }
  }
  setTimeout(typeEffect, deleting ? 60 : 100);
}
setTimeout(typeEffect, 3200);

/* ── Intersection Observer for Animations ── */
function initAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => observer.observe(el));

  // Skill bars
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fill  = e.target.querySelector('.skill-fill');
        const width = fill ? fill.dataset.width : 0;
        if (fill) fill.style.width = width + '%';
        skillObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skill-item').forEach(el => skillObserver.observe(el));

  // Counters
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el     = e.target;
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;
        let count = 0;
        const step  = Math.ceil(target / 60);
        const timer = setInterval(() => {
          count = Math.min(count + step, target);
          el.textContent = count;
          if (count >= target) clearInterval(timer);
        }, 30);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-number[data-count]').forEach(el => counterObserver.observe(el));
}

/* ── Add fade-in classes dynamically ── */
document.addEventListener('DOMContentLoaded', () => {
  const stagger = (selector, cls, delay = 0.1) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add(cls);
      el.style.transitionDelay = `${i * delay}s`;
    });
  };

  stagger('.stat-card',        'fade-in',       0.1);
  stagger('.skill-item',       'fade-in',       0.08);
  stagger('.service-card',     'fade-in',       0.08);
  stagger('.project-card',     'fade-in',       0.12);
  stagger('.testimonial-card', 'fade-in',       0.1);
  stagger('.timeline-item',    'fade-in-left',  0.1);  // overridden for right items below
  stagger('.cert-card',        'fade-in',       0.07);
  stagger('.gallery-item',     'fade-in',       0.1);
  stagger('.blog-card',        'fade-in',       0.1);
  stagger('.faq-item',         'fade-in',       0.06);
  stagger('.contact-card',     'fade-in',       0.1);
  stagger('.about-card',       'fade-in-right', 0.12);
  stagger('.tech-pill',        'fade-in',       0.04);

  // Timeline alternating directions
  document.querySelectorAll('.timeline-item').forEach((el, i) => {
    el.classList.remove('fade-in-left');
    el.classList.add(i % 2 === 0 ? 'fade-in-left' : 'fade-in-right');
    el.style.transitionDelay = `${i * 0.1}s`;
  });
});

/* ── Footer Year ── */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Smooth Hover Glow on Cards ── */
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0,245,255,0.05), var(--surface))`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

/* ── FAQ Accordion ── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item     = btn.closest('.faq-item');
    const answer   = item.querySelector('.faq-answer');
    const isOpen   = btn.getAttribute('aria-expanded') === 'true';

    // Close all others
    document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach(otherBtn => {
      if (otherBtn !== btn) {
        otherBtn.setAttribute('aria-expanded', 'false');
        otherBtn.closest('.faq-item').querySelector('.faq-answer').classList.remove('open');
      }
    });

    // Toggle current
    btn.setAttribute('aria-expanded', String(!isOpen));
    answer.classList.toggle('open', !isOpen);
  });
});

/* ── Contact Form ── */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn  = document.getElementById('submitBtn');
  const fields = {
    name:    { el: document.getElementById('contactName'),    err: document.getElementById('nameError') },
    email:   { el: document.getElementById('contactEmail'),   err: document.getElementById('emailError') },
    subject: { el: document.getElementById('contactSubject'), err: document.getElementById('subjectError') },
    message: { el: document.getElementById('contactMessage'), err: document.getElementById('messageError') },
  };

  /* Client-side validation */
  function validateField(name, value) {
    value = value.trim();
    switch (name) {
      case 'name':
        if (!value) return 'Name is required.';
        if (value.length < 2) return 'Name must be at least 2 characters.';
        return '';
      case 'email':
        if (!value) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
        return '';
      case 'subject':
        if (!value) return 'Subject is required.';
        if (value.length < 3) return 'Subject must be at least 3 characters.';
        return '';
      case 'message':
        if (!value) return 'Message is required.';
        if (value.length < 10) return 'Message must be at least 10 characters.';
        return '';
      default:
        return '';
    }
  }

  function setFieldError(fieldName, message) {
    const { el, err } = fields[fieldName];
    err.textContent = message;
    el.classList.toggle('error', !!message);
  }

  function validateAll() {
    let valid = true;
    Object.keys(fields).forEach(name => {
      const val = fields[name].el.value;
      const msg = validateField(name, val);
      setFieldError(name, msg);
      if (msg) valid = false;
    });
    return valid;
  }

  /* Live validation on blur */
  Object.keys(fields).forEach(name => {
    fields[name].el.addEventListener('blur', () => {
      const msg = validateField(name, fields[name].el.value);
      setFieldError(name, msg);
    });
    fields[name].el.addEventListener('input', () => {
      if (fields[name].err.textContent) {
        setFieldError(name, validateField(name, fields[name].el.value));
      }
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateAll()) return;

    /* Loading state */
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    const payload = {
      name:    fields.name.el.value.trim(),
      email:   fields.email.el.value.trim(),
      subject: fields.subject.el.value.trim(),
      message: fields.message.el.value.trim(),
    };

    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('✅ ' + data.message, 'success', 6000);
        form.reset();
        Object.keys(fields).forEach(name => setFieldError(name, ''));
      } else {
        /* Server-side validation errors */
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach(({ field, message }) => {
            if (fields[field]) setFieldError(field, message);
          });
          showToast('⚠️ Please fix the errors and try again.', 'error');
        } else {
          showToast('❌ ' + (data.message || 'Something went wrong. Please try again.'), 'error');
        }
      }
    } catch (err) {
      console.error('Contact form error:', err);
      showToast('❌ Could not send your message. Please try WhatsApp or email directly.', 'error', 6000);
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });
})();
