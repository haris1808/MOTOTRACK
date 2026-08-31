// ============================================================
// MOTO-TRACK: Supabase Configuration & Connection Manager
// Mengelola koneksi ke Supabase (cloud) atau fallback ke localStorage (lokal)
// ============================================================

const SupabaseManager = (function () {
  const STORAGE_KEY = 'mototrack_supabase_config';

  // Opsi: Jika ingin mengatur Supabase URL & Anon Key secara default di code/deploy
  const DEFAULT_CONFIG = {
    url: '',      // e.g. 'https://wusdvotxlmlbcpklgicn.supabase.co'
    anonKey: ''   // e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1c2R2b3R4bG1sYmNwa2xnaWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNDQ1NTIsImV4cCI6MjEwMzcyMDU1Mn0.C7jAoERBj57vi4xRcLDMBvz6ou_d_NfTlauyaRAkMIE'
  };

  let client = null;
  let connected = false;

  function loadConfig() {
    // 1. Prioritize configuration set in index.html (window.DEFAULT_CONFIG or window.SUPABASE_CONFIG)
    const winConfig = window.DEFAULT_CONFIG || window.SUPABASE_CONFIG;
    if (winConfig && typeof winConfig === 'object' && winConfig.url && winConfig.anonKey && winConfig.url.trim() && winConfig.anonKey.trim()) {
      return { url: winConfig.url.trim(), anonKey: winConfig.anonKey.trim() };
    }

    // 2. Check DEFAULT_CONFIG in this file
    if (DEFAULT_CONFIG && DEFAULT_CONFIG.url && DEFAULT_CONFIG.anonKey && DEFAULT_CONFIG.url.trim() && DEFAULT_CONFIG.anonKey.trim()) {
      return { url: DEFAULT_CONFIG.url.trim(), anonKey: DEFAULT_CONFIG.anonKey.trim() };
    }

    // 3. Fallback to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.url && parsed.anonKey) {
          return parsed;
        }
      }
    } catch (e) { /* ignore */ }

    return null;
  }

  function saveConfig(url, anonKey) {
    const config = { url: (url || '').trim(), anonKey: (anonKey || '').trim() };
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
      if (typeof supabase === 'undefined' || !supabase.createClient) {
        console.warn('[SupabaseManager] Supabase JS SDK library not loaded yet');
        return false;
      }
      client = supabase.createClient(config.url, config.anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      return true;
    } catch (e) {
      console.error('[SupabaseManager] Init error:', e);
      client = null;
      connected = false;
      return false;
    }
  }

  async function testConnection() {
    if (!client) {
      const config = loadConfig();
      if (config) initClient(config);
    }
    if (!client) {
      connected = false;
      return false;
    }
    try {
      const { data, error } = await client.from('vehicles').select('id').limit(1);
      if (error) {
        console.warn('[SupabaseManager] Connection test query returned error:', error.message || error);
        connected = false;
        return false;
      }
      connected = true;
      return true;
    } catch (e) {
      console.warn('[SupabaseManager] Connection test exception:', e.message || e);
      connected = false;
      return false;
    }
  }

  async function ensureConnected() {
    if (connected && client) return true;
    return await testConnection();
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

  // Auto-init on script load
  autoInit();

  return {
    connect,
    testConnection,
    ensureConnected,
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

