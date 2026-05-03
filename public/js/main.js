/* Tracey Sun Portfolio — main.js */

// Architectural SVG patterns for each project card
const projectArtwork = {
  threshold: `
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="320" fill="#f2f0ec"/>
      <!-- Street grid -->
      <line x1="0" y1="260" x2="400" y2="260" stroke="#c8a96e" stroke-width="0.6" opacity="0.5"/>
      <!-- Building mass -->
      <rect x="60" y="80" width="280" height="180" stroke="#1a1a18" stroke-width="1" fill="none"/>
      <!-- Interior floors -->
      <line x1="60" y1="140" x2="340" y2="140" stroke="#1a1a18" stroke-width="0.4" opacity="0.5"/>
      <line x1="60" y1="200" x2="340" y2="200" stroke="#1a1a18" stroke-width="0.4" opacity="0.5"/>
      <!-- Threshold courtyard cut -->
      <rect x="150" y="80" width="100" height="60" stroke="#c8a96e" stroke-width="0.8" fill="rgba(200,169,110,0.07)"/>
      <!-- Windows -->
      <rect x="80" y="100" width="40" height="30" stroke="#1a1a18" stroke-width="0.6" fill="none"/>
      <rect x="140" y="160" width="30" height="30" stroke="#1a1a18" stroke-width="0.6" fill="none"/>
      <rect x="240" y="100" width="40" height="30" stroke="#1a1a18" stroke-width="0.6" fill="none"/>
      <rect x="290" y="160" width="40" height="30" stroke="#1a1a18" stroke-width="0.6" fill="none"/>
      <!-- Stoop -->
      <line x1="170" y1="260" x2="230" y2="260" stroke="#1a1a18" stroke-width="1.2"/>
      <line x1="165" y1="268" x2="235" y2="268" stroke="#1a1a18" stroke-width="1.2"/>
      <line x1="160" y1="276" x2="240" y2="276" stroke="#1a1a18" stroke-width="1.2"/>
      <!-- Dimension -->
      <line x1="60" y1="290" x2="340" y2="290" stroke="#8a8880" stroke-width="0.5"/>
      <text x="200" y="305" font-family="Inter" font-size="7" fill="#8a8880" text-anchor="middle" letter-spacing="1">HARLEM, NEW YORK</text>
    </svg>`,

  strata: `
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="320" fill="#f2f0ec"/>
      <!-- Hillside strata lines -->
      <path d="M0 280 Q100 260 200 240 Q300 220 400 200" stroke="#d4d0c8" stroke-width="1.5" fill="none"/>
      <path d="M0 260 Q100 240 200 215 Q300 195 400 175" stroke="#d4d0c8" stroke-width="1" fill="none"/>
      <path d="M0 240 Q100 215 200 190 Q300 170 400 150" stroke="#d4d0c8" stroke-width="0.8" fill="none"/>
      <path d="M0 220 Q100 195 200 170 Q300 148 400 128" stroke="#c8a96e" stroke-width="0.8" opacity="0.6" fill="none"/>
      <path d="M0 200 Q100 175 200 150 Q300 130 400 110" stroke="#d4d0c8" stroke-width="0.5" fill="none"/>
      <!-- Building cut into hill -->
      <rect x="120" y="120" width="200" height="150" stroke="#1a1a18" stroke-width="1" fill="rgba(242,240,236,0.9)"/>
      <!-- Section cut reveal -->
      <rect x="120" y="120" width="200" height="40" stroke="#c8a96e" stroke-width="0.8" fill="rgba(200,169,110,0.08)"/>
      <!-- Glass facade -->
      <line x1="320" y1="120" x2="320" y2="270" stroke="#1a1a18" stroke-width="1.5"/>
      <line x1="120" y1="160" x2="320" y2="160" stroke="#1a1a18" stroke-width="0.4" opacity="0.4"/>
      <line x1="120" y1="200" x2="320" y2="200" stroke="#1a1a18" stroke-width="0.4" opacity="0.4"/>
      <line x1="120" y1="240" x2="320" y2="240" stroke="#1a1a18" stroke-width="0.4" opacity="0.4"/>
      <line x1="170" y1="120" x2="170" y2="270" stroke="#1a1a18" stroke-width="0.4" opacity="0.4"/>
      <line x1="220" y1="120" x2="220" y2="270" stroke="#1a1a18" stroke-width="0.4" opacity="0.4"/>
      <line x1="270" y1="120" x2="270" y2="270" stroke="#1a1a18" stroke-width="0.4" opacity="0.4"/>
      <!-- Label -->
      <text x="200" y="305" font-family="Inter" font-size="7" fill="#8a8880" text-anchor="middle" letter-spacing="1">HUDSON VALLEY</text>
    </svg>`,

  lattice: `
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="320" fill="#f2f0ec"/>
      <!-- Penrose-inspired tiling -->
      <g opacity="0.7" stroke="#1a1a18" stroke-width="0.6" fill="none">
        <!-- Rhombus tiles -->
        <polygon points="200,40 240,80 200,120 160,80"/>
        <polygon points="240,80 280,120 240,160 200,120"/>
        <polygon points="160,80 200,120 160,160 120,120"/>
        <polygon points="200,120 240,160 200,200 160,160"/>
        <polygon points="240,160 280,200 240,240 200,200"/>
        <polygon points="160,160 200,200 160,240 120,200"/>
        <polygon points="200,200 240,240 200,280 160,240"/>
        <!-- Second layer -->
        <polygon points="280,120 320,160 280,200 240,160" opacity="0.4"/>
        <polygon points="120,120 160,160 120,200 80,160" opacity="0.4"/>
        <polygon points="280,40 320,80 280,120 240,80" opacity="0.3"/>
        <polygon points="120,40 160,80 120,120 80,80" opacity="0.3"/>
      </g>
      <!-- Accent highlight -->
      <polygon points="200,120 240,160 200,200 160,160" stroke="#c8a96e" stroke-width="1" fill="rgba(200,169,110,0.08)"/>
      <text x="200" y="305" font-family="Inter" font-size="7" fill="#8a8880" text-anchor="middle" letter-spacing="1">COMPUTATIONAL RESEARCH</text>
    </svg>`,

  fold: `
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="320" fill="#f2f0ec"/>
      <!-- Origami fold lines -->
      <g stroke="#1a1a18" fill="none">
        <!-- Main folded panel -->
        <polygon points="60,240 200,80 340,240" stroke-width="1"/>
        <!-- Valley folds -->
        <line x1="200" y1="80" x2="200" y2="240" stroke-width="0.6" stroke-dasharray="4 3" opacity="0.5"/>
        <line x1="130" y1="160" x2="270" y2="160" stroke-width="0.6" stroke-dasharray="4 3" opacity="0.5"/>
        <!-- Mountain folds -->
        <line x1="60" y1="240" x2="200" y2="160" stroke-width="0.8" opacity="0.7"/>
        <line x1="340" y1="240" x2="200" y2="160" stroke-width="0.8" opacity="0.7"/>
        <!-- Shadow facets -->
        <polygon points="60,240 200,160 130,240" fill="rgba(26,26,24,0.05)" stroke-width="0"/>
        <polygon points="200,80 340,240 200,160" fill="rgba(200,169,110,0.06)" stroke-width="0"/>
        <!-- Sub-folds -->
        <line x1="60" y1="240" x2="130" y2="160" stroke-width="0.5" opacity="0.4"/>
        <line x1="340" y1="240" x2="270" y2="160" stroke-width="0.5" opacity="0.4"/>
        <line x1="130" y1="160" x2="200" y2="80" stroke-width="0.5" opacity="0.4"/>
        <line x1="270" y1="160" x2="200" y2="80" stroke-width="0.5" opacity="0.4"/>
      </g>
      <!-- Ridge highlight -->
      <line x1="200" y1="80" x2="200" y2="240" stroke="#c8a96e" stroke-width="1" opacity="0.6"/>
      <text x="200" y="305" font-family="Inter" font-size="7" fill="#8a8880" text-anchor="middle" letter-spacing="1">NEW YORK CITY</text>
    </svg>`,

  commons: `
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="320" fill="#f2f0ec"/>
      <!-- Site plan -->
      <rect x="40" y="40" width="320" height="240" stroke="#d4d0c8" stroke-width="0.5" fill="none"/>
      <!-- Street grid -->
      <line x1="40" y1="160" x2="360" y2="160" stroke="#d4d0c8" stroke-width="1"/>
      <line x1="200" y1="40" x2="200" y2="280" stroke="#d4d0c8" stroke-width="1"/>
      <!-- Library building -->
      <rect x="60" y="60" width="120" height="90" stroke="#1a1a18" stroke-width="1" fill="rgba(200,169,110,0.08)"/>
      <!-- Market hall -->
      <rect x="220" y="60" width="120" height="90" stroke="#1a1a18" stroke-width="1" fill="none"/>
      <!-- Public plaza -->
      <ellipse cx="200" cy="200" rx="80" ry="50" stroke="#c8a96e" stroke-width="0.8" fill="rgba(200,169,110,0.05)" stroke-dasharray="5 3"/>
      <!-- Trees (circles) -->
      <circle cx="80" cy="190" r="12" stroke="#1a1a18" stroke-width="0.6" fill="none"/>
      <circle cx="120" cy="210" r="10" stroke="#1a1a18" stroke-width="0.6" fill="none"/>
      <circle cx="280" cy="190" r="12" stroke="#1a1a18" stroke-width="0.6" fill="none"/>
      <circle cx="320" cy="210" r="10" stroke="#1a1a18" stroke-width="0.6" fill="none"/>
      <circle cx="190" cy="175" r="8" stroke="#1a1a18" stroke-width="0.5" fill="none"/>
      <circle cx="215" cy="175" r="8" stroke="#1a1a18" stroke-width="0.5" fill="none"/>
      <!-- Label -->
      <text x="200" y="305" font-family="Inter" font-size="7" fill="#8a8880" text-anchor="middle" letter-spacing="1">BROWNSVILLE, BROOKLYN</text>
    </svg>`,

  grain: `
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="320" fill="#f2f0ec"/>
      <!-- Wood grain lines -->
      <g stroke="#1a1a18" fill="none" opacity="0.25">
        <path d="M 40 80 Q 120 70 200 75 Q 280 80 360 72" stroke-width="0.8"/>
        <path d="M 40 95 Q 110 88 200 92 Q 290 96 360 88" stroke-width="0.6"/>
        <path d="M 40 108 Q 130 100 200 106 Q 270 112 360 103" stroke-width="0.5"/>
        <path d="M 40 120 Q 100 115 160 118 Q 200 120 240 116 Q 300 110 360 118" stroke-width="0.7"/>
        <!-- Knot -->
        <ellipse cx="175" cy="140" rx="22" ry="30" stroke-width="0.8" opacity="0.6"/>
        <ellipse cx="175" cy="140" rx="12" ry="18" stroke-width="0.6" opacity="0.5"/>
        <path d="M 40 135 Q 100 132 150 136 Q 175 140 200 134 Q 270 128 360 133" stroke-width="0.6"/>
        <path d="M 40 148 Q 110 145 153 155 Q 175 162 196 153 Q 260 143 360 148" stroke-width="0.5"/>
        <path d="M 40 162 Q 120 158 200 162 Q 280 166 360 160" stroke-width="0.6"/>
        <path d="M 40 175 Q 130 170 200 175 Q 270 180 360 173" stroke-width="0.5"/>
      </g>
      <!-- Furniture silhouette — chair -->
      <g stroke="#1a1a18" fill="none" stroke-width="1">
        <line x1="170" y1="220" x2="170" y2="280"/>
        <line x1="230" y1="220" x2="230" y2="280"/>
        <line x1="160" y1="250" x2="240" y2="250"/>
        <rect x="155" y="195" width="90" height="30" stroke-width="1" fill="rgba(200,169,110,0.08)"/>
        <rect x="155" y="175" width="90" height="22"/>
      </g>
      <!-- Joinery detail -->
      <circle cx="170" cy="220" r="3" stroke="#c8a96e" stroke-width="0.8" fill="none"/>
      <circle cx="230" cy="220" r="3" stroke="#c8a96e" stroke-width="0.8" fill="none"/>
      <text x="200" y="305" font-family="Inter" font-size="7" fill="#8a8880" text-anchor="middle" letter-spacing="1">COLUMBIA GSAPP</text>
    </svg>`
};

