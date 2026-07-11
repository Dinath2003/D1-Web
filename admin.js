// ═══════════════════════════════════════════════════════════
//  LEO DISTRICT 306 D1 — CABINET ADMIN PANEL ENGINE
// ═══════════════════════════════════════════════════════════

let editorActiveSection = '';
let editingRecordId = null;
let editorImageCache = {};

const DEFAULT_USERS = {
  superadmin: 'admin123',
  contentadmin: 'admin123',
  districtadmin: 'admin123',
  vieweradmin: 'admin123'
};

function getModuleName(section) {
  if (section === 'council') return 'council';
  if (section === 'projects') return 'projects';
  if (section === 'presidents') return 'clubPresidents';
  if (section === 'clubs') return 'clubsDirectory';
  if (section === 'blogs') return 'blogs';
  if (section === 'users') return 'userAccounts';
  if (section === 'logos-manage') return 'pdpLogos';
  if (section === 'club-logos-manage') return 'clubLogos';
  return null;
}

// ── ADMIN VIEW BOARD RENDERING ──────────────────────────────

function renderAdminDashboard() {
  // Update overview panel count widgets
  const counts = {
    'stat-count-council': getCollection(STORAGE_KEYS.COUNCIL).length,
    'stat-count-projects': getCollection(STORAGE_KEYS.PROJECTS).length,
    'stat-count-presidents': getCollection(STORAGE_KEYS.PRESIDENTS).length,
    'stat-count-clubs': getCollection(STORAGE_KEYS.CLUBS).length,
    'stat-count-governors': getCollection(STORAGE_KEYS.GOVERNORS).length,
    'stat-count-blogs': getCollection(STORAGE_KEYS.BLOGS).length
  };

  Object.keys(counts).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = counts[id];
  });

  // Render recent logs in overview dashboard
  const logs = getCollection(STORAGE_KEYS.LOGS).slice(0, 5);
  const logContainer = document.getElementById('admin-recent-logs-body');
  if (logContainer) {
    logContainer.innerHTML = logs.map(l => `
      <tr>
        <td style="font-size:0.75rem; color:#9e8070;">${l.timestamp}</td>
        <td style="font-weight:600;"><span class="role-badge ${l.role.toLowerCase().replace(/\s+/g, '')}">${l.role}</span></td>
        <td>${l.action}</td>
      </tr>
    `).join('');
  }

  // Populate actual list management tables
  const sections = ['council', 'projects', 'presidents', 'clubs', 'governors', 'blogs', 'users', 'logos-manage', 'club-logos-manage'];
  sections.forEach(sec => renderAdminTable(sec));

  // Render Supabase Settings connection status indicators
  renderSupabaseSettings();
}

