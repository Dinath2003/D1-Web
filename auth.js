// ═══════════════════════════════════════════════════════════
//  LEO DISTRICT 306 D1 — AUTHENTICATION & RBAC
// ═══════════════════════════════════════════════════════════

let currentUser = null;

const ADMIN_ROLES = {
  superadmin: { label: 'Super Admin', permissions: { all: true } },
  contentadmin: { label: 'Content Admin', permissions: { edit: true, view_logs: false, delete: false } },
  districtadmin: { label: 'District Admin', permissions: { edit_council: true, edit_projects: true, edit_clubs: true, edit_presidents: false, delete: false, view_logs: false } },
  vieweradmin: { label: 'Viewer Admin', permissions: { view_only: true } },
  blog_editor: { label: 'Blog Editor', permissions: { edit_projects: true, delete: true } }
};

function checkActiveSession() {
  const session = sessionStorage.getItem('active_admin_session');
  if (session) {
    try {
      currentUser = JSON.parse(session);
    } catch (e) {
      currentUser = null;
    }
  }
  updateHeaderLoginButton();
}

function updateHeaderLoginButton() {
  const btn = document.getElementById('portal-header-btn');
  if (!btn) return;
  if (currentUser) {
    btn.innerText = 'Admin Panel';
    btn.setAttribute('onclick', "location.href='admin.html'");
  } else {
    btn.innerText = 'Admin Log In';
    btn.setAttribute('onclick', "location.href='login.html'");
  }
}

function checkPermission(action) {
  if (!currentUser) return false;
  const roleConfig = ADMIN_ROLES[currentUser.role];
  if (!roleConfig) return false;

  if (roleConfig.permissions.all) return true;
  if (roleConfig.permissions[action]) return true;

  // Additional fine-grained rules
  if (action === 'edit' && (roleConfig.permissions.edit_council || roleConfig.permissions.edit_projects || roleConfig.permissions.edit_clubs)) {
    return true;
  }
  return false;
}

function handleAdminLogout() {
  if (currentUser) {
    logActivity(`Administrator ${currentUser.username} logged out.`);
  }
  sessionStorage.removeItem('active_admin_session');
  currentUser = null;
  alert('Logged out successfully!');
  window.location.href = 'index.html';
}

// Log admin activities (falls back to local storage logs)
function logActivity(actionDesc) {
  const logs = JSON.parse(localStorage.getItem('leo_admin_activity_log_v4')) || [];
  const newLog = {
    timestamp: new Date().toLocaleString(),
    userId: currentUser ? currentUser.username : 'guest',
    role: currentUser ? currentUser.label : 'Guest',
    action: actionDesc
  };
  logs.unshift(newLog); // Prepend to show latest first
  // Keep logs to a reasonable limit (e.g. 500 items)
  if (logs.length > 500) logs.pop();
  localStorage.setItem('leo_admin_activity_log_v4', JSON.stringify(logs));
}

// Initialise auth check on load
window.addEventListener('DOMContentLoaded', () => {
  checkActiveSession();
});
