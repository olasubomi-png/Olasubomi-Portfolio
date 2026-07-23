/* ============================================================
   OLASUBOMI — Portfolio Script
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

/* ── Particle Canvas ── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

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
    particles.forEach((p, i) => {
      particles.slice(i + 1).forEach(q => {
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,245,255,${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

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
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
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
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => observer.observe(el));

  // Skill bars
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fill  = e.target.querySelector('.skill-fill');
        const width = fill.dataset.width;
        fill.style.width = width + '%';
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
        const step = Math.ceil(target / 60);
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
  // Hero elements already visible; add fade-in to sections
  document.querySelectorAll('.stat-card').forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${i * 0.1}s`;
  });
  document.querySelectorAll('.skill-item').forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${i * 0.08}s`;
  });
  document.querySelectorAll('.project-card').forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${i * 0.12}s`;
  });
  document.querySelectorAll('.timeline-item').forEach((el, i) => {
    el.classList.add(i % 2 === 0 ? 'fade-in-left' : 'fade-in-right');
    el.style.transitionDelay = `${i * 0.1}s`;
  });
  document.querySelectorAll('.gallery-item').forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${i * 0.1}s`;
  });
  document.querySelectorAll('.contact-card').forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${i * 0.1}s`;
  });
  document.querySelectorAll('.about-card').forEach((el, i) => {
    el.classList.add('fade-in-right');
    el.style.transitionDelay = `${i * 0.12}s`;
  });
  document.querySelectorAll('.tech-pill').forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${i * 0.04}s`;
  });
});

/* ── Footer Year ── */
document.getElementById('year').textContent = new Date().getFullYear();

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