function switchAdminTab(tabId) {
  const tabs = document.querySelectorAll('.admin-tab-content');
  const items = document.querySelectorAll('.admin-nav-item');
  
  tabs.forEach(tab => {
    if (tab.id === `admin-tab-${tabId}`) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  items.forEach(item => {
    if (item.id === `tab-nav-${tabId}`) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  if (tabId === 'logs') {
    renderAdminLogsTable();
  }
}

function renderAdminTable(section) {
  const container = document.getElementById(`admin-table-${section}`);
  if (!container) return;
  container.innerHTML = '';

  let key = '';
  if (section === 'council') key = STORAGE_KEYS.COUNCIL;
  if (section === 'projects') key = STORAGE_KEYS.PROJECTS;
  if (section === 'presidents') key = STORAGE_KEYS.PRESIDENTS;
  if (section === 'clubs') key = STORAGE_KEYS.CLUBS;
  if (section === 'governors') key = STORAGE_KEYS.GOVERNORS;
  if (section === 'blogs') key = STORAGE_KEYS.BLOGS;
  if (section === 'users') key = STORAGE_KEYS.USERS;
  if (section === 'logos-manage') key = STORAGE_KEYS.LOGOS;
  if (section === 'club-logos-manage') key = STORAGE_KEYS.CLUB_LOGOS;

  let list = getCollection(key);

  // Apply filters
  const searchInput = document.getElementById(`admin-search-${section}`);
  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

  if (section === 'council') {
    const yearFilter = document.getElementById('admin-filter-year-council').value;
    if (yearFilter !== 'all') list = list.filter(m => m.year === yearFilter);
    if (q) list = list.filter(m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q));
    list.sort((a,b) => a.displayOrder - b.displayOrder);
  }
  else if (section === 'projects') {
    const statusFilter = document.getElementById('admin-filter-status-projects').value;
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
    if (q) list = list.filter(p => p.title.toLowerCase().includes(q) || p.chairperson.toLowerCase().includes(q));
    list.sort((a,b) => a.displayOrder - b.displayOrder);
  }
  else if (section === 'presidents') {
    const yearFilter = document.getElementById('admin-filter-year-presidents').value;
    if (yearFilter !== 'all') list = list.filter(p => p.year === yearFilter);
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.clubName.toLowerCase().includes(q));
    list.sort((a,b) => a.displayOrder - b.displayOrder);
  }
  else if (section === 'clubs') {
    const statusFilter = document.getElementById('admin-filter-status-clubs').value;
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
    if (q) list = list.filter(c => c.name.toLowerCase().includes(q) || c.sponsor.toLowerCase().includes(q));
    list.sort((a,b) => a.displayOrder - b.displayOrder);
  }
  else if (section === 'governors') {
    const statusFilter = document.getElementById('admin-filter-status-governors').value;
    if (statusFilter !== 'all') list = list.filter(g => g.status === statusFilter);
    if (q) list = list.filter(g => g.name.toLowerCase().includes(q) || g.year.toLowerCase().includes(q) || g.theme.toLowerCase().includes(q));
    list.sort((a,b) => a.displayOrder - b.displayOrder);
  }
  else if (section === 'blogs') {
    const statusFilter = document.getElementById('admin-filter-status-blogs').value;
    if (statusFilter !== 'all') list = list.filter(b => b.status === statusFilter);
    if (q) list = list.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    list.sort((a,b) => a.displayOrder - b.displayOrder);
  }
  else if (section === 'users') {
    if (q) list = list.filter(u => u.username.toLowerCase().includes(q) || u.label.toLowerCase().includes(q));
  }
  else if (section === 'logos-manage' || section === 'club-logos-manage') {
    if (q) list = list.filter(l => l.name.toLowerCase().includes(q));
    list.sort((a,b) => a.displayOrder - b.displayOrder);
  }

  if (list.length === 0) {
    const colSpan = container.parentElement.querySelectorAll('thead th').length;
    container.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; padding: 30px; color:#9e8070;"><i class="fa-solid fa-folder-open" style="font-size:1.5rem; display:block; margin-bottom:8px;"></i> No records found.</td></tr>`;
    return;
  }

  list.forEach(item => {
    let rowHtml = '';

    if (section === 'council') {
      const img = item.photo ? `<img src="${item.photo}" class="table-img-round">` : `<div class="table-icon-round"><i class="fa-solid fa-user"></i></div>`;
      rowHtml = `
        <td>${img}</td>
        <td style="font-weight:600;">${item.name}</td>
        <td>${item.role}</td>
        <td>${item.year}</td>
        <td><span class="status-badge-inline ${item.status.toLowerCase()}">${item.status}</span></td>
        <td>${item.displayOrder}</td>
      `;
    }
    else if (section === 'projects') {
      const img = item.coverImage ? `<img src="${item.coverImage}" class="table-img-rect">` : `<div class="table-icon-rect"><i class="fa-solid fa-image"></i></div>`;
      rowHtml = `
        <td>${img}</td>
        <td style="font-weight:600;">${item.title}</td>
        <td><span class="category-pill">${item.category.toUpperCase()}</span></td>
        <td>${item.chairperson}</td>
        <td><span class="status-badge-inline ${item.status.toLowerCase()}">${item.status}</span></td>
        <td>${item.displayOrder}</td>
      `;
    }
    else if (section === 'presidents') {
      const img = item.photo ? `<img src="${item.photo}" class="table-img-round">` : `<div class="table-icon-round"><i class="fa-solid fa-user-astronaut"></i></div>`;
      rowHtml = `
        <td>${img}</td>
        <td style="font-weight:600;">${item.name}</td>
        <td>${item.clubName}</td>
        <td>${item.year}</td>
        <td><span class="status-badge-inline ${item.status.toLowerCase()}">${item.status}</span></td>
        <td>${item.displayOrder}</td>
      `;
    }
    else if (section === 'clubs') {
      const img = item.logo ? `<img src="${item.logo}" class="table-img-round">` : `<div class="table-icon-round"><i class="fa-solid fa-shield-halved text-gold"></i></div>`;
      rowHtml = `
        <td>${img}</td>
        <td style="font-weight:600;">${item.name}</td>
        <td>${item.sponsor}</td>
        <td>${item.members}</td>
        <td><span class="status-badge-inline ${item.status.toLowerCase()}">${item.status}</span></td>
        <td>${item.displayOrder}</td>
      `;
    }
    else if (section === 'governors') {
      const img = item.photo ? `<img src="${item.photo}" class="table-img-round">` : `<div class="table-icon-round"><i class="fa-solid fa-user-tie"></i></div>`;
      rowHtml = `
        <td>${img}</td>
        <td>${item.year}</td>
        <td style="font-weight:600;">${item.name}</td>
        <td>${item.theme || 'None'}</td>
        <td><code>${item.logo || 'fa-scroll'}</code></td>
        <td><span class="status-badge-inline ${item.status.toLowerCase()}">${item.status}</span></td>
        <td>${item.displayOrder}</td>
      `;
    }
    else if (section === 'blogs') {
      const img = item.photo ? `<img src="${item.photo}" class="table-img-rect">` : `<div class="table-icon-rect"><i class="fa-solid fa-blog"></i></div>`;
      rowHtml = `
        <td>${img}</td>
        <td>${item.date}</td>
        <td style="font-weight:600;">${item.title}</td>
        <td>${item.author}</td>
        <td><span class="status-badge-inline ${item.status.toLowerCase()}">${item.status}</span></td>
        <td>${item.displayOrder}</td>
      `;
    }
    else if (section === 'users') {
      rowHtml = `
        <td style="font-weight:600; color:var(--color-gold);">@${item.username}</td>
        <td>${item.label}</td>
        <td><span class="role-badge blogeditor">${item.role}</span></td>
        <td><code style="filter: blur(4px); transition: filter 0.3s;" onclick="this.style.filter='none'">value:${item.password}</code></td>
      `;
    }
    else if (section === 'logos-manage' || section === 'club-logos-manage') {
      const img = item.image ? `<img src="${item.image}" class="table-img-round">` : `<div class="table-icon-round"><i class="fa-solid fa-images"></i></div>`;
      rowHtml = `
        <td>${img}</td>
        <td style="font-weight:600;">${item.name}</td>
        <td><span class="status-badge-inline ${item.status.toLowerCase()}">${item.status}</span></td>
        <td>${item.displayOrder}</td>
      `;
    }

    // Append CRUD Action controls
    let actionsHtml = '';
    if (section === 'users') {
      actionsHtml = `
        <td>
          <button class="btn-action edit" onclick="editRecord('${section}', '${item.id || item.username}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn-action delete" onclick="deleteRecord('${section}', '${item.id || item.username}')"><i class="fa-solid fa-trash-can"></i></button>
        </td>
      `;
    } else {
      actionsHtml = `
        <td>
          <button class="btn-action order-up" onclick="swapOrder('${section}', '${item.id}', -1)"><i class="fa-solid fa-arrow-up"></i></button>
          <button class="btn-action order-down" onclick="swapOrder('${section}', '${item.id}', 1)"><i class="fa-solid fa-arrow-down"></i></button>
          <button class="btn-action edit" onclick="editRecord('${section}', '${item.id}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="btn-action delete" onclick="deleteRecord('${section}', '${item.id}')"><i class="fa-solid fa-trash-can"></i></button>
        </td>
      `;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = rowHtml + actionsHtml;
    container.appendChild(tr);
  });
}

function renderAdminLogsTable() {
  const container = document.getElementById('admin-table-logs-body');
  if (!container) return;
  container.innerHTML = '';

  const logs = getCollection(STORAGE_KEYS.LOGS);

  if (logs.length === 0) {
    container.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px; color:#9e8070;"><i class="fa-solid fa-clipboard-list" style="font-size:1.5rem; display:block; margin-bottom:8px;"></i> Logs database empty.</td></tr>`;
    return;
  }

  logs.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-size:0.78rem; color:#9e8070;">${l.timestamp}</td>
      <td><strong>${l.userId}</strong></td>
      <td><span class="role-badge ${l.role.toLowerCase().replace(/\s+/g, '')}">${l.role}</span></td>
      <td>${l.action}</td>
    `;
    container.appendChild(tr);
  });
}

function clearActivityLogs() {
  if (!currentUser || currentUser.role !== 'superadmin') {
    alert('Security Violation: Only Super Administrator possesses privileges to clear audit logs.');
    return;
  }
  if (!confirm('Are you absolutely sure you want to flush all system logs? This action is permanent.')) return;
  
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  logActivity('Flushed system activity logs.');
  renderAdminLogsTable();
}

// ── EDITOR MODALS ACTIONS ───────────────────────────────────

function openEditorModal(section, recordId = null) {
  // Validate RBAC permissions before opening forms
  if (currentUser.role === 'vieweradmin') {
    alert('Security Exception: Viewer Admin has read-only access. Form is disabled.');
    return;
  }

  // Specific section checks
  if (section === 'council' && !checkPermission('edit_council')) {
    alert('Access Denied: Your admin role does not permit modifying Council Officers.');
    return;
  }
  if (section === 'projects' && !checkPermission('edit_projects')) {
    alert('Access Denied: Your admin role does not permit modifying Projects.');
    return;
  }
  if (section === 'presidents' && !checkPermission('edit_presidents')) {
    alert('Access Denied: Your admin role does not permit modifying Presidents.');
    return;
  }
  if (section === 'clubs' && !checkPermission('edit_clubs')) {
    alert('Access Denied: Your admin role does not permit modifying Clubs.');
    return;
  }
  if (section === 'governors' && !checkPermission('edit_council')) {
    alert('Access Denied: Your admin role does not permit modifying Past District Presidents.');
    return;
  }
  if (section === 'blogs' && !checkPermission('edit_projects')) {
    alert('Access Denied: Your admin role does not permit modifying District Blogs.');
    return;
  }
  if (section !== 'blogs' && currentUser.role === 'blog_editor') {
    alert('Security Violation: Blog Editors are restricted to managing blog posts.');
    return;
  }
  if (section === 'users' && (!currentUser || currentUser.role !== 'superadmin')) {
    alert('Access Denied: Only Super Admin can register or modify user accounts.');
    return;
  }
  if (section === 'logos-manage' && (!currentUser || currentUser.role !== 'superadmin')) {
    alert('Access Denied: Only Super Admin can register or modify PDP logos.');
    return;
  }
  if (section === 'club-logos-manage' && (!currentUser || currentUser.role !== 'superadmin')) {
    alert('Access Denied: Only Super Admin can register or modify Club logos.');
    return;
  }

  editorActiveSection = section;
  editingRecordId = recordId;
  editorImageCache = {};

  const modal = document.getElementById('editor-modal');
  const title = document.getElementById('editor-title');
  const form = document.getElementById('editor-form');
  if (!modal || !form) return;

  let displayLabel = section.toUpperCase();
  if (section === 'governors') displayLabel = 'PAST DISTRICT PRESIDENT';
  if (section === 'blogs') displayLabel = 'DISTRICT BLOG';
  if (section === 'users') displayLabel = 'USER ACCOUNT';
  if (section === 'logos-manage') displayLabel = 'PDP LOGO';
  if (section === 'club-logos-manage') displayLabel = 'CLUB LOGO';
  title.innerText = recordId ? `Edit ${displayLabel} Record` : `Add New ${displayLabel} Record`;
  
  let key = '';
  if (section === 'council') key = STORAGE_KEYS.COUNCIL;
  if (section === 'projects') key = STORAGE_KEYS.PROJECTS;
  if (section === 'presidents') key = STORAGE_KEYS.PRESIDENTS;
  if (section === 'clubs') key = STORAGE_KEYS.CLUBS;
  if (section === 'governors') key = STORAGE_KEYS.GOVERNORS;
  if (section === 'blogs') key = STORAGE_KEYS.BLOGS;
  if (section === 'users') key = STORAGE_KEYS.USERS;
  if (section === 'logos-manage') key = STORAGE_KEYS.LOGOS;
  if (section === 'club-logos-manage') key = STORAGE_KEYS.CLUB_LOGOS;

  const records = getCollection(key);
  const data = recordId ? records.find(r => r.id === recordId) : {};

  // Build inputs dynamically
  let html = '';

  if (section === 'council') {
    html = `
      <div class="form-row">
        <div class="input-group">
          <label>Full Name *</label>
          <input type="text" id="c-name" value="${data.name || ''}" required>
        </div>
        <div class="input-group">
          <label>Designation / Role *</label>
          <input type="text" id="c-role" placeholder="e.g. Zonal Director" value="${data.role || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Committee / Department</label>
          <input type="text" id="c-tag" placeholder="e.g. Zone A1, IT, Sports" value="${data.tag || ''}">
        </div>
        <div class="input-group">
          <label>Role Class Type *</label>
          <select id="c-type">
            <option value="exec" ${data.type === 'exec' ? 'selected' : ''}>Executive Committee</option>
            <option value="chief" ${data.type === 'chief' ? 'selected' : ''}>Chief Coordinator</option>
            <option value="directors" ${data.type === 'directors' ? 'selected' : ''}>Director</option>
            <option value="officers" ${data.type === 'officers' ? 'selected' : ''}>Officer</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Profile Image File</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'photo')">
        </div>
        <div class="input-group">
          <label>Status</label>
          <select id="c-status">
            <option value="Published" ${data.status === 'Published' ? 'selected' : ''}>Published</option>
            <option value="Draft" ${data.status === 'Draft' ? 'selected' : ''}>Draft</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Year Term *</label>
          <select id="c-year">
            <option value="2026/2027" ${data.year === '2026/2027' ? 'selected' : ''}>2026/2027</option>
            <option value="2025/2026" ${data.year === '2025/2026' ? 'selected' : ''}>2025/2026</option>
            <option value="2027/2028" ${data.year === '2027/2028' ? 'selected' : ''}>2027/2028</option>
          </select>
        </div>
        <div class="input-group">
          <label>Display Order Priority *</label>
          <input type="number" id="c-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
      </div>
      
      <!-- Image Crop & Positioning Widget -->
      <div id="image-adjust-widget" class="glass-panel" style="display: ${data.photo ? 'flex' : 'none'}; padding: 15px; margin: 15px 0; border-radius: 12px; gap: 15px; align-items: center; border: 1px solid rgba(255,255,255,0.08);">
        <div style="width: 90px; height: 90px; border-radius: 16px; overflow: hidden; border: 2px solid var(--color-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.4);">
          <img id="crop-preview-img" src="${data.photo || ''}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(${data.photoScale || 1}); object-position: ${data.photoX || 50}% ${data.photoY || 50}%;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
          <h5 style="font-family:var(--font-heading); color: #fff; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px;">Position & Zoom adjustment</h5>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Zoom</label>
            <input type="range" id="crop-zoom" min="1" max="2.5" step="0.05" value="${data.photoScale || 1}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan X</label>
            <input type="range" id="crop-x" min="0" max="100" step="1" value="${data.photoX || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan Y</label>
            <input type="range" id="crop-y" min="0" max="100" step="1" value="${data.photoY || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
        </div>
      </div>
    `;
  } 
  else if (section === 'projects') {
    html = `
      <div class="form-row">
        <div class="input-group">
          <label>Project Title *</label>
          <input type="text" id="p-title" value="${data.title || ''}" required>
        </div>
        <div class="input-group">
          <label>Category *</label>
          <select id="p-category">
            <option value="youth" ${data.category === 'youth' ? 'selected' : ''}>Youth</option>
            <option value="hunger" ${data.category === 'hunger' ? 'selected' : ''}>Hunger</option>
            <option value="environment" ${data.category === 'environment' ? 'selected' : ''}>Environment</option>
            <option value="vision" ${data.category === 'vision' ? 'selected' : ''}>Vision</option>
            <option value="other" ${data.category === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Project Lead Chairperson *</label>
          <input type="text" id="p-chair" value="${data.chairperson || ''}" required>
        </div>
        <div class="input-group">
          <label>Organizing Committee</label>
          <input type="text" id="p-committee" value="${data.organizingCommittee || ''}">
        </div>
      </div>
      <div class="input-group">
        <label>Description *</label>
        <textarea id="p-desc" required>${data.desc || ''}</textarea>
      </div>
      <div class="input-group">
        <label>Objectives</label>
        <textarea id="p-objectives">${data.objectives || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Date *</label>
          <input type="date" id="p-date" value="${data.date || ''}" required>
        </div>
        <div class="input-group">
          <label>Time</label>
          <input type="text" placeholder="e.g. 09:00 AM" id="p-time" value="${data.time || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Venue *</label>
          <input type="text" id="p-venue" value="${data.venue || ''}" required>
        </div>
        <div class="input-group">
          <label>Cover Banner Image</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'cover')">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Registration Link</label>
          <input type="text" placeholder="https://..." id="p-reglink" value="${data.registrationLink || ''}">
        </div>
        <div class="input-group">
          <label>Report Link</label>
          <input type="text" placeholder="https://..." id="p-replink" value="${data.reportLink || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Partner Organizations</label>
          <input type="text" placeholder="Co-partners" id="p-partners" value="${data.partnerOrganizations || ''}">
        </div>
        <div class="input-group">
          <label>Display Order *</label>
          <input type="number" id="p-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Project Status</label>
          <select id="p-status">
            <option value="Upcoming" ${data.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
            <option value="Ongoing" ${data.status === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
            <option value="Completed" ${data.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
        <div class="input-group">
          <label>Publication Status</label>
          <select id="p-pubstatus">
            <option value="Published" ${data.publicationStatus === 'Published' ? 'selected' : ''}>Published</option>
            <option value="Draft" ${data.publicationStatus === 'Draft' ? 'selected' : ''}>Draft</option>
          </select>
        </div>
      </div>
    `;
  }
  else if (section === 'presidents') {
    html = `
      <div class="form-row">
        <div class="input-group">
          <label>Full Name *</label>
          <input type="text" id="pr-name" value="${data.name || ''}" required>
        </div>
        <div class="input-group">
          <label>Leo Club Name *</label>
          <input type="text" id="pr-club" value="${data.clubName || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Designation *</label>
          <input type="text" id="pr-pos" value="${data.position || 'Club President'}" required>
        </div>
        <div class="input-group">
          <label>Year Term *</label>
          <select id="pr-year">
            <option value="2026/2027" ${data.year === '2026/2027' ? 'selected' : ''}>2026/2027</option>
            <option value="2025/2026" ${data.year === '2025/2026' ? 'selected' : ''}>2025/2026</option>
            <option value="2027/2028" ${data.year === '2027/2028' ? 'selected' : ''}>2027/2028</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Region / Area</label>
          <input type="text" id="pr-region" value="${data.region || ''}">
        </div>
        <div class="input-group">
          <label>Profile Image File</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'photo')">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Contact Number</label>
          <input type="text" id="pr-phone" value="${data.phone || ''}">
        </div>
        <div class="input-group">
          <label>Email Address</label>
          <input type="email" id="pr-email" value="${data.email || ''}">
        </div>
      </div>
      <div class="input-group">
        <label>Short Bio Description</label>
        <textarea id="pr-bio">${data.bio || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Display Order *</label>
          <input type="number" id="pr-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
        <div class="input-group">
          <label>Status</label>
          <select id="pr-status">
            <option value="Active" ${data.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${data.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>

      <!-- Image Crop & Positioning Widget -->
      <div id="image-adjust-widget" class="glass-panel" style="display: ${data.photo ? 'flex' : 'none'}; padding: 15px; margin: 15px 0; border-radius: 12px; gap: 15px; align-items: center; border: 1px solid rgba(255,255,255,0.08);">
        <div style="width: 90px; height: 90px; border-radius: 16px; overflow: hidden; border: 2px solid var(--color-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.4);">
          <img id="crop-preview-img" src="${data.photo || ''}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(${data.photoScale || 1}); object-position: ${data.photoX || 50}% ${data.photoY || 50}%;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
          <h5 style="font-family:var(--font-heading); color: #fff; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px;">Position & Zoom adjustment</h5>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Zoom</label>
            <input type="range" id="crop-zoom" min="1" max="2.5" step="0.05" value="${data.photoScale || 1}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan X</label>
            <input type="range" id="crop-x" min="0" max="100" step="1" value="${data.photoX || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan Y</label>
            <input type="range" id="crop-y" min="0" max="100" step="1" value="${data.photoY || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
        </div>
      </div>
    `;
  }
  else if (section === 'clubs') {
    html = `
      <div class="form-row">
        <div class="input-group">
          <label>Leo Club Name *</label>
          <input type="text" id="cl-name" value="${data.name || ''}" required>
        </div>
        <div class="input-group">
          <label>Sponsoring Lions Club *</label>
          <input type="text" id="cl-sponsor" value="${data.sponsor || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Region / Area *</label>
          <input type="text" placeholder="e.g. Region 3" id="cl-region" value="${data.region || ''}" required>
        </div>
        <div class="input-group">
          <label>Chartered Date *</label>
          <input type="date" id="cl-charter" value="${data.charteredDate || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>President Name *</label>
          <input type="text" id="cl-pres" value="${data.president || ''}" required>
        </div>
        <div class="input-group">
          <label>Secretary Name</label>
          <input type="text" id="cl-sec" value="${data.secretary || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Treasurer Name</label>
          <input type="text" id="cl-treas" value="${data.treasurer || ''}">
        </div>
        <div class="input-group">
          <label>Lions Club Advisor Name</label>
          <input type="text" id="cl-advisor" value="${data.advisor || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Club Contact Email</label>
          <input type="email" id="cl-email" value="${data.email || ''}">
        </div>
        <div class="input-group">
          <label>Contact Phone</label>
          <input type="text" id="cl-phone" value="${data.phone || ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Club Logo</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'logo')">
        </div>
        <div class="input-group">
          <label>Club Banner</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'banner')">
        </div>
      </div>
      <div class="input-group">
        <label>Club Description</label>
        <textarea id="cl-desc">${data.desc || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Active Members Count *</label>
          <input type="number" id="cl-members" value="${data.members || 20}" required>
        </div>
        <div class="input-group">
          <label>Display Order *</label>
          <input type="number" id="cl-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
      </div>
      <div class="input-group">
        <label>Status</label>
        <select id="cl-status">
          <option value="Active" ${data.status === 'Active' ? 'selected' : ''}>Active</option>
          <option value="Inactive" ${data.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
        </select>
      </div>
    `;
  }
  else if (section === 'governors') {
    html = `
      <div class="form-row">
        <div class="input-group">
          <label>Full Name *</label>
          <input type="text" id="g-name" value="${data.name || ''}" required>
        </div>
        <div class="input-group">
          <label>Year Term *</label>
          <input type="text" placeholder="e.g. 2024/2025" id="g-year" value="${data.year || ''}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Theme / Home Club *</label>
          <input type="text" id="g-theme" value="${data.theme || ''}" required>
        </div>
        <div class="input-group">
          <label>Theme Icon (FontAwesome class name) *</label>
          <input type="text" placeholder="e.g. fa-sun, fa-heart" id="g-logo" value="${data.logo || 'fa-scroll'}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Profile Image File</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'photo')">
        </div>
      </div>
      <div class="input-group">
        <label>Key Achievement (Optional)</label>
        <textarea id="g-achievement">${data.achievement || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Display Order *</label>
          <input type="number" id="g-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
        <div class="input-group">
          <label>Status</label>
          <select id="g-status">
            <option value="Active" ${data.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${data.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>

      <!-- Image Crop & Positioning Widget -->
      <div id="image-adjust-widget" class="glass-panel" style="display: ${data.photo ? 'flex' : 'none'}; padding: 15px; margin: 15px 0; border-radius: 12px; gap: 15px; align-items: center; border: 1px solid rgba(255,255,255,0.08);">
        <div style="width: 90px; height: 90px; border-radius: 16px; overflow: hidden; border: 2px solid var(--color-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.4);">
          <img id="crop-preview-img" src="${data.photo || ''}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(${data.photoScale || 1}); object-position: ${data.photoX || 50}% ${data.photoY || 50}%;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
          <h5 style="font-family:var(--font-heading); color: #fff; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px;">Position & Zoom adjustment</h5>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Zoom</label>
            <input type="range" id="crop-zoom" min="1" max="2.5" step="0.05" value="${data.photoScale || 1}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan X</label>
            <input type="range" id="crop-x" min="0" max="100" step="1" value="${data.photoX || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan Y</label>
            <input type="range" id="crop-y" min="0" max="100" step="1" value="${data.photoY || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
        </div>
      </div>
    `;
  }
  else if (section === 'blogs') {
    html = `
      <div class="input-group">
        <label>Blog Title *</label>
        <input type="text" id="b-title" value="${data.title || ''}" required style="font-size:1.1rem; font-weight:600;">
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Author / Publisher *</label>
          <input type="text" id="b-author" value="${data.author || 'District Editorial Panel'}" required>
        </div>
        <div class="input-group">
          <label>Publish Date *</label>
          <input type="date" id="b-date" value="${data.date || new Date().toISOString().split('T')[0]}" required>
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Cover Photo File</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'photo')">
        </div>
      </div>
      <div class="input-group">
        <label>Article Content *</label>
        <textarea id="b-content" required style="height: 180px;">${data.content || ''}</textarea>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Display Order *</label>
          <input type="number" id="b-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
        <div class="input-group">
          <label>Status</label>
          <select id="b-status">
            <option value="Active" ${data.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${data.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>

      <!-- Image Crop & Positioning Widget -->
      <div id="image-adjust-widget" class="glass-panel" style="display: ${data.photo ? 'flex' : 'none'}; padding: 15px; margin: 15px 0; border-radius: 12px; gap: 15px; align-items: center; border: 1px solid rgba(255,255,255,0.08);">
        <div style="width: 120px; height: 75px; border-radius: 12px; overflow: hidden; border: 2px solid var(--color-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.4);">
          <img id="crop-preview-img" src="${data.photo || ''}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(${data.photoScale || 1}); object-position: ${data.photoX || 50}% ${data.photoY || 50}%;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
          <h5 style="font-family:var(--font-heading); color: #fff; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px;">Position & Zoom adjustment</h5>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Zoom</label>
            <input type="range" id="crop-zoom" min="1" max="2.5" step="0.05" value="${data.photoScale || 1}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan X</label>
            <input type="range" id="crop-x" min="0" max="100" step="1" value="${data.photoX || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan Y</label>
            <input type="range" id="crop-y" min="0" max="100" step="1" value="${data.photoY || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
        </div>
      </div>
    `;
  }
  else if (section === 'users') {
    html = `
      <div class="input-group">
        <label>Username *</label>
        <input type="text" id="u-username" value="${data.username || ''}" required placeholder="e.g. janesmith" style="font-size:1.1rem; font-weight:600;" ${recordId ? 'readonly' : ''}>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Password *</label>
          <input type="text" id="u-password" value="${data.password || ''}" required placeholder="e.g. pass123">
        </div>
        <div class="input-group">
          <label>Full Name / Publisher Label *</label>
          <input type="text" id="u-label" value="${data.label || ''}" required placeholder="e.g. Leo Jane Smith">
        </div>
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>User Role *</label>
          <select id="u-role">
            <option value="blog_editor" ${data.role === 'blog_editor' ? 'selected' : ''}>Blog Publisher (blog_editor)</option>
          </select>
        </div>
      </div>
    `;
  }
  else if (section === 'logos-manage' || section === 'club-logos-manage') {
    html = `
      <div class="input-group">
        <label>Logo Name / Label *</label>
        <input type="text" id="logo-name" value="${data.name || ''}" required placeholder="e.g. Logo 1995/1996" style="font-size:1.1rem; font-weight:600;">
      </div>
      <div class="form-row">
        <div class="input-group">
          <label>Logo Image File *</label>
          <input type="file" accept="image/*" onchange="cacheFile(this, 'image')" ${recordId ? '' : 'required'}>
        </div>
      </div>
      
      <!-- Image Crop & Positioning Widget -->
      <div id="image-adjust-widget" class="glass-panel" style="display: ${data.image ? 'flex' : 'none'}; padding: 15px; margin: 15px 0; border-radius: 12px; gap: 15px; align-items: center; border: 1px solid rgba(255,255,255,0.08);">
        <div id="crop-preview-container" style="width: ${data.frameType === 'rectangle' ? '120px' : '75px'}; height: ${data.frameType === 'rectangle' ? '64px' : '75px'}; border-radius: ${data.frameType === 'rectangle' ? '8px' : '50%'}; overflow: hidden; border: 2px solid var(--color-gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.4); transition: all 0.2s ease;">
          <img id="crop-preview-img" src="${data.image || ''}" style="width: 100%; height: 100%; object-fit: cover; transform: scale(${data.photoScale || 1}); object-position: ${data.photoX || 50}% ${data.photoY || 50}%;">
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1;">
          <h5 style="font-family:var(--font-heading); color: #fff; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px;">Position & Zoom adjustment</h5>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Zoom</label>
            <input type="range" id="crop-zoom" min="1" max="2.5" step="0.05" value="${data.photoScale || 1}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan X</label>
            <input type="range" id="crop-x" min="0" max="100" step="1" value="${data.photoX || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 0.7rem; color: #9e8070; width: 60px;">Pan Y</label>
            <input type="range" id="crop-y" min="0" max="100" step="1" value="${data.photoY || 50}" oninput="updateCropPreview()" style="flex-grow: 1; accent-color: var(--color-gold);">
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="input-group">
          <label>Frame Type *</label>
          <select id="logo-frame-type" onchange="updateCropPreviewFrame()">
            <option value="circle" ${data.frameType !== 'rectangle' ? 'selected' : ''}>Circle Frame</option>
            <option value="rectangle" ${data.frameType === 'rectangle' ? 'selected' : ''}>Rectangle Frame</option>
          </select>
        </div>
        <div class="input-group">
          <label>Display Order *</label>
          <input type="number" id="logo-order" value="${data.displayOrder || records.length + 1}" required>
        </div>
        <div class="input-group">
          <label>Status</label>
          <select id="logo-status">
            <option value="Active" ${data.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${data.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>
    `;
  }

  html += `
    <div class="modal-footer-btns">
      <button type="button" class="btn-secondary" onclick="closeEditorModal()" style="margin-right:10px;">Cancel</button>
      <button type="submit" class="btn-primary">Save Changes</button>
    </div>
  `;

  form.innerHTML = html;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function editRecord(section, recordId) {
  openEditorModal(section, recordId);
}

async function deleteRecord(section, recordId) {
  if (currentUser.role === 'vieweradmin') {
    alert('Security Exception: Viewer Admin has read-only access. Actions blocked.');
    return;
  }
  if (section !== 'blogs' && currentUser.role === 'blog_editor') {
    alert('Security Violation: Blog Editors are restricted to managing blog posts.');
    return;
  }
  if (section === 'users' && (!currentUser || currentUser.role !== 'superadmin')) {
    alert('Access Denied: Only Super Admin can register or modify user accounts.');
    return;
  }
  if (section === 'logos-manage' && (!currentUser || currentUser.role !== 'superadmin')) {
    alert('Access Denied: Only Super Admin can register or modify PDP logos.');
    return;
  }
  if (section === 'club-logos-manage' && (!currentUser || currentUser.role !== 'superadmin')) {
    alert('Access Denied: Only Super Admin can register or modify Club logos.');
    return;
  }
  if (!checkPermission('delete')) {
    alert('Security Exception: Content Admins and District Admins do not possess deletion privileges.');
    return;
  }

  if (!confirm(`Are you sure you want to permanently delete this record?`)) return;

  let key = '';
  if (section === 'council') key = STORAGE_KEYS.COUNCIL;
  if (section === 'projects') key = STORAGE_KEYS.PROJECTS;
  if (section === 'presidents') key = STORAGE_KEYS.PRESIDENTS;
  if (section === 'clubs') key = STORAGE_KEYS.CLUBS;
  if (section === 'governors') key = STORAGE_KEYS.GOVERNORS;
  if (section === 'blogs') key = STORAGE_KEYS.BLOGS;
  if (section === 'users') key = STORAGE_KEYS.USERS;
  if (section === 'logos-manage') key = STORAGE_KEYS.LOGOS;
  if (section === 'club-logos-manage') key = STORAGE_KEYS.CLUB_LOGOS;

  let records = getCollection(key);
  const target = records.find(r => (r.id === recordId || r.username === recordId));
  
  // For users, search key is username
  if (section === 'users') {
    records = records.filter(r => r.username !== recordId);
  } else {
    records = records.filter(r => r.id !== recordId);
  }
  
  saveCollection(key, records);
  logActivity(`Deleted ${section} record: ${target ? (target.name || target.title || target.username) : recordId}`);

  // Sync to Supabase
  const moduleName = getModuleName(section);
  if (moduleName && isSupabaseConnected(moduleName)) {
    try {
      await dbDelete(moduleName, recordId);
      console.log(`Deleted record ${recordId} from Supabase database for ${moduleName}.`);
    } catch(err) {
      alert(`Deleted locally, but Supabase sync failed: ${err.message}`);
    }
  }

  renderAdminDashboard();
}

async function swapOrder(section, recordId, direction) {
  if (currentUser.role === 'vieweradmin') {
    alert('Security Exception: Viewer Admin cannot reorder records.');
    return;
  }
  if (section !== 'blogs' && currentUser.role === 'blog_editor') {
    alert('Security Violation: Blog Editors are restricted to managing blog posts.');
    return;
  }
  if (section === 'users') {
    alert('Invalid Action: User accounts cannot be sorted.');
    return;
  }

  let key = '';
  if (section === 'council') key = STORAGE_KEYS.COUNCIL;
  if (section === 'projects') key = STORAGE_KEYS.PROJECTS;
  if (section === 'presidents') key = STORAGE_KEYS.PRESIDENTS;
  if (section === 'clubs') key = STORAGE_KEYS.CLUBS;
  if (section === 'governors') key = STORAGE_KEYS.GOVERNORS;
  if (section === 'blogs') key = STORAGE_KEYS.BLOGS;
  if (section === 'logos-manage') key = STORAGE_KEYS.LOGOS;
  if (section === 'club-logos-manage') key = STORAGE_KEYS.CLUB_LOGOS;

  const records = getCollection(key);
  records.sort((a,b) => a.displayOrder - b.displayOrder);
  
  const idx = records.findIndex(r => r.id === recordId);
  if (idx === -1) return;

  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= records.length) return; // Out of bounds

  // Swap displayOrder values
  const temp = records[idx].displayOrder;
  records[idx].displayOrder = records[targetIdx].displayOrder;
  records[targetIdx].displayOrder = temp;

  saveCollection(key, records);
  logActivity(`Swapped display order priority of ${section} records.`);

  // Sync swapped orders to Supabase
  const moduleName = getModuleName(section);
  if (moduleName && isSupabaseConnected(moduleName)) {
    try {
      await Promise.all([
        dbUpsert(moduleName, records[idx]),
        dbUpsert(moduleName, records[targetIdx])
      ]);
      console.log(`Reordered records synced successfully with Supabase.`);
    } catch(err) {
      console.error('Supabase swap order sync failed:', err);
    }
  }

  renderAdminDashboard();
}

// ── FILE ATTACHMENTS & IMAGE COMPRESSION/CROPPING ──────────

function cacheFile(input, key) {
  if (input.files && input.files[0]) {
    compressImage(input.files[0], (base64) => {
      editorImageCache[key] = base64;
      
      // Update adjustments widgets
      const widget = document.getElementById('image-adjust-widget');
      const preview = document.getElementById('crop-preview-img');
      if (widget && preview) {
        preview.src = base64;
        widget.style.display = 'flex';
      }
    });
  }
}

function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 800; // Constrain resolution to save storage
      let w = img.width;
      let h = img.height;
      
      if (w > h && w > maxDim) {
        h = Math.round(h * (maxDim / w));
        w = maxDim;
      } else if (h > maxDim) {
        w = Math.round(w * (maxDim / h));
        h = maxDim;
      }
      
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      
      // Output as optimized JPEG
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressed);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updateCropPreview() {
  const preview = document.getElementById('crop-preview-img');
  const zoom = document.getElementById('crop-zoom');
  const x = document.getElementById('crop-x');
  const y = document.getElementById('crop-y');
  
  if (preview && zoom && x && y) {
    preview.style.transform = `scale(${zoom.value})`;
    preview.style.objectPosition = `${x.value}% ${y.value}%`;
  }
}

function updateCropPreviewFrame() {
  const select = document.getElementById('logo-frame-type');
  const container = document.getElementById('crop-preview-container');
  if (select && container) {
    if (select.value === 'rectangle') {
      container.style.width = '120px';
      container.style.height = '64px';
      container.style.borderRadius = '8px';
    } else {
      container.style.width = '75px';
      container.style.height = '75px';
      container.style.borderRadius = '50%';
    }
  }
}

// ── SAVE AND UPDATE SUBMISSION ──────────────────────────────

async function handleEditorSubmit(e) {
  e.preventDefault();
  
  const section = editorActiveSection;
  const recordId = editingRecordId;

  let key = '';
  if (section === 'council') key = STORAGE_KEYS.COUNCIL;
  if (section === 'projects') key = STORAGE_KEYS.PROJECTS;
  if (section === 'presidents') key = STORAGE_KEYS.PRESIDENTS;
  if (section === 'clubs') key = STORAGE_KEYS.CLUBS;
  if (section === 'governors') key = STORAGE_KEYS.GOVERNORS;
  if (section === 'blogs') key = STORAGE_KEYS.BLOGS;
  if (section === 'users') key = STORAGE_KEYS.USERS;
  if (section === 'logos-manage') key = STORAGE_KEYS.LOGOS;
  if (section === 'club-logos-manage') key = STORAGE_KEYS.CLUB_LOGOS;

  const records = getCollection(key);
  let record = {};

  if (section === 'council') {
    const cropZoom = document.getElementById('crop-zoom');
    const cropX = document.getElementById('crop-x');
    const cropY = document.getElementById('crop-y');
    record = {
      id: recordId || `c-${Date.now()}`,
      name: document.getElementById('c-name').value.trim(),
      role: document.getElementById('c-role').value.trim(),
      tag: document.getElementById('c-tag').value.trim(),
      type: document.getElementById('c-type').value,
      status: document.getElementById('c-status').value,
      year: document.getElementById('c-year').value,
      displayOrder: parseInt(document.getElementById('c-order').value),
      icon: 'fa-user',
      photoScale: cropZoom ? parseFloat(cropZoom.value) : 1,
      photoX: cropX ? parseInt(cropX.value) : 50,
      photoY: cropY ? parseInt(cropY.value) : 50
    };
    
    if (editorImageCache['photo']) {
      record.photo = editorImageCache['photo'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.photo = old ? old.photo : null;
    } else {
      record.photo = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated Council Officer: ${record.name}`);
    } else {
      records.push(record);
      logActivity(`Added Council Officer: ${record.name}`);
    }
  } 
  else if (section === 'projects') {
    record = {
      id: recordId || `p-${Date.now()}`,
      title: document.getElementById('p-title').value.trim(),
      category: document.getElementById('p-category').value,
      chairperson: document.getElementById('p-chair').value.trim(),
      organizingCommittee: document.getElementById('p-committee').value.trim(),
      desc: document.getElementById('p-desc').value.trim(),
      objectives: document.getElementById('p-objectives').value.trim(),
      date: document.getElementById('p-date').value,
      time: document.getElementById('p-time').value.trim(),
      venue: document.getElementById('p-venue').value.trim(),
      status: document.getElementById('p-status').value,
      publicationStatus: document.getElementById('p-pubstatus').value,
      displayOrder: parseInt(document.getElementById('p-order').value),
      registrationLink: document.getElementById('p-reglink').value.trim(),
      reportLink: document.getElementById('p-replink').value.trim(),
      partnerOrganizations: document.getElementById('p-partners').value.trim()
    };

    if (editorImageCache['cover']) {
      record.coverImage = editorImageCache['cover'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.coverImage = old ? old.coverImage : null;
    } else {
      record.coverImage = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated Project: ${record.title}`);
    } else {
      records.push(record);
      logActivity(`Added Project: ${record.title}`);
    }
  } 
  else if (section === 'presidents') {
    const cropZoom = document.getElementById('crop-zoom');
    const cropX = document.getElementById('crop-x');
    const cropY = document.getElementById('crop-y');
    record = {
      id: recordId || `pr-${Date.now()}`,
      name: document.getElementById('pr-name').value.trim(),
      clubName: document.getElementById('pr-club').value.trim(),
      position: document.getElementById('pr-pos').value.trim(),
      year: document.getElementById('pr-year').value,
      region: document.getElementById('pr-region').value.trim(),
      phone: document.getElementById('pr-phone').value.trim(),
      email: document.getElementById('pr-email').value.trim(),
      bio: document.getElementById('pr-bio').value.trim(),
      status: document.getElementById('pr-status').value,
      displayOrder: parseInt(document.getElementById('pr-order').value),
      photoScale: cropZoom ? parseFloat(cropZoom.value) : 1,
      photoX: cropX ? parseInt(cropX.value) : 50,
      photoY: cropY ? parseInt(cropY.value) : 50
    };

    if (editorImageCache['photo']) {
      record.photo = editorImageCache['photo'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.photo = old ? old.photo : null;
    } else {
      record.photo = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated President: ${record.name}`);
    } else {
      records.push(record);
      logActivity(`Added President: ${record.name}`);
    }
  } 
  else if (section === 'clubs') {
    record = {
      id: recordId || `cl-${Date.now()}`,
      name: document.getElementById('cl-name').value.trim(),
      sponsor: document.getElementById('cl-sponsor').value.trim(),
      region: document.getElementById('cl-region').value.trim(),
      charteredDate: document.getElementById('cl-charter').value,
      president: document.getElementById('cl-pres').value.trim(),
      secretary: document.getElementById('cl-sec').value.trim(),
      treasurer: document.getElementById('cl-treas').value.trim(),
      advisor: document.getElementById('cl-advisor').value.trim(),
      email: document.getElementById('cl-email').value.trim(),
      phone: document.getElementById('cl-phone').value.trim(),
      desc: document.getElementById('cl-desc').value.trim(),
      members: parseInt(document.getElementById('cl-members').value),
      displayOrder: parseInt(document.getElementById('cl-order').value),
      status: document.getElementById('cl-status').value
    };

    if (editorImageCache['logo']) {
      record.logo = editorImageCache['logo'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.logo = old ? old.logo : null;
    } else {
      record.logo = null;
    }

    if (editorImageCache['banner']) {
      record.banner = editorImageCache['banner'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.banner = old ? old.banner : null;
    } else {
      record.banner = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated Club: ${record.name}`);
    } else {
      records.push(record);
      logActivity(`Added Club: ${record.name}`);
    }
  }
  else if (section === 'governors') {
    const cropZoom = document.getElementById('crop-zoom');
    const cropX = document.getElementById('crop-x');
    const cropY = document.getElementById('crop-y');
    record = {
      id: recordId || `gov-${Date.now()}`,
      name: document.getElementById('g-name').value.trim(),
      year: document.getElementById('g-year').value.trim(),
      theme: document.getElementById('g-theme').value.trim(),
      logo: document.getElementById('g-logo').value.trim(),
      achievement: document.getElementById('g-achievement').value.trim(),
      displayOrder: parseInt(document.getElementById('g-order').value),
      status: document.getElementById('g-status').value,
      photoScale: cropZoom ? parseFloat(cropZoom.value) : 1,
      photoX: cropX ? parseInt(cropX.value) : 50,
      photoY: cropY ? parseInt(cropY.value) : 50
    };

    if (editorImageCache['photo']) {
      record.photo = editorImageCache['photo'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.photo = old ? old.photo : null;
    } else {
      record.photo = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated Past President: ${record.name}`);
    } else {
      records.push(record);
      logActivity(`Added Past President: ${record.name}`);
    }
  }
  else if (section === 'blogs') {
    const cropZoom = document.getElementById('crop-zoom');
    const cropX = document.getElementById('crop-x');
    const cropY = document.getElementById('crop-y');
    record = {
      id: recordId || `blog-${Date.now()}`,
      title: document.getElementById('b-title').value.trim(),
      author: document.getElementById('b-author').value.trim(),
      date: document.getElementById('b-date').value,
      content: document.getElementById('b-content').value.trim(),
      displayOrder: parseInt(document.getElementById('b-order').value),
      status: document.getElementById('b-status').value,
      photoScale: cropZoom ? parseFloat(cropZoom.value) : 1,
      photoX: cropX ? parseInt(cropX.value) : 50,
      photoY: cropY ? parseInt(cropY.value) : 50
    };

    if (editorImageCache['photo']) {
      record.photo = editorImageCache['photo'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.photo = old ? old.photo : null;
    } else {
      record.photo = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated blog post: ${record.title}`);
    } else {
      records.push(record);
      logActivity(`Added blog post: ${record.title}`);
    }
  }
  else if (section === 'users') {
    const usernameInput = document.getElementById('u-username').value.trim();
    const passwordInput = document.getElementById('u-password').value.trim();
    const labelInput = document.getElementById('u-label').value.trim();
    const roleInput = document.getElementById('u-role').value;

    record = {
      id: recordId || `user-${Date.now()}`,
      username: usernameInput,
      password: passwordInput,
      label: labelInput,
      role: roleInput
    };

    if (!recordId) {
      const lower = usernameInput.toLowerCase();
      if (DEFAULT_USERS[lower]) {
        alert('Validation Error: This username matches a built-in admin account.');
        return;
      }
      const existing = records.find(u => u.username.toLowerCase() === lower);
      if (existing) {
        alert('Validation Error: This username is already registered.');
        return;
      }
    }

    if (recordId) {
      const idx = records.findIndex(r => r.username === recordId || r.id === recordId);
      records[idx] = record;
      logActivity(`Updated user account: ${record.username}`);
    } else {
      records.push(record);
      logActivity(`Registered new user account: ${record.username}`);
    }
  }
  else if (section === 'logos-manage' || section === 'club-logos-manage') {
    const cropZoom = document.getElementById('crop-zoom');
    const cropX = document.getElementById('crop-x');
    const cropY = document.getElementById('crop-y');
    const frameTypeVal = document.getElementById('logo-frame-type') ? document.getElementById('logo-frame-type').value : 'circle';
    record = {
      id: recordId || `logo-${Date.now()}`,
      name: document.getElementById('logo-name').value.trim(),
      displayOrder: parseInt(document.getElementById('logo-order').value),
      status: document.getElementById('logo-status').value,
      frameType: frameTypeVal,
      photoScale: cropZoom ? parseFloat(cropZoom.value) : 1,
      photoX: cropX ? parseInt(cropX.value) : 50,
      photoY: cropY ? parseInt(cropY.value) : 50
    };

    if (editorImageCache['image']) {
      record.image = editorImageCache['image'];
    } else if (recordId) {
      const old = records.find(r => r.id === recordId);
      record.image = old ? old.image : null;
    } else {
      record.image = null;
    }

    if (recordId) {
      const idx = records.findIndex(r => r.id === recordId);
      records[idx] = record;
      logActivity(`Updated ${section === 'logos-manage' ? 'PDP' : 'Club'} Logo: ${record.name}`);
    } else {
      records.push(record);
      logActivity(`Added ${section === 'logos-manage' ? 'PDP' : 'Club'} Logo: ${record.name}`);
    }
  }

  saveCollection(key, records);

  // Sync to Supabase
  const moduleName = getModuleName(section);
  if (moduleName && isSupabaseConnected(moduleName)) {
    try {
      await dbUpsert(moduleName, record);
      console.log(`Synced record ${record.id || record.username} successfully with Supabase.`);
    } catch(err) {
      alert(`Local changes saved, but Supabase database failed to sync: ${err.message}`);
    }
  }

  closeEditorModal();
  renderAdminDashboard();
}

// ── SUPABASE SETTINGS PANEL FUNCTIONS ───────────────────────

function renderSupabaseSettings() {
  const credentials = loadSupabaseCredentials();
  const container = document.getElementById('admin-tab-supabase');
  if (!container) return;

  let html = `
    <div class="admin-header">
      <h2>Supabase Settings & Credentials</h2>
      <p>Configure dedicated Supabase database/project credentials for each module. If credentials are set, changes sync in real-time. If not, local storage acts as a seamless fallback.</p>
    </div>
    <form id="supabase-config-form" onsubmit="handleSupabaseConfigSubmit(event)" style="display:flex; flex-direction:column; gap:20px; margin-top:20px;">
  `;

  Object.keys(MODULE_DB_MAP).forEach(moduleKey => {
    const mapping = MODULE_DB_MAP[moduleKey];
    const cred = credentials[moduleKey] || { url: '', key: '' };
    const connected = isSupabaseConnected(moduleKey);
    const badgeClass = connected ? 'published' : 'draft';
    const badgeText = connected ? '● Connected' : '○ Disconnected';

    html += `
      <div class="supabase-module-card glass-panel" style="padding:20px; border-radius:16px; border: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="margin:0; font-family:var(--font-heading); color:#fff; font-size:1rem; font-weight:600;">${mapping.label}</h4>
          <span class="status-badge-inline ${badgeClass}" id="db-status-${moduleKey}" style="font-size:0.75rem; padding:4px 8px; border-radius:6px; font-weight:600; text-transform: uppercase;">${badgeText}</span>
        </div>
        <div class="form-row" style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
          <div class="input-group">
            <label style="font-size:0.75rem; color:#9e8070; margin-bottom:5px; display:block; text-transform:uppercase; letter-spacing:0.5px;">Supabase Project URL</label>
            <input type="text" id="supabase-url-${moduleKey}" value="${cred.url}" placeholder="https://your-project.supabase.co" style="width:100%; padding:10px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.06); border-radius:8px; color:#fff; outline:none;">
          </div>
          <div class="input-group">
            <label style="font-size:0.75rem; color:#9e8070; margin-bottom:5px; display:block; text-transform:uppercase; letter-spacing:0.5px;">API Anon Service Key</label>
            <input type="password" id="supabase-key-${moduleKey}" value="${cred.key}" placeholder="your-anon-key" style="width:100%; padding:10px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.06); border-radius:8px; color:#fff; outline:none;">
          </div>
        </div>
      </div>
    `;
  });

  html += `
      <div style="margin-top:10px;">
        <button type="submit" class="btn-primary" style="padding:12px 24px; border-radius:10px; font-weight:600; cursor:pointer; border:none; display:flex; align-items:center; gap:8px;"><i class="fa-solid fa-floppy-disk"></i> Save Database Credentials</button>
      </div>
    </form>
  `;

  container.innerHTML = html;
}

function handleSupabaseConfigSubmit(e) {
  e.preventDefault();
  const credentials = loadSupabaseCredentials();

  Object.keys(MODULE_DB_MAP).forEach(moduleKey => {
    const urlInput = document.getElementById(`supabase-url-${moduleKey}`);
    const keyInput = document.getElementById(`supabase-key-${moduleKey}`);
    
    if (urlInput && keyInput) {
      credentials[moduleKey] = {
        url: urlInput.value.trim(),
        key: keyInput.value.trim()
      };
    }
  });

  saveSupabaseCredentials(credentials);
  
  // Clear cached client instances
  Object.keys(supabaseClients).forEach(k => delete supabaseClients[k]);
  
  syncAllDatabases().then(() => {
    alert('Supabase configurations saved and synced successfully!');
    renderSupabaseSettings();
    renderAdminDashboard();
  });
}

function closeEditorModal() {
  const modal = document.getElementById('editor-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ── INITIALIZATION ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  // Validate active login session on page load
  const session = sessionStorage.getItem('active_admin_session');
  if (!session) {
    alert('Access restricted. Please authenticate first.');
    window.location.href = 'login.html';
    return;
  }
  
  currentUser = JSON.parse(session);
  document.getElementById('admin-current-role').innerText = currentUser.label;
  document.getElementById('admin-current-user').innerText = currentUser.username;

  // Manage custom user tab and options visibility
  if (currentUser.role === 'superadmin') {
    const usersTab = document.getElementById('tab-nav-users');
    const logosTab = document.getElementById('tab-nav-logos-manage');
    const clubLogosTab = document.getElementById('tab-nav-club-logos-manage');
    if (usersTab) usersTab.style.display = 'block';
    if (logosTab) logosTab.style.display = 'block';
    if (clubLogosTab) clubLogosTab.style.display = 'block';
  }

  // Fetch from Supabase for all config connections first
  await syncAllDatabases();

  renderAdminDashboard();
});
