// ═══════════════════════════════════════════════════════════
//  LEO DISTRICT 306 D1 — SUPABASE DATABASE ADAPTER
// ═══════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  COUNCIL: 'leo_district_council_v4',
  PROJECTS: 'leo_district_projects_v4',
  PRESIDENTS: 'leo_club_presidents_v6',
  CLUBS: 'leo_clubs_directory_v6',
  LOGS: 'leo_admin_activity_log_v4',
  GOVERNORS: 'leo_governors_v8',
  BLOGS: 'leo_blogs_v1',
  USERS: 'leo_custom_users_v2',
  LOGOS: 'leo_pdp_logos_v2',
  CLUB_LOGOS: 'leo_club_logos_v1'
};

const SUPABASE_DB_KEYS = {
  CREDENTIALS: 'leo_supabase_credentials_v1'
};

const MODULE_DB_MAP = {
  pdpLogos: { label: 'PDP Logos Management', tableName: 'pdp_logos', storageKey: STORAGE_KEYS.LOGOS },
  clubLogos: { label: 'Club Logos Management', tableName: 'club_logos', storageKey: STORAGE_KEYS.CLUB_LOGOS },
  userAccounts: { label: 'User Accounts Management', tableName: 'users', storageKey: STORAGE_KEYS.USERS },
  projects: { label: 'District Projects Database', tableName: 'projects', storageKey: STORAGE_KEYS.PROJECTS },
  council: { label: 'Council Officers Database', tableName: 'council', storageKey: STORAGE_KEYS.COUNCIL },
  clubPresidents: { label: 'Leo Club Presidents', tableName: 'presidents', storageKey: STORAGE_KEYS.PRESIDENTS },
  clubsDirectory: { label: 'Leo Clubs Directory', tableName: 'clubs', storageKey: STORAGE_KEYS.CLUBS },
  blogs: { label: 'District Blogs', tableName: 'blogs', storageKey: STORAGE_KEYS.BLOGS }
};

// Initialize empty credentials structure with pre-populated project URL and Key
const DEFAULT_SUPABASE_CREDENTIALS = {
  pdpLogos: { url: 'https://dsbpatnettxfcprzbmft.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzYnBhdG5ldHR4ZmNwcnpibWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NzY3ODIsImV4cCI6MjA5OTM1Mjc4Mn0.58UDUrOJtWwumdhuW204uep2kurZBPlc6f3ugsXxfr4' },
  clubLogos: { url: 'https://dsbpatnettxfcprzbmft.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzYnBhdG5ldHR4ZmNwcnpibWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NzY3ODIsImV4cCI6MjA5OTM1Mjc4Mn0.58UDUrOJtWwumdhuW204uep2kurZBPlc6f3ugsXxfr4' },
  userAccounts: { url: 'https://dsbpatnettxfcprzbmft.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzYnBhdG5ldHR4ZmNwcnpibWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NzY3ODIsImV4cCI6MjA5OTM1Mjc4Mn0.58UDUrOJtWwumdhuW204uep2kurZBPlc6f3ugsXxfr4' },
  projects: { url: 'https://dsbpatnettxfcprzbmft.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzYnBhdG5ldHR4ZmNwcnpibWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NzY3ODIsImV4cCI6MjA5OTM1Mjc4Mn0.58UDUrOJtWwumdhuW204uep2kurZBPlc6f3ugsXxfr4' },
  council: { url: 'https://dsbpatnettxfcprzbmft.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzYnBhdG5ldHR4ZmNwcnpibWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NzY3ODIsImV4cCI6MjA5OTM1Mjc4Mn0.58UDUrOJtWwumdhuW204uep2kurZBPlc6f3ugsXxfr4' },
  clubPresidents: { url: 'https://dsbpatnettxfcprzbmft.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzYnBhdG5ldHR4ZmNwcnpibWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NzY3ODIsImV4cCI6MjA5OTM1Mjc4Mn0.58UDUrOJtWwumdhuW204uep2kurZBPlc6f3ugsXxfr4' },
  clubsDirectory: { url: 'https://dsbpatnettxfcprzbmft.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzYnBhdG5ldHR4ZmNwcnpibWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NzY3ODIsImV4cCI6MjA5OTM1Mjc4Mn0.58UDUrOJtWwumdhuW204uep2kurZBPlc6f3ugsXxfr4' },
  blogs: { url: 'https://dsbpatnettxfcprzbmft.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzYnBhdG5ldHR4ZmNwcnpibWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NzY3ODIsImV4cCI6MjA5OTM1Mjc4Mn0.58UDUrOJtWwumdhuW204uep2kurZBPlc6f3ugsXxfr4' }
};

// Load saved Supabase config
function loadSupabaseCredentials() {
  const stored = localStorage.getItem(SUPABASE_DB_KEYS.CREDENTIALS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SUPABASE_CREDENTIALS, ...parsed };
    } catch (e) {
      console.error('Failed to parse Supabase credentials:', e);
    }
  }
  return DEFAULT_SUPABASE_CREDENTIALS;
}

