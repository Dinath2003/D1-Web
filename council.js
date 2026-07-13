// ═══════════════════════════════════════════════════════════
//  LEO DISTRICT 306 D1 — COUNCIL PAGE ENGINE
// ═══════════════════════════════════════════════════════════

function renderPublicCouncil() {
  const searchInput = document.getElementById('council-search');
  const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
  const council = getCollection(STORAGE_KEYS.COUNCIL).filter(m => m.status === 'Published');
  
  // Update public total counter
  const totalCountEl = document.getElementById('council-total-count');
  if (totalCountEl) totalCountEl.innerText = council.length;

  // Render standard sections
  const sections = {
    exec: document.getElementById('exec-grid'),
    chief: document.getElementById('chief-grid'),
    officers: document.getElementById('officers-grid')
  };

  Object.keys(sections).forEach(key => {
    const grid = sections[key];
    if (!grid) return;
    grid.innerHTML = '';

    let list = council.filter(m => m.type === key);
    if (q) {
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q));
    }
    
    // Sort by display order
    list.sort((a,b) => a.displayOrder - b.displayOrder);

    if (list.length === 0) {
      grid.innerHTML = `<div class="no-results glass-panel"><i class="fa-solid fa-face-frown"></i> No matching cabinet members.</div>`;
      return;
    }

    if (key === 'exec') {
      grid.innerHTML = renderExecSection(list);
    } else if (key === 'chief') {
      grid.innerHTML = renderChiefSection(list);
    } else {
      grid.innerHTML = list.map(m => buildPublicCard(m)).join('');
    }
    setTimeout(() => setupCardTilt(grid.id), 60);
  });

  // Render split Directors sections
  const regionalGrid = document.getElementById('regional-zonal-grid');
  const committeeGrid = document.getElementById('committee-directors-grid');

  if (regionalGrid && committeeGrid) {
    regionalGrid.innerHTML = '';
    committeeGrid.innerHTML = '';

    let directorsList = council.filter(m => m.type === 'directors');
    if (q) {
      directorsList = directorsList.filter(m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q));
    }

    directorsList.sort((a,b) => a.displayOrder - b.displayOrder);

    // Split list
    const regionalZonalList = directorsList.filter(m => m.role.toLowerCase().includes('regional') || m.role.toLowerCase().includes('zonal'));
    const committeeList = directorsList.filter(m => !m.role.toLowerCase().includes('regional') && !m.role.toLowerCase().includes('zonal'));

    // Render Regional & Zonal Hierarchy tree
    if (regionalZonalList.length === 0) {
      regionalGrid.innerHTML = `<div class="no-results glass-panel" style="width:100%;"><i class="fa-solid fa-face-frown"></i> No matching regional or zonal directors.</div>`;
    } else {
      regionalGrid.innerHTML = renderRegionalZonalSection(regionalZonalList);
    }

    // Render Committee Directors in a row wrapping grid
    if (committeeList.length === 0) {
      committeeGrid.innerHTML = `<div class="no-results glass-panel" style="width:100%;"><i class="fa-solid fa-face-frown"></i> No matching committee directors.</div>`;
    } else {
      committeeGrid.innerHTML = committeeList.map(m => buildPublicCard(m)).join('');
    }

    setTimeout(() => {
      setupCardTilt('regional-zonal-grid');
      setupCardTilt('committee-directors-grid');
    }, 60);
  }
}

