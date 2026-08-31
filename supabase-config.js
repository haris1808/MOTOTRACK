// ============================================================
// MOTO-TRACK: Supabase Configuration & Connection Manager
// Mengelola koneksi ke Supabase (cloud) atau fallback ke localStorage (lokal)
// ============================================================

const SupabaseManager = (function () {
  const STORAGE_KEY = 'mototrack_supabase_config';
  let client = null;
  let connected = false;

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return null;
  }

  function saveConfig(url, anonKey) {
    const config = { url: url.trim(), anonKey: anonKey.trim() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return config;
  }

  function clearConfig() {
    localStorage.removeItem(STORAGE_KEY);
    client = null;
    connected = false;
  }

  function initClient(config) {
    if (!config || !config.url || !config.anonKey) {
      client = null;
      connected = false;
      return false;
    }
    try {
      client = supabase.createClient(config.url, config.anonKey);
      return true;
    } catch (e) {
      console.error('[SupabaseManager] Init error:', e);
      client = null;
      connected = false;
      return false;
    }
  }

  async function testConnection() {
    if (!client) return false;
    try {
      const { data, error } = await client.from('vehicles').select('id').limit(1);
      if (error) throw error;
      connected = true;
      return true;
    } catch (e) {
      console.warn('[SupabaseManager] Connection test failed:', e.message);
      connected = false;
      return false;
    }
  }

  async function connect(url, anonKey) {
    const config = saveConfig(url, anonKey);
    const inited = initClient(config);
    if (!inited) return false;
    return await testConnection();
  }

  function autoInit() {
    const config = loadConfig();
    if (config) {
      initClient(config);
    }
  }

  function getClient() {
    return client;
  }

  function isCloudMode() {
    return connected && client !== null;
  }

  function getConfig() {
    return loadConfig();
  }

  // Auto-init on load
  autoInit();

  return {
    connect,
    testConnection,
    getClient,
    isCloudMode,
    getConfig,
    clearConfig,
    loadConfig,
    saveConfig,
    autoInit
  };
})();

window.SupabaseManager = SupabaseManager;