// Save Supabase config
function saveSupabaseCredentials(creds) {
  localStorage.setItem(SUPABASE_DB_KEYS.CREDENTIALS, JSON.stringify(creds));
}

// Global cached client instances
const supabaseClients = {};

// Get a Supabase client for a specific module
function getSupabaseClient(moduleName) {
  if (supabaseClients[moduleName]) {
    return supabaseClients[moduleName];
  }

  const creds = loadSupabaseCredentials();
  const moduleCred = creds[moduleName];

  if (moduleCred && moduleCred.url && moduleCred.key) {
    try {
      if (typeof supabase !== 'undefined') {
        const client = supabase.createClient(moduleCred.url, moduleCred.key);
        supabaseClients[moduleName] = client;
        return client;
      }
    } catch (e) {
      console.error(`Failed to initialize Supabase client for ${moduleName}:`, e);
    }
  }
  return null;
}

// Check if a module is connected to Supabase
function isSupabaseConnected(moduleName) {
  return getSupabaseClient(moduleName) !== null;
}

// Fetch all records from Supabase and cache locally in localStorage
async function syncFromSupabase(moduleName) {
  const mapping = MODULE_DB_MAP[moduleName];
  if (!mapping) return false;

  const client = getSupabaseClient(moduleName);
  if (!client) return false;

  try {
    let query = client.from(mapping.tableName).select('*');
    if (moduleName !== 'userAccounts') {
      query = query.order('displayOrder', { ascending: true });
    }
    
    const { data, error } = await query;
    if (error) throw error;

    if (data) {
      const old = localStorage.getItem(mapping.storageKey);
      const freshlyStr = JSON.stringify(data);
      if (old !== freshlyStr) {
        localStorage.setItem(mapping.storageKey, freshlyStr);
        return true; // Data changed
      }
    }
  } catch (err) {
    console.error(`Supabase Sync Error [${mapping.label}]:`, err);
  }
  return false; // Data unchanged or error
}

// Write (create/update) a record to Supabase
async function dbUpsert(moduleName, record) {
  const mapping = MODULE_DB_MAP[moduleName];
  if (!mapping) return false;

  const client = getSupabaseClient(moduleName);
  if (!client) return false;

  try {
    const { error } = await client
      .from(mapping.tableName)
      .upsert(record);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Supabase Upsert Error [${mapping.label}]:`, err);
    throw err;
  }
}

// Delete a record from Supabase
async function dbDelete(moduleName, recordId) {
  const mapping = MODULE_DB_MAP[moduleName];
  if (!mapping) return false;

  const client = getSupabaseClient(moduleName);
  if (!client) return false;

  try {
    const keyField = moduleName === 'userAccounts' ? 'username' : 'id';
    const { error } = await client
      .from(mapping.tableName)
      .delete()
      .eq(keyField, recordId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Supabase Delete Error [${mapping.label}]:`, err);
    throw err;
  }
}

// Perform sequential sync for all configured modules
async function syncAllDatabases() {
  const syncPromises = Object.keys(MODULE_DB_MAP).map(moduleName => syncFromSupabase(moduleName));
  const results = await Promise.all(syncPromises);
  const connectedCount = results.filter(Boolean).length;
  console.log(`Supabase synchronization complete. Sync successful for ${connectedCount} of ${results.length} modules.`);
}

// ── LOCAL STORAGE FALLBACK SEEDING ──────────────────────────

function initDatabase() {
  if (!localStorage.getItem(STORAGE_KEYS.COUNCIL)) {
    localStorage.setItem(STORAGE_KEYS.COUNCIL, JSON.stringify(SEED_COUNCIL));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SEED_PROJECTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRESIDENTS)) {
    localStorage.setItem(STORAGE_KEYS.PRESIDENTS, JSON.stringify(SEED_PRESIDENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLUBS)) {
    localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(SEED_CLUBS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GOVERNORS)) {
    localStorage.setItem(STORAGE_KEYS.GOVERNORS, JSON.stringify(SEED_GOVERNORS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BLOGS)) {
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(SEED_BLOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGOS)) {
    localStorage.setItem(STORAGE_KEYS.LOGOS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLUB_LOGOS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.CLUB_LOGOS)).length === 0) {
    localStorage.setItem(STORAGE_KEYS.CLUB_LOGOS, JSON.stringify(SEED_CLUB_LOGOS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    const welcomeLog = [{
      timestamp: new Date().toLocaleString(),
      userId: 'system',
      role: 'System',
      action: 'Dynamic LocalStorage Engine initialized with default seeds.'
    }];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(welcomeLog));
  }
}

function getCollection(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function saveCollection(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Automatically load and seed databases
initDatabase();