function renderRegionalZonalSection(members) {
  const regA = members.find(m => m.role.toLowerCase().includes('regional director - region a'));
  const zoneA1 = members.find(m => m.role.toLowerCase().includes('zonal director - zone a1'));
  const zoneA2 = members.find(m => m.role.toLowerCase().includes('zonal director - zone a2'));
  const regB = members.find(m => m.role.toLowerCase().includes('regional director - region b'));
  const zoneB1 = members.find(m => m.role.toLowerCase().includes('zonal director - zone b1'));
  const zoneB2 = members.find(m => m.role.toLowerCase().includes('zonal director - zone b2'));

  const matchedIds = new Set([
    regA?.id, zoneA1?.id, zoneA2?.id,
    regB?.id, zoneB1?.id, zoneB2?.id
  ]);
  const leftovers = members.filter(m => !matchedIds.has(m.id));

  let html = `<div class="regional-zonal-hierarchy">`;

  // Branch Region A
  html += `
    <div class="region-branch">
      <div class="region-title-badge">Region A</div>
      <div class="region-head-card">
        ${regA ? buildPublicCard(regA) : '<div class="empty-node">Vacant</div>'}
      </div>
      <div class="zones-row">
        <div class="zone-node">
          <div class="zone-title-badge">Zone A1</div>
          ${zoneA1 ? buildPublicCard(zoneA1) : '<div class="empty-node">Vacant</div>'}
        </div>
        <div class="zone-node">
          <div class="zone-title-badge">Zone A2</div>
          ${zoneA2 ? buildPublicCard(zoneA2) : '<div class="empty-node">Vacant</div>'}
        </div>
      </div>
    </div>
  `;

  // Branch Region B
  html += `
    <div class="region-branch">
      <div class="region-title-badge">Region B</div>
      <div class="region-head-card">
        ${regB ? buildPublicCard(regB) : '<div class="empty-node">Vacant</div>'}
      </div>
      <div class="zones-row">
        <div class="zone-node">
          <div class="zone-title-badge">Zone B1</div>
          ${zoneB1 ? buildPublicCard(zoneB1) : '<div class="empty-node">Vacant</div>'}
        </div>
        <div class="zone-node">
          <div class="zone-title-badge">Zone B2</div>
          ${zoneB2 ? buildPublicCard(zoneB2) : '<div class="empty-node">Vacant</div>'}
        </div>
      </div>
    </div>
  `;

  html += `</div>`;

  if (leftovers.length > 0) {
    html += `
      <div class="directors-leftovers" style="width:100%; margin-top:30px;">
        <h4 style="font-family:var(--font-heading); color:#e8d8c0; text-align:center; font-size:0.9rem; text-transform:uppercase; margin-bottom:15px;">Other Regional/Zonal Staff</h4>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:20px;">
          ${leftovers.map(m => buildPublicCard(m)).join('')}
        </div>
      </div>
    `;
  }

  return html;
}

function renderExecSection(members) {
  const president = members.find(m => m.role.toLowerCase().includes('president') && !m.role.toLowerCase().includes('vice') && !m.role.toLowerCase().includes('past') && !m.role.toLowerCase().includes('assistant'));
  const chairperson = members.find(m => m.role.toLowerCase().includes('chairperson'));
  const vp = members.find(m => m.role.toLowerCase().includes('vice president'));
  const ipdp = members.find(m => m.role.toLowerCase().includes('immediate past'));
  const secretary = members.find(m => m.role.toLowerCase() === 'district secretary');
  const treasurer = members.find(m => m.role.toLowerCase() === 'district treasurer');
  const membership = members.find(m => m.role.toLowerCase().includes('membership'));
  const assistantSecretaries = members.filter(m => m.role.toLowerCase().includes('assistant secretary'));
  const assistantTreasurers = members.filter(m => m.role.toLowerCase().includes('assistant treasurer'));

  const matchedIds = new Set([
    president?.id, chairperson?.id, vp?.id, ipdp?.id, secretary?.id, treasurer?.id, membership?.id,
    ...assistantSecretaries.map(m => m.id),
    ...assistantTreasurers.map(m => m.id)
  ]);
  const leftovers = members.filter(m => !matchedIds.has(m.id));

  let html = `<div class="org-tree">`;
  html += `<div class="org-row row-president">${president ? buildPublicCard(president) : ''}</div>`;
  html += `
    <div class="org-row row-t2">
      <div class="t2-left">${ipdp ? buildPublicCard(ipdp) : ''}</div>
      <div class="t2-center">${chairperson ? buildPublicCard(chairperson) : ''}</div>
      <div class="t2-right">${vp ? buildPublicCard(vp) : ''}</div>
    </div>
  `;
  html += `
    <div class="org-row row-t3">
      <div class="t3-left">${secretary ? buildPublicCard(secretary) : ''}</div>
      <div class="t3-center">${membership ? buildPublicCard(membership) : ''}</div>
      <div class="t3-right">${treasurer ? buildPublicCard(treasurer) : ''}</div>
    </div>
  `;
  html += `
    <div class="org-row row-t4">
      ${assistantSecretaries.map(m => `<div class="t4-item">${buildPublicCard(m)}</div>`).join('')}
      ${assistantTreasurers.map(m => `<div class="t4-item">${buildPublicCard(m)}</div>`).join('')}
    </div>
  `;
  if (leftovers.length > 0) {
    html += `
      <div class="org-row row-leftovers">
        <h4>Other Executive Committee Members</h4>
        <div class="leftovers-grid">
          ${leftovers.map(m => buildPublicCard(m)).join('')}
        </div>
      </div>
    `;
  }
  html += `</div>`;
  return html;
}

