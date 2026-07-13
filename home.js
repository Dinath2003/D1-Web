// ═══════════════════════════════════════════════════════════
//  LEO DISTRICT 306 D1 — HOME PAGE ENGINE
// ═══════════════════════════════════════════════════════════

// ── METRIC COUNTERS ANIMATIONS ──────────────────────────────
function runCounters() {
  const elements = [
    { id: 'count-members', target: 1200, suffix: '+' },
    { id: 'count-clubs', target: 42, suffix: '' },
    { id: 'count-projects', target: 68, suffix: '' }
  ];

  elements.forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;
    let count = 0;
    const duration = 1200; // ms
    const stepTime = Math.max(Math.floor(duration / item.target), 15);
    const timer = setInterval(() => {
      count += Math.ceil(item.target / 60);
      if (count >= item.target) {
        el.innerText = item.target.toLocaleString() + item.suffix;
        clearInterval(timer);
      } else {
        el.innerText = count.toLocaleString();
      }
    }, stepTime);
  });
}

// ── CLUB LOGOS MARQUEE PUBLIC RENDERER ─────────────────────
function renderPublicClubLogosMarquee() {
  const track = document.getElementById('club-logos-marquee-track');
  if (!track) return;
  track.innerHTML = '';

  const list = getCollection(STORAGE_KEYS.CLUB_LOGOS).filter(l => l.status === 'Active');
  list.sort((a,b) => a.displayOrder - b.displayOrder);

  if (list.length === 0) {
    const container = document.querySelector('.club-logos-marquee-container');
    if (container) container.style.display = 'none';
    return;
  } else {
    const container = document.querySelector('.club-logos-marquee-container');
    if (container) container.style.display = 'block';
  }

  // Double the list to scroll seamlessly
  const renderList = [...list, ...list];

  renderList.forEach(item => {
    const div = document.createElement('div');
    div.className = 'marquee-item';
    const frameClass = item.frameType === 'rectangle' ? 'logo-full-frame' : 'logo-circle-frame';
    const logoStyle = `style="transform: scale(${item.photoScale || 1}); object-position: ${item.photoX || 50}% ${item.photoY || 50}%;"`;
    div.innerHTML = `
      <div class="${frameClass}">
        <img src="${item.image}" alt="${item.name}" ${logoStyle}>
      </div>
      <span>${item.name}</span>
    `;
    track.appendChild(div);
  });
}

// ── LIVE IFRAMES RESPONSIVE SCALING ─────────────────────────
function scaleLiveIframes() {
  const iframes = document.querySelectorAll('.card-live-panel iframe');
  iframes.forEach(iframe => {
    const parent = iframe.parentElement;
    if (!parent) return;
    
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    if (parentWidth === 0 || parentHeight === 0) return;

    // Use a standard virtual desktop viewport width and height
    const virtualWidth = 800;
    const virtualHeight = 500;

    iframe.style.width = virtualWidth + 'px';
    iframe.style.height = virtualHeight + 'px';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';

    // Calculate scale factor to fit the container exactly
    const scaleX = parentWidth / virtualWidth;
    const scaleY = parentHeight / virtualHeight;

    iframe.style.transform = `scale(${scaleX}, ${scaleY})`;
    iframe.style.transformOrigin = '0 0';
  });
}

// ── INITIALIZATION ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Render immediately from local cache
  renderPublicClubLogosMarquee();

  // Async sync in background
  syncFromSupabase('clubLogos').then(updated => {
    if (updated) renderPublicClubLogosMarquee();
  });

  runCounters();
  
  scaleLiveIframes();
  // Call again after a short delay to handle rendering settles
  setTimeout(scaleLiveIframes, 250);

  // Mouse tilt tracking for 3D Mythical Crest
  const heroCrest = document.getElementById('hero-mythical-crest');
  if (heroCrest) {
    heroCrest.addEventListener('mousemove', (e) => {
      const rect = heroCrest.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = -(y / (rect.height / 2)) * 25;
      const tiltY = (x / (rect.width / 2)) * 25;
      heroCrest.style.animation = 'none';
      heroCrest.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`;
    });
    heroCrest.addEventListener('mouseleave', () => {
      heroCrest.style.animation = 'crest-float 6s infinite alternate ease-in-out';
      heroCrest.style.transform = '';
    });
  }
});

window.addEventListener('resize', scaleLiveIframes);
window.addEventListener('load', scaleLiveIframes);

