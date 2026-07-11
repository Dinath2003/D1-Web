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