function renderChiefSection(members) {
  const pr = members.find(m => m.role.toLowerCase().includes('pr') || m.role.toLowerCase().includes('branding'));
  const it = members.find(m => m.role.toLowerCase().includes('it'));
  const editor = members.find(m => m.role.toLowerCase().includes('editor'));
  const council = members.find(m => m.role.toLowerCase().includes('council coordinator'));
  const regional = members.find(m => m.role.toLowerCase().includes('regional coordinator'));
  const operational = members.find(m => m.role.toLowerCase().includes('operational coordinator'));
  const performance = members.find(m => m.role.toLowerCase().includes('performance coordinator'));

  const matchedIds = new Set([
    pr?.id, it?.id, editor?.id, council?.id, regional?.id, operational?.id, performance?.id
  ]);
  const leftovers = members.filter(m => !matchedIds.has(m.id));
  const chiefs = [council, regional, operational, performance, it, pr, editor].filter(Boolean);

  let html = `<div class="chief-row">`;
  chiefs.forEach(c => {
    html += `<div class="chief-item">${buildPublicCard(c)}</div>`;
  });
  html += `</div>`;

  if (leftovers.length > 0) {
    html += `
      <div class="chief-leftovers">
        <h4>Other Chief Coordinators</h4>
        <div class="leftovers-grid">
          ${leftovers.map(m => buildPublicCard(m)).join('')}
        </div>
      </div>
    `;
  }
  return html;
}

function buildPublicCard(m) {
  const presClass = m.priority ? ' president-profile' : '';
  const crownHtml = m.priority ? '<div class="president-crown-badge"><i class="fa-solid fa-crown"></i></div>' : '';
  const tagHtml = m.tag ? `<span class="member-tag">${m.tag}</span>` : '';
  const photoStyle = `style="transform: scale(${m.photoScale || 1}); object-position: ${m.photoX || 50}% ${m.photoY || 50}%;"`;
  const photoHtml = m.photo
    ? `<img src="${m.photo}" alt="${m.name}" class="profile-img" ${photoStyle}>`
    : `<div class="profile-icon-fallback"><i class="fa-solid ${m.icon || 'fa-user'}"></i></div>`;

  return `
    <div class="profile-card-wrapper${presClass}" id="wrapper-${m.id}">
      <div class="profile-card-3d glass-panel" id="card-${m.id}">
        <div class="card-shine"></div>
        ${crownHtml}
        <div class="profile-photo-circle ${m.priority ? 'president-circle' : ''}">
          ${photoHtml}
        </div>
        ${tagHtml}
        <h4 class="profile-name">${m.name}</h4>
        <span class="profile-role">${m.role}</span>
      </div>
    </div>`;
}

function filterAllCouncil() {
  renderPublicCouncil();
}

function filterCouncil() {
  renderPublicCouncil();
}

// ── INITIALIZATION ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Render immediately from local cache
  renderPublicCouncil();

  // Async sync in background
  syncFromSupabase('council').then(updated => {
    if (updated) renderPublicCouncil();
  });

  const searchInput = document.getElementById('council-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderPublicCouncil);
  }
});
