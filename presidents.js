// ═══════════════════════════════════════════════════════════
//  LEO DISTRICT 306 D1 — PAST DISTRICT PRESIDENTS PAGE ENGINE
// ═══════════════════════════════════════════════════════════

function renderPublicLogosMarquee() {
  const track = document.getElementById('pdp-marquee-track');
  if (!track) return;
  track.innerHTML = '';

  const list = getCollection(STORAGE_KEYS.LOGOS).filter(l => l.status === 'Active');
  list.sort((a,b) => a.displayOrder - b.displayOrder);

  if (list.length === 0) {
    const container = document.querySelector('.pdp-logos-marquee-container');
    if (container) container.style.display = 'none';
    return;
  } else {
    const container = document.querySelector('.pdp-logos-marquee-container');
    if (container) container.style.display = 'block';
  }

  // Double the list so it scrolls seamlessly without breaking
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

function renderPublicGovernors() {
  renderPublicLogosMarquee();
  const grid = document.getElementById('governors-container');
  if (!grid) return;
  grid.innerHTML = '';

  const searchInput = document.getElementById('gov-search');
  const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
  let list = getCollection(STORAGE_KEYS.GOVERNORS).filter(g => g.status === 'Active');

  if (q) {
    list = list.filter(g => 
      g.name.toLowerCase().includes(q) || 
      g.year.toLowerCase().includes(q) || 
      g.theme.toLowerCase().includes(q) || 
      g.achievement.toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    grid.innerHTML = `<div class="no-results glass-panel"><i class="fa-solid fa-face-frown"></i> No Past Presidents matched your search.</div>`;
    return;
  }

  list.forEach((g, idx) => {
    const card = document.createElement('div');
    const side = idx % 2 === 0 ? 'left' : 'right';
    card.className = `gov-timeline-item ${side} reveal`;
    
    const achievementHtml = g.achievement ? `<p class="gov-achievement"><strong>Key Achievement:</strong> ${g.achievement}</p>` : '';
    const themeLabel = (g.theme && g.theme.toLowerCase().includes('club')) ? 'Home Club' : 'Theme';
    const themeHtml = g.theme ? `<div class="gov-theme" style="font-size: 0.8rem; color: #9e8070; margin-top: 4px;"><i class="fa-solid ${g.logo || 'fa-scroll'}"></i> ${themeLabel}: <strong>${g.theme}</strong></div>` : '';

    card.innerHTML = `
      <div class="gov-timeline-badge"><i class="fa-solid fa-scroll"></i></div>
      <div class="gov-card glass-panel">
        <span class="gov-year">${g.year}</span>
        <div class="gov-header" style="display: flex; gap: 15px; align-items: center; margin-bottom: 12px;">
          <div class="profile-photo-circle" style="width: 64px; height: 64px; border-radius: 12px; border: 1.5px solid rgba(234,170,0,0.3); overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.4);">
            ${g.photo 
              ? `<img src="${g.photo}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(${g.photoScale || 1}); object-position: ${g.photoX || 50}% ${g.photoY || 50}%;">`
              : `<div class="profile-icon-fallback" style="width: 100%; height: 100%; font-size: 1.2rem; color: rgba(234,170,0,0.7); display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-user-shield"></i></div>`
            }
          </div>
          <div>
            <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; margin: 0;">${g.name}</h4>
            ${themeHtml}
          </div>
        </div>
        ${achievementHtml}
      </div>
    `;
    grid.appendChild(card);
  });
  revealElements();
}

function filterGovernors() {
  renderPublicGovernors();
}

// ── INITIALIZATION ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Render immediately from local cache
  renderPublicGovernors();

  // Async sync in background
  syncFromSupabase('pdpLogos').then(updated => {
    if (updated) renderPublicGovernors();
  });

  const searchInput = document.getElementById('gov-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderPublicGovernors);
  }
});
