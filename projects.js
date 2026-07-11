// ═══════════════════════════════════════════════════════════
//  LEO DISTRICT 306 D1 — DISTRICT PROJECTS PAGE ENGINE
// ═══════════════════════════════════════════════════════════

function renderPublicProjects(activeCat = 'all') {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const projects = getCollection(STORAGE_KEYS.PROJECTS)
    .filter(p => p.publicationStatus === 'Published')
    .sort((a,b) => a.displayOrder - b.displayOrder);

  // Style active button category
  const buttons = document.querySelectorAll('.btn-project-filter');
  buttons.forEach(btn => {
    const fnAttr = btn.getAttribute('onclick');
    if (fnAttr && fnAttr.includes(activeCat)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  let list = activeCat === 'all' ? projects : projects.filter(p => p.category === activeCat);

  if (list.length === 0) {
    grid.innerHTML = `<div class="no-results glass-panel"><i class="fa-solid fa-face-frown"></i> No district projects registered in this category.</div>`;
    return;
  }

  list.forEach(p => {
    const card = document.createElement('div');
    card.className = `project-card glass-panel reveal ${p.status.toLowerCase()}`;
    
    let catIcon = 'fa-circle-info';
    if (p.category === 'vision') catIcon = 'fa-eye';
    if (p.category === 'hunger') catIcon = 'fa-bowl-food';
    if (p.category === 'environment') catIcon = 'fa-tree';
    if (p.category === 'youth') catIcon = 'fa-child';

    const coverHtml = p.coverImage 
      ? `<div class="project-cover-banner" style="background-image: url('${p.coverImage}')"></div>` 
      : '';

    card.innerHTML = `
      ${coverHtml}
      <div class="project-header">
        <span class="project-tag"><i class="fa-solid ${catIcon}"></i> ${p.category.toUpperCase()}</span>
        <span class="project-status ${p.status.toLowerCase()}">${p.status}</span>
      </div>
      <h3>${p.title}</h3>
      <p class="project-desc">${p.desc}</p>
      
      <div class="project-stats-container">
        <div class="project-stats-row">
          <span>Venue / Timeline</span>
          <span class="highlight">${p.venue} &bull; ${p.date}</span>
        </div>
      </div>
      
      <div class="project-leader">
        <div class="leader-avatar"><i class="fa-solid fa-user-shield"></i></div>
        <div>
          <span>Campaign Lead</span>
          <strong>${p.chairperson}</strong>
        </div>
      </div>
      
      <button class="btn-project-detail" onclick="openPublicProjectDossier('${p.id}')">Learn More</button>
    `;
    grid.appendChild(card);
  });
  revealElements();
}

function openPublicProjectDossier(id) {
  const p = getCollection(STORAGE_KEYS.PROJECTS).find(item => item.id === id);
  if (!p) return;
  
  let registerBtn = p.registrationLink ? `<a href="${p.registrationLink}" target="_blank" class="btn-primary" style="text-decoration:none; text-align:center;">Register Now</a>` : '';
  let reportBtn = p.reportLink ? `<a href="${p.reportLink}" target="_blank" class="btn-secondary" style="text-decoration:none; text-align:center;">View Project Report</a>` : '';

  // Show detailed dynamic modal drawer
  const dialog = document.createElement('div');
  dialog.className = 'modal-overlay active';
  dialog.innerHTML = `
    <div class="modal-content glass-panel" onclick="event.stopPropagation()" style="max-width: 580px;">
      <button class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      <h3 class="gradient-text"><i class="fa-solid fa-folder-open"></i> Project Dossier</h3>
      <h4 style="margin-top: 15px; font-size:1.3rem; color:#fff;">${p.title}</h4>
      <p style="color:#9e8070; font-size:0.8rem; margin-bottom: 20px;">Category: ${p.category.toUpperCase()} &bull; Status: ${p.status}</p>
      
      <div style="font-size:0.88rem; color:#e8d8c0; display:flex; flex-direction:column; gap:12px; margin-bottom: 25px;">
        <p><strong>Description:</strong><br>${p.desc}</p>
        <p><strong>Objectives:</strong><br>${p.objectives}</p>
        <p><strong>Schedule:</strong> ${p.date} &bull; ${p.time}</p>
        <p><strong>Location:</strong> ${p.venue}</p>
        <p><strong>Chairperson:</strong> ${p.chairperson} (${p.organizingCommittee})</p>
        <p><strong>Partnering Orgs:</strong> ${p.partnerOrganizations || 'None'}</p>
      </div>
      
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
        ${registerBtn}
        ${reportBtn}
      </div>
    </div>
  `;
  dialog.addEventListener('click', () => dialog.remove());
  document.body.appendChild(dialog);
}

function filterProjects(cat) {
  renderPublicProjects(cat);
}

// ── INITIALIZATION ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  // Sync projects from Supabase
  await syncFromSupabase('projects');
  renderPublicProjects();
});