// --- Fetch and render projects ---
async function loadPortfolio() {
  try {
    const res = await fetch('/api/portfolio');
    const data = await res.json();
    renderProjects(data.projects);
    renderAbout(data.about);
    document.getElementById('footerYear').textContent = new Date().getFullYear();
  } catch (err) {
    console.error('Failed to load portfolio data:', err);
  }
}

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  grid.innerHTML = projects.map(p => `
    <article class="project-card reveal" data-category="${p.category}" data-id="${p.id}" role="button" tabindex="0" aria-label="View project: ${p.title}">
      <div class="project-card__artwork">
        ${projectArtwork[p.id] || defaultArtwork(p)}
        <div class="project-card__overlay"></div>
      </div>
      <div class="project-card__info">
        <span class="project-card__number">${p.number}</span>
        <h3 class="project-card__title">${p.title}</h3>
        <p class="project-card__meta">${p.category} &mdash; ${p.year}</p>
      </div>
      <div class="project-card__arrow" aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="7" y1="17" x2="17" y2="7"/>
          <polyline points="7 7 17 7 17 17"/>
        </svg>
      </div>
    </article>
  `).join('');

  // Card click → modal
  grid.querySelectorAll('.project-card').forEach(card => {
    const open = () => openModal(card.dataset.id, projects);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }});
  });

  observeReveal();
}

