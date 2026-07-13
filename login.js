// ═══════════════════════════════════════════════════════════
//  LEO DISTRICT 306 D1 — LOGIN ENGINE
// ═══════════════════════════════════════════════════════════

function handleLoginPageSubmit(e) {
  e.preventDefault();
  const user = document.getElementById('login-page-user').value.trim();
  const pass = document.getElementById('login-page-pass').value.trim();

  let matchedRole = null;
  if (user === 'superadmin' && pass === 'admin123') {
    matchedRole = { username: 'superadmin', label: 'Super Admin', role: 'superadmin' };
  } else if (user === 'contentadmin' && pass === 'admin123') {
    matchedRole = { username: 'contentadmin', label: 'Content Admin', role: 'contentadmin' };
  } else if (user === 'districtadmin' && pass === 'admin123') {
    matchedRole = { username: 'districtadmin', label: 'District Admin', role: 'districtadmin' };
  } else if (user === 'vieweradmin' && pass === 'admin123') {
    matchedRole = { username: 'vieweradmin', label: 'Viewer Admin', role: 'vieweradmin' };
  } else {
    const customUsers = getCollection(STORAGE_KEYS.USERS);
    const matched = customUsers.find(u => u.username === user && u.password === pass);
    if (matched) {
      matchedRole = {
        username: matched.username,
        label: matched.label || 'Blog Editor',
        role: matched.role || 'blog_editor'
      };
    }
  }

  if (matchedRole) {
    currentUser = matchedRole;
    sessionStorage.setItem('active_admin_session', JSON.stringify(currentUser));
    logActivity(`Administrator ${currentUser.username} logged in via Login Page.`);
    
    document.getElementById('login-page-user').value = '';
    document.getElementById('login-page-pass').value = '';

    updateHeaderLoginButton();
    alert('Logged in successfully!');
    window.location.href = 'admin.html';
  } else {
    alert('Invalid administrative credentials. Access Denied.');
  }
}

// ── INITIALIZATION ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Sync Custom User Accounts from Supabase in background
  syncFromSupabase('userAccounts');
});
