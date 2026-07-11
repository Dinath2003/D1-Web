// ═══════════════════════════════════════════════════════════
//  LEO DISTRICT 306 D1 — COMMON UI ANIMATIONS & EFFECTS
// ═══════════════════════════════════════════════════════════

// ── SCROLL REVEAL UTILITIES ─────────────────────────────────
const revealElements = () => {
  const elements = document.querySelectorAll('.reveal');
  const windowHeight = window.innerHeight;
  elements.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    const revealPoint = 80;
    if (elementTop < windowHeight - revealPoint) {
      el.classList.add('active');
    }
  });
};

// ── AMBIENT PARTICLES SYSTEM ─────────────────────────────────
function createAmbientParticles() {
  const containers = document.querySelectorAll('.page-view');
  containers.forEach(container => {
    if (container.querySelector('.ambient-particles-container')) return;

    const particleWrapper = document.createElement('div');
    particleWrapper.className = 'ambient-particles-container';
    particleWrapper.style.position = 'absolute';
    particleWrapper.style.top = '0';
    particleWrapper.style.left = '0';
    particleWrapper.style.width = '100%';
    particleWrapper.style.height = '100%';
    particleWrapper.style.overflow = 'hidden';
    particleWrapper.style.pointerEvents = 'none';
    particleWrapper.style.zIndex = '0';
    container.appendChild(particleWrapper);

    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'ambient-particle';
      
      const size = 1 + Math.random() * 3;
      const drift = -80 + Math.random() * 160;
      const isGold = Math.random() > 0.4;
      const color = isGold ? 'rgba(234, 170, 0, 0.85)' : 'rgba(118, 35, 47, 0.9)';
      const shadow = isGold ? '0 0 8px rgba(234, 170, 0, 0.8)' : '0 0 8px rgba(118, 35, 47, 0.8)';
      
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = color;
      p.style.boxShadow = shadow;
      p.style.setProperty('--drift', `${drift}px`);
      p.style.left = `${Math.random() * 100}%`;
      p.style.bottom = `${Math.random() * 20}%`;
      p.style.animationDelay = `${Math.random() * 4}s`;
      p.style.animationDuration = `${3 + Math.random() * 5}s`;
      
      particleWrapper.appendChild(p);
    }
  });
}

// ── 3-D GLASS CARDS INTERACTIVE TILT ────────────────────────
function setupCardTilt(gridId) {
  document.querySelectorAll(`#${gridId} .profile-card-3d`).forEach(card => {
    if (card._tilt) return;
    card._tilt = true;
    
    const wrapper = card.parentElement;
    const shine = card.querySelector('.card-shine');
    
    wrapper.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const tiltX = -((y - rect.height / 2) / (rect.height / 2)) * 12;
      const tiltY = ((x - rect.width / 2) / (rect.width / 2)) * 12;
      
      card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
      card.style.borderColor = 'rgba(234,170,0,0.3)';
      
      if (shine) {
        shine.style.opacity = '1';
        shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(234,170,0,0.1) 0%, rgba(0,0,0,0) 80%)`;
      }
    });
    
    wrapper.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.borderColor = '';
      if (shine) shine.style.opacity = '0';
    });
  });
}

// Morphing indicator alignment
function alignIndicator(activeLink) {
  const indicator = document.getElementById('nav-indicator');
  if (!indicator || window.innerWidth <= 768) return;
  const parentRect = activeLink.parentElement.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  indicator.style.width = `${linkRect.width}px`;
  indicator.style.left = `${linkRect.left - parentRect.left}px`;
}

// ── MAIN INITIALIZATION ──────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  createAmbientParticles();
  setTimeout(revealElements, 200);

  // Resize align listeners
  window.addEventListener('resize', () => {
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) alignIndicator(activeLink);
  });

  window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 40) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }
    revealElements();
  });

  // Mobile menu listener
  const mobToggle = document.getElementById('mobile-toggle');
  if (mobToggle) {
    mobToggle.addEventListener('click', () => {
      const navMenu = document.getElementById('nav-menu');
      const icon = mobToggle.firstElementChild;
      if (navMenu && icon) {
        if (navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          icon.className = 'fa-solid fa-bars';
        } else {
          navMenu.classList.add('open');
          icon.className = 'fa-solid fa-xmark';
        }
      }
    });
  }

  // Initial indicator alignment
  const activeLink = document.querySelector('.nav-link.active');
  if (activeLink) {
    setTimeout(() => alignIndicator(activeLink), 150);
  }
});