function defaultArtwork(p) {
  return `<svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="320" fill="#f2f0ec"/>
    <line x1="0" y1="160" x2="400" y2="160" stroke="#d4d0c8" stroke-width="0.5"/>
    <line x1="200" y1="0" x2="200" y2="320" stroke="#d4d0c8" stroke-width="0.5"/>
    <rect x="100" y="80" width="200" height="160" stroke="#1a1a18" stroke-width="1" fill="none"/>
    <text x="200" y="170" font-family="EB Garamond, serif" font-size="22" fill="#1a1a18" text-anchor="middle">${p.title}</text>
  </svg>`;
}

function renderAbout(about) {
  const bio = document.getElementById('aboutBio');
  const bio2 = document.getElementById('aboutBio2');
  if (bio) bio.textContent = about.bio;
  if (bio2) bio2.textContent = about.bio2;
}

// --- Filter ---
document.getElementById('workFilter')?.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
  btn.classList.add('filter-btn--active');

  const filter = btn.dataset.filter;
  document.querySelectorAll('.project-card').forEach(card => {
    const match = filter === 'all' || card.dataset.category === filter;
    card.classList.toggle('project-card--hidden', !match);
  });
});

// --- Modal ---
function openModal(id, projects) {
  const project = projects.find(p => p.id === id);
  if (!project) return;

  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <p class="modal-number">${project.number}</p>
    <h2 class="modal-title" id="modalTitle">${project.title}</h2>
    <p class="modal-category">${project.category} &mdash; ${project.year}</p>
    <div class="modal-divider"></div>
    <p class="modal-description">${project.description}</p>
    <div class="modal-tags">
      ${project.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}
    </div>
    <div class="modal-meta">
      <div class="modal-meta-item">
        <p class="modal-meta-label">Location</p>
        <p class="modal-meta-value">${project.location}</p>
      </div>
      <div class="modal-meta-item">
        <p class="modal-meta-label">Year</p>
        <p class="modal-meta-value">${project.year}</p>
      </div>
    </div>
  `;

  modal.classList.add('modal--open');
  document.body.style.overflow = 'hidden';
  document.getElementById('modalClose').focus();
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('modal--open');
  document.body.style.overflow = '';
}

document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('modalBackdrop')?.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// --- Nav scroll behavior ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 40);
}, { passive: true });

// --- Mobile menu ---
const toggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

toggle?.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileMenu.classList.toggle('mobile-menu--open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
  const spans = toggle.querySelectorAll('span');
  if (menuOpen) {
    spans[0].style.transform = 'translateY(6px) rotate(45deg)';
    spans[1].style.transform = 'translateY(-0px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  }
});

mobileMenu?.querySelectorAll('.mobile-menu__link').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.classList.remove('mobile-menu--open');
    document.body.style.overflow = '';
    const spans = toggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.transform = '';
  });
});

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// --- Intersection Observer for reveal animations ---
function observeReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('revealed'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Add reveal class to section headers and about/contact blocks
document.querySelectorAll('.section-header, .about__bio, .about__details, .contact__intro, .contact__form, .contact__aside').forEach(el => {
  el.classList.add('reveal');
});

// --- Contact form ---
document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const status = document.getElementById('formStatus');
  const btn = this.querySelector('button[type="submit"]');
  const original = btn.textContent;

  btn.textContent = 'Sending…';
  btn.disabled = true;
  status.textContent = '';
  status.className = 'form-status';

  // Simulate send (no backend mailer in this demo)
  await new Promise(r => setTimeout(r, 1200));

  status.textContent = 'Message sent! I\'ll be in touch soon.';
  status.className = 'form-status form-status--success';
  this.reset();
  btn.textContent = original;
  btn.disabled = false;
});

// --- Footer year ---
document.getElementById('footerYear').textContent = new Date().getFullYear();

// --- Boot ---
loadPortfolio();
observeReveal();
