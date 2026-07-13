// ═══════════════════════════════════════════════════════════
//  LEO DISTRICT 306 D1 — LEO CLUBS PAGE ENGINE
// ═══════════════════════════════════════════════════════════

function renderPublicPresidents() {
  const grid = document.getElementById('public-presidents-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const selectedYear = '2026/2027';
  const presidents = getCollection(STORAGE_KEYS.PRESIDENTS)
    .filter(p => p.year === selectedYear && p.status === 'Active')
    .sort((a,b) => a.displayOrder - b.displayOrder);

  if (presidents.length === 0) {
    grid.innerHTML = `<div class="no-results glass-panel" style="grid-column: 1/-1;"><i class="fa-solid fa-face-frown"></i> No active Club Presidents registered for Year ${selectedYear}.</div>`;
    return;
  }

  presidents.forEach(p => {
    const card = document.createElement('div');
    card.className = 'leo-member-card glass-panel';
    
    const photoStyle = `style="width:100%;height:100%;object-fit:cover;border-radius:inherit;transform: scale(${p.photoScale || 1}); object-position: ${p.photoX || 50}% ${p.photoY || 50}%;"`;
    const photoHtml = p.photo 
      ? `<img src="${p.photo}" ${photoStyle}>` 
      : `<i class="fa-solid fa-user-astronaut"></i>`;

    card.innerHTML = `
      <div class="leo-badge">${p.position}</div>
      <div class="leo-avatar">${photoHtml}</div>
      <h4>${p.name}</h4>
      <span class="leo-club">${p.clubName}</span>
      <p style="font-size:0.75rem; color:#9e8070; margin-top:8px;">Area: ${p.region}</p>
      <p style="margin-top:10px; font-size:0.8rem;">${p.bio || 'Serving the local youth movement.'}</p>
    `;
    grid.appendChild(card);
  });
}

function renderPublicClubs() {
  const grid = document.getElementById('public-clubs-grid');
  const countEl = document.getElementById('leo-count');
  if (!grid) return;
  grid.innerHTML = '';

  const searchInput = document.getElementById('leo-search');
  const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
  
  const regionSelect = document.getElementById('public-clubs-region');
  const region = regionSelect ? regionSelect.value : 'all';

  let list = getCollection(STORAGE_KEYS.CLUBS).filter(c => c.status === 'Active');

  if (region !== 'all') {
    list = list.filter(c => c.region === region);
  }

  if (query) {
    list = list.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.sponsor.toLowerCase().includes(query) || 
      c.region.toLowerCase().includes(query) || 
      c.president.toLowerCase().includes(query) ||
      c.advisor.toLowerCase().includes(query)
    );
  }

  list.sort((a,b) => a.displayOrder - b.displayOrder);

  if (countEl) countEl.innerText = list.length;

  if (list.length === 0) {
    grid.innerHTML = `<div class="no-results glass-panel" style="grid-column: 1/-1;"><i class="fa-solid fa-face-frown"></i> No Leo Clubs matched your query.</div>`;
    return;
  }

  list.forEach(c => {
    const card = document.createElement('div');
    card.className = 'public-club-card glass-panel';

    const bannerHtml = c.banner 
      ? `<img src="${c.banner}" class="club-card-banner">`
      : `<div class="club-card-banner" style="background:linear-gradient(135deg, #150808, #2a1010); border-radius:12px;"></div>`;

    const logoHtml = c.logo 
      ? `<img src="${c.logo}" alt="Logo">`
      : `<i class="fa-solid fa-shield-halved text-gold"></i>`;

    card.innerHTML = `
      ${bannerHtml}
      <div class="club-card-header">
        <div class="club-logo-circle">${logoHtml}</div>
        <div class="club-title-info">
          <h4>${c.name}</h4>
          <span>Sponsoring Lions Club: ${c.sponsor}</span>
        </div>
      </div>
      <div class="club-details-list">
        <div class="detail-item"><span class="label">Chartered</span><span>${c.charteredDate}</span></div>
        <div class="detail-item"><span class="label">Region</span><span>${c.region}</span></div>
        <div class="detail-item"><span class="label">President</span><span>${c.president}</span></div>
        <div class="detail-item"><span class="label">Secretary</span><span>${c.secretary}</span></div>
        <div class="detail-item"><span class="label">Treasurer</span><span>${c.treasurer}</span></div>
        <div class="detail-item"><span class="label">Advisor</span><span>${c.advisor}</span></div>
      </div>
      <div class="club-card-footer">
        <span class="members-pill">${c.members} Members</span>
        <span class="status-badge">${c.status}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ── INITIALIZATION ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Render immediately from local cache
  renderPublicPresidents();
  renderPublicClubs();

  // Async sync in background
  Promise.all([
    syncFromSupabase('clubPresidents'),
    syncFromSupabase('clubsDirectory')
  ]).then(results => {
    const updated = results.some(Boolean);
    if (updated) {
      renderPublicPresidents();
      renderPublicClubs();
    }
  });

  const searchInput = document.getElementById('leo-search');
  if (searchInput) searchInput.addEventListener('input', renderPublicClubs);

  const regionSelect = document.getElementById('public-clubs-region');
  if (regionSelect) regionSelect.addEventListener('change', renderPublicClubs);
});
