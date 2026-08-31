'use strict';

// ============================================================
// MOTO-TRACK: Main Application Logic
// SPA Pemantau Servis & Penggantian Sparepart Motor Matic (KM-Based)
// ============================================================

(function () {

  // ── Utility Functions ──────────────────────────────────────

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function formatRupiah(num) {
    var n = Number(num) || 0;
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }

  function getTodayString() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  var CATEGORY_LABELS = {
    mesin: 'Mesin & Pelumas',
    cvt: 'CVT & Transmisi',
    pengereman: 'Pengereman',
    radiator: 'Pendingin & Listrik',
    kaki: 'Kaki-kaki & Ban'
  };

  var CATEGORY_COLORS = {
    mesin: '#06b6d4',
    cvt: '#8b5cf6',
    pengereman: '#f97316',
    radiator: '#10b981',
    kaki: '#eab308'
  };

  function getCategoryLabel(key) {
    return CATEGORY_LABELS[key] || key;
  }

  function getCategoryColor(key) {
    return CATEGORY_COLORS[key] || '#888888';
  }

  function escHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ── Part Image Resolver Helper ────────────────────────────

  function getPartImage(part) {
    if (part && part.image_url) return part.image_url;
    var name = (part && part.name ? part.name : '').toLowerCase();
    
    if (name.indexOf('oli mesin') >= 0 || name.indexOf('engine oil') >= 0) return 'assets/images/parts/oli-mesin.svg';
    if (name.indexOf('gardan') >= 0 || name.indexOf('gear') >= 0) return 'assets/images/parts/oli-gardan.svg';
    if (name.indexOf('busi') >= 0 || name.indexOf('spark') >= 0) return 'assets/images/parts/busi.svg';
    if (name.indexOf('filter udara') >= 0 || name.indexOf('saringan udara') >= 0 || name.indexOf('air filter') >= 0) return 'assets/images/parts/filter-udara.svg';
    if (name.indexOf('v-belt') >= 0 || name.indexOf('van belt') >= 0 || name.indexOf('drive belt') >= 0) return 'assets/images/parts/v-belt.svg';
    if (name.indexOf('roller') >= 0) return 'assets/images/parts/roller-cvt.svg';
    if (name.indexOf('kopling') >= 0 || name.indexOf('ganda') >= 0 || name.indexOf('clutch') >= 0) return 'assets/images/parts/kampas-ganda.svg';
    if (name.indexOf('rem depan') >= 0 || name.indexOf('disc pad') >= 0) return 'assets/images/parts/kampas-rem-depan.svg';
    if (name.indexOf('rem belakang') >= 0 || name.indexOf('tromol') >= 0 || name.indexOf('brake shoe') >= 0) return 'assets/images/parts/kampas-rem-belakang.svg';
    if (name.indexOf('minyak rem') >= 0 || name.indexOf('brake fluid') >= 0 || name.indexOf('dot 4') >= 0) return 'assets/images/parts/minyak-rem.svg';
    if (name.indexOf('radiator') >= 0 || name.indexOf('coolant') >= 0) return 'assets/images/parts/radiator-coolant.svg';
    if (name.indexOf('ban') >= 0 || name.indexOf('tire') >= 0 || name.indexOf('tyre') >= 0) return 'assets/images/parts/ban-motor.svg';
    if (name.indexOf('aki') >= 0 || name.indexOf('baterai') >= 0 || name.indexOf('accu') >= 0 || name.indexOf('battery') >= 0) return 'assets/images/parts/aki-motor.svg';
    if (name.indexOf('grease') >= 0 || name.indexOf('gemuk') >= 0) return 'assets/images/parts/cvt-grease.svg';
    
    return 'assets/images/parts/default-part.svg';
  }

  // ── Default Parts Preset (13 parts) ───────────────────────

  var DEFAULT_PARTS_PRESET = [
    { name: 'Oli Mesin', category: 'mesin', interval_km: 4000, icon: 'droplet', image_url: 'assets/images/parts/oli-mesin.svg', est_price: 65000, description: 'SAE 10W-30 atau sesuai rekomendasi pabrikan' },
    { name: 'Oli Gardan / Gear', category: 'mesin', interval_km: 8000, icon: 'droplet', image_url: 'assets/images/parts/oli-gardan.svg', est_price: 35000, description: 'Oli transmisi final gear' },
    { name: 'Filter Udara', category: 'mesin', interval_km: 8000, icon: 'wind', image_url: 'assets/images/parts/filter-udara.svg', est_price: 45000, description: 'Bersihkan setiap 4000 KM, ganti setiap 8000 KM' },
    { name: 'Busi', category: 'mesin', interval_km: 8000, icon: 'zap', image_url: 'assets/images/parts/busi.svg', est_price: 35000, description: 'NGK atau Denso sesuai tipe motor' },
    { name: 'V-Belt', category: 'cvt', interval_km: 20000, icon: 'cog', image_url: 'assets/images/parts/v-belt.svg', est_price: 120000, description: 'Van belt penggerak CVT' },
    { name: 'Roller CVT', category: 'cvt', interval_km: 20000, icon: 'cog', image_url: 'assets/images/parts/roller-cvt.svg', est_price: 85000, description: 'Set 6 pcs, berat standar pabrikan' },
    { name: 'Kampas Kopling Ganda', category: 'cvt', interval_km: 25000, icon: 'cog', image_url: 'assets/images/parts/kampas-ganda.svg', est_price: 95000, description: 'Kampas ganda / clutch lining' },
    { name: 'Kampas Rem Depan', category: 'pengereman', interval_km: 15000, icon: 'disc', image_url: 'assets/images/parts/kampas-rem-depan.svg', est_price: 45000, description: 'Periksa ketebalan secara berkala' },
    { name: 'Kampas Rem Belakang', category: 'pengereman', interval_km: 15000, icon: 'disc', image_url: 'assets/images/parts/kampas-rem-belakang.svg', est_price: 40000, description: 'Periksa ketebalan secara berkala' },
    { name: 'Coolant Radiator', category: 'radiator', interval_km: 20000, icon: 'thermometer', image_url: 'assets/images/parts/radiator-coolant.svg', est_price: 55000, description: 'Cairan pendingin radiator' },
    { name: 'Aki / Baterai', category: 'radiator', interval_km: 30000, icon: 'zap', image_url: 'assets/images/parts/aki-motor.svg', est_price: 285000, description: 'MF battery / maintenance-free' },
    { name: 'Ban Depan', category: 'kaki', interval_km: 25000, icon: 'circle-dot', image_url: 'assets/images/parts/ban-motor.svg', est_price: 180000, description: 'Periksa kedalaman alur ban' },
    { name: 'Ban Belakang', category: 'kaki', interval_km: 20000, icon: 'circle-dot', image_url: 'assets/images/parts/ban-motor.svg', est_price: 210000, description: 'Periksa kedalaman alur ban' }
  ];

  // ── DataStore Module (Multi-User Scoped) ───────────────────

  var DataStore = (function () {
    var LS_USERS = 'mototrack_users';
    var LS_CURRENT_USER = 'mototrack_current_user';
    var LS_VEHICLES = 'mototrack_vehicles';
    var LS_PARTS = 'mototrack_parts';
    var LS_LOGS = 'mototrack_service_logs';

    function lsGet(key) {
      try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }

    function lsSet(key, arr) {
      localStorage.setItem(key, JSON.stringify(arr));
    }

    function isCloud() {
      return window.SupabaseManager && SupabaseManager.isCloudMode();
    }

    function sb() {
      return SupabaseManager.getClient();
    }

    // ── User Management ──

    function getUsers() {
      var users = lsGet(LS_USERS);
      if (!users || users.length === 0) {
        var defaultAdmin = {
          id: 'usr_admin_default',
          username: 'admin',
          fullName: 'Administrator',
          password: 'admin354313',
          created_at: new Date().toISOString()
        };
        users = [defaultAdmin];
        lsSet(LS_USERS, users);
      }
      return users;
    }

    function saveUser(user) {
      var users = getUsers();
      var idx = users.findIndex(function (u) { return u.id === user.id; });
      if (idx >= 0) users[idx] = user; else users.push(user);
      lsSet(LS_USERS, users);

      if (isCloud()) {
        try {
          sb().from('users').upsert({
            id: user.id,
            username: user.username,
            full_name: user.fullName || user.username,
            password: user.password,
            created_at: user.created_at || new Date().toISOString()
          }, { onConflict: 'id' }).then(function () {}).catch(function () {});
        } catch (e) { console.warn('Cloud saveUser sync failed:', e); }
      }
      return user;
    }

    function registerUser(userData) {
      var username = (userData.username || '').trim().toLowerCase();
      var users = getUsers();
      var exists = users.find(function (u) { return u.username.toLowerCase() === username; });
      if (exists) {
        throw new Error('Username "' + username + '" sudah digunakan. Silakan pilih username lain.');
      }

      var newUser = {
        id: 'usr_' + generateId(),
        username: username,
        fullName: userData.fullName.trim() || username,
        password: userData.password,
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      lsSet(LS_USERS, users);

      if (isCloud()) {
        try {
          sb().from('users').upsert({
            id: newUser.id,
            username: newUser.username,
            full_name: newUser.fullName,
            password: newUser.password,
            created_at: newUser.created_at
          }, { onConflict: 'id' }).then(function () {}).catch(function () {});
        } catch (e) { console.warn('Cloud registerUser sync failed:', e); }
      }

      return newUser;
    }

    function authenticateUser(username, password) {
      var users = getUsers();
      var u = (username || '').trim().toLowerCase();
      var matched = users.find(function (usr) {
        return usr.username.toLowerCase() === u && usr.password === password;
      });
      return matched || null;
    }

    function getCurrentUser() {
      try {
        var raw = localStorage.getItem(LS_CURRENT_USER);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    }

    function setCurrentUser(user) {
      if (user) {
        localStorage.setItem(LS_CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(LS_CURRENT_USER);
      }
    }

    function clearCurrentUser() {
      localStorage.removeItem(LS_CURRENT_USER);
    }

    function getCurrentUserId() {
      var u = getCurrentUser();
      return u ? u.id : 'usr_admin_default';
    }

    function updateUserProfile(userId, fullName, oldPassword, newPassword) {
      var users = getUsers();
      var user = users.find(function (u) { return u.id === userId; });
      if (!user) throw new Error('Pengguna tidak ditemukan');

      user.fullName = fullName.trim() || user.fullName;

      if (newPassword) {
        if (user.password !== oldPassword) {
          throw new Error('Password saat ini salah!');
        }
        if (newPassword.length < 4) {
          throw new Error('Password baru minimal 4 karakter!');
        }
        user.password = newPassword;
      }

      saveUser(user);

      var current = getCurrentUser();
      if (current && current.id === user.id) {
        setCurrentUser(user);
      }

      return user;
    }

    // ── Entity Scoping (Vehicles, Parts, Logs) ──

    async function getVehicles() {
      var uid = getCurrentUserId();
      if (isCloud()) {
        try {
          var res = await sb().from('vehicles').select('*').eq('user_id', uid);
          if (res.error) throw res.error;
          // Merge with local
          var allVeh = lsGet(LS_VEHICLES).filter(function (v) { return (v.user_id || 'usr_admin_default') !== uid; });
          allVeh = allVeh.concat(res.data || []);
          lsSet(LS_VEHICLES, allVeh);
          return res.data || [];
        } catch (e) {
          console.warn('Cloud getVehicles failed, fallback to local:', e);
        }
      }
      return lsGet(LS_VEHICLES).filter(function (v) {
        return (v.user_id || 'usr_admin_default') === uid;
      });
    }

    async function saveVehicle(vehicle) {
      var uid = getCurrentUserId();
      if (!vehicle.id) vehicle.id = generateId();
      vehicle.user_id = uid;
      vehicle.updated_at = new Date().toISOString();
      if (!vehicle.created_at) vehicle.created_at = vehicle.updated_at;

      if (isCloud()) {
        try {
          var cloudVeh = {
            id: vehicle.id,
            user_id: vehicle.user_id,
            name: vehicle.name,
            year: Number(vehicle.year) || new Date().getFullYear(),
            plate: vehicle.plate || '',
            current_odometer: Number(vehicle.current_odometer) || 0,
            preset_type: vehicle.preset_type || 'standard_matic',
            created_at: vehicle.created_at,
            updated_at: vehicle.updated_at
          };
          var res = await sb().from('vehicles').upsert(cloudVeh, { onConflict: 'id' });
          if (res.error) throw res.error;
        } catch (e) {
          console.warn('Cloud saveVehicle failed:', e);
        }
      }
      var arr = lsGet(LS_VEHICLES);
      var idx = arr.findIndex(function (v) { return v.id === vehicle.id; });
      if (idx >= 0) arr[idx] = vehicle; else arr.push(vehicle);
      lsSet(LS_VEHICLES, arr);
      return vehicle;
    }

    async function deleteVehicle(id) {
      if (isCloud()) {
        try {
          await sb().from('service_logs').delete().eq('vehicle_id', id);
          await sb().from('parts').delete().eq('vehicle_id', id);
          await sb().from('vehicles').delete().eq('id', id);
        } catch (e) {
          console.warn('Cloud deleteVehicle failed:', e);
        }
      }
      lsSet(LS_VEHICLES, lsGet(LS_VEHICLES).filter(function (v) { return v.id !== id; }));
      lsSet(LS_PARTS, lsGet(LS_PARTS).filter(function (p) { return p.vehicle_id !== id; }));
      lsSet(LS_LOGS, lsGet(LS_LOGS).filter(function (l) { return l.vehicle_id !== id; }));
    }

    async function getParts(vehicleId) {
      if (!vehicleId) return [];
      if (isCloud()) {
        try {
          var res = await sb().from('parts').select('*').eq('vehicle_id', vehicleId);
          if (res.error) throw res.error;
          var allParts = lsGet(LS_PARTS).filter(function (p) { return p.vehicle_id !== vehicleId; });
          allParts = allParts.concat(res.data || []);
          lsSet(LS_PARTS, allParts);
          return res.data || [];
        } catch (e) {
          console.warn('Cloud getParts failed:', e);
        }
      }
      return lsGet(LS_PARTS).filter(function (p) { return p.vehicle_id === vehicleId; });
    }

    async function savePart(part) {
      if (!part.id) part.id = generateId();
      part.updated_at = new Date().toISOString();
      if (!part.created_at) part.created_at = part.updated_at;

      if (isCloud()) {
        try {
          var cloudPart = {
            id: part.id,
            vehicle_id: part.vehicle_id,
            name: part.name,
            category: part.category,
            interval_km: Number(part.interval_km) || 4000,
            last_replaced_km: Number(part.last_replaced_km) || 0,
            icon: part.icon || 'wrench',
            image_url: part.image_url || null,
            est_price: Number(part.est_price) || 0,
            description: part.description || '',
            created_at: part.created_at,
            updated_at: part.updated_at
          };
          var res = await sb().from('parts').upsert(cloudPart, { onConflict: 'id' });
          if (res.error) throw res.error;
        } catch (e) {
          console.warn('Cloud savePart failed:', e);
        }
      }
      var cleanLocal = Object.assign({}, part);
      delete cleanLocal._status;
      delete cleanLocal._label;
      delete cleanLocal._percent;
      delete cleanLocal._usedKm;

      var arr = lsGet(LS_PARTS);
      var idx = arr.findIndex(function (p) { return p.id === cleanLocal.id; });
      if (idx >= 0) arr[idx] = cleanLocal; else arr.push(cleanLocal);
      lsSet(LS_PARTS, arr);
      return cleanLocal;
    }

    async function deletePart(id) {
      if (isCloud()) {
        try {
          await sb().from('parts').delete().eq('id', id);
        } catch (e) { console.warn('Cloud deletePart failed:', e); }
      }
      lsSet(LS_PARTS, lsGet(LS_PARTS).filter(function (p) { return p.id !== id; }));
    }

    async function getServiceLogs(vehicleId) {
      if (!vehicleId) return [];
      if (isCloud()) {
        try {
          var res = await sb().from('service_logs').select('*').eq('vehicle_id', vehicleId).order('service_date', { ascending: false });
          if (res.error) throw res.error;
          var allLogs = lsGet(LS_LOGS).filter(function (l) { return l.vehicle_id !== vehicleId; });
          allLogs = allLogs.concat(res.data || []);
          lsSet(LS_LOGS, allLogs);
          return res.data || [];
        } catch (e) {
          console.warn('Cloud getServiceLogs failed:', e);
        }
      }
      return lsGet(LS_LOGS)
        .filter(function (l) { return l.vehicle_id === vehicleId; })
        .sort(function (a, b) { return (b.service_date || '').localeCompare(a.service_date || ''); });
    }

    async function saveServiceLog(log) {
      if (!log.id) log.id = generateId();
      if (!log.created_at) log.created_at = new Date().toISOString();

      if (isCloud()) {
        try {
          var cloudLog = {
            id: log.id,
            vehicle_id: log.vehicle_id,
            part_id: log.part_id || null,
            part_name: log.part_name || '',
            part_category: log.part_category || '',
            service_date: log.service_date,
            odometer: Number(log.odometer) || 0,
            odometer_km: Number(log.odometer) || 0,
            part_brand: log.part_brand || '',
            shop_name: log.shop_name || '',
            part_price: Number(log.part_price) || 0,
            labor_fee: Number(log.labor_fee) || 0,
            notes: log.notes || '',
            created_at: log.created_at
          };
          var res = await sb().from('service_logs').upsert(cloudLog, { onConflict: 'id' });
          if (res.error) throw res.error;
        } catch (e) { console.warn('Cloud saveServiceLog failed:', e); }
      }
      var arr = lsGet(LS_LOGS);
      var idx = arr.findIndex(function (l) { return l.id === log.id; });
      if (idx >= 0) arr[idx] = log; else arr.push(log);
      lsSet(LS_LOGS, arr);
      return log;
    }

    async function deleteServiceLog(id) {
      if (isCloud()) {
        try {
          await sb().from('service_logs').delete().eq('id', id);
        } catch (e) { console.warn('Cloud deleteServiceLog failed:', e); }
      }
      lsSet(LS_LOGS, lsGet(LS_LOGS).filter(function (l) { return l.id !== id; }));
    }

    async function getAllData() {
      var uid = getCurrentUserId();
      var myVehicles = lsGet(LS_VEHICLES).filter(function (v) { return (v.user_id || 'usr_admin_default') === uid; });
      var myVehIds = myVehicles.map(function (v) { return v.id; });
      var myParts = lsGet(LS_PARTS).filter(function (p) { return myVehIds.indexOf(p.vehicle_id) >= 0; });
      var myLogs = lsGet(LS_LOGS).filter(function (l) { return myVehIds.indexOf(l.vehicle_id) >= 0; });

      return {
        user: getCurrentUser(),
        vehicles: myVehicles,
        parts: myParts,
        serviceLogs: myLogs
      };
    }

    async function importAllData(data) {
      var uid = getCurrentUserId();
      if (data.vehicles && data.vehicles.length) {
        var userVehicles = data.vehicles.map(function (v) {
          return Object.assign({}, v, { user_id: uid });
        });
        var otherVehicles = lsGet(LS_VEHICLES).filter(function (v) { return (v.user_id || 'usr_admin_default') !== uid; });
        lsSet(LS_VEHICLES, otherVehicles.concat(userVehicles));
      }
      if (data.parts && data.parts.length) {
        var importedPartIds = data.parts.map(function (p) { return p.id; });
        var otherParts = lsGet(LS_PARTS).filter(function (p) { return importedPartIds.indexOf(p.id) === -1; });
        lsSet(LS_PARTS, otherParts.concat(data.parts));
      }
      if (data.serviceLogs && data.serviceLogs.length) {
        var importedLogIds = data.serviceLogs.map(function (l) { return l.id; });
        var otherLogs = lsGet(LS_LOGS).filter(function (l) { return importedLogIds.indexOf(l.id) === -1; });
        lsSet(LS_LOGS, otherLogs.concat(data.serviceLogs));
      }

      if (isCloud()) {
        try {
          if (data.vehicles && data.vehicles.length) {
            await sb().from('vehicles').upsert(data.vehicles, { onConflict: 'id' });
          }
          if (data.parts && data.parts.length) {
            await sb().from('parts').upsert(data.parts, { onConflict: 'id' });
          }
          if (data.serviceLogs && data.serviceLogs.length) {
            await sb().from('service_logs').upsert(data.serviceLogs, { onConflict: 'id' });
          }
        } catch (e) { console.warn('Cloud import sync failed:', e); }
      }
    }

    async function clearAllData() {
      var uid = getCurrentUserId();
      var myVehicles = lsGet(LS_VEHICLES).filter(function (v) { return (v.user_id || 'usr_admin_default') === uid; });
      var myVehIds = myVehicles.map(function (v) { return v.id; });

      lsSet(LS_VEHICLES, lsGet(LS_VEHICLES).filter(function (v) { return (v.user_id || 'usr_admin_default') !== uid; }));
      lsSet(LS_PARTS, lsGet(LS_PARTS).filter(function (p) { return myVehIds.indexOf(p.vehicle_id) === -1; }));
      lsSet(LS_LOGS, lsGet(LS_LOGS).filter(function (l) { return myVehIds.indexOf(l.vehicle_id) === -1; }));

      if (isCloud()) {
        try {
          for (var i = 0; i < myVehIds.length; i++) {
            await sb().from('service_logs').delete().eq('vehicle_id', myVehIds[i]);
            await sb().from('parts').delete().eq('vehicle_id', myVehIds[i]);
            await sb().from('vehicles').delete().eq('id', myVehIds[i]);
          }
        } catch (e) { console.warn('Cloud clearAllData failed:', e); }
      }
    }

    function getAdminUsersData() {
      var users = getUsers();
      var allVehicles = lsGet(LS_VEHICLES);
      var allLogs = lsGet(LS_LOGS);

      var usersWithStats = users.map(function (u) {
        var userVehicles = allVehicles.filter(function (v) { return (v.user_id || 'usr_admin_default') === u.id; });
        var userVehIds = userVehicles.map(function (v) { return v.id; });
        var userLogs = allLogs.filter(function (l) { return userVehIds.indexOf(l.vehicle_id) >= 0; });
        return {
          id: u.id,
          username: u.username,
          fullName: u.fullName || u.username,
          created_at: u.created_at,
          isAdmin: u.username.toLowerCase() === 'admin',
          vehicleCount: userVehicles.length,
          logCount: userLogs.length,
          vehicles: userVehicles
        };
      });

      return {
        totalUsers: users.length,
        totalVehicles: allVehicles.length,
        totalLogs: allLogs.length,
        users: usersWithStats
      };
    }

    async function deleteUserByAdmin(userId) {
      var users = getUsers();
      var target = users.find(function (u) { return u.id === userId; });
      if (!target) throw new Error('Pengguna tidak ditemukan');
      if (target.username.toLowerCase() === 'admin') {
        throw new Error('Akun Administrator utama tidak dapat dihapus!');
      }

      // 1. Remove user from users list
      users = users.filter(function (u) { return u.id !== userId; });
      lsSet(LS_USERS, users);

      // 2. Cascade delete all vehicles, parts, logs belonging to user
      var allVehicles = lsGet(LS_VEHICLES);
      var userVehicles = allVehicles.filter(function (v) { return v.user_id === userId; });
      var userVehIds = userVehicles.map(function (v) { return v.id; });

      lsSet(LS_VEHICLES, allVehicles.filter(function (v) { return v.user_id !== userId; }));
      lsSet(LS_PARTS, lsGet(LS_PARTS).filter(function (p) { return userVehIds.indexOf(p.vehicle_id) === -1; }));
      lsSet(LS_LOGS, lsGet(LS_LOGS).filter(function (l) { return userVehIds.indexOf(l.vehicle_id) === -1; }));

      if (isCloud()) {
        try {
          for (var i = 0; i < userVehIds.length; i++) {
            await sb().from('service_logs').delete().eq('vehicle_id', userVehIds[i]);
            await sb().from('parts').delete().eq('vehicle_id', userVehIds[i]);
            await sb().from('vehicles').delete().eq('id', userVehIds[i]);
          }
        } catch (e) { console.warn('Cloud deleteUser failed:', e); }
      }

      return target;
    }

    function resetUserPasswordByAdmin(userId, newPassword) {
      var users = getUsers();
      var user = users.find(function (u) { return u.id === userId; });
      if (!user) throw new Error('Pengguna tidak ditemukan');
      if (!newPassword || newPassword.length < 4) throw new Error('Password baru minimal 4 karakter!');

      user.password = newPassword;
      saveUser(user);
      return user;
    }

    return {
      getUsers: getUsers,
      saveUser: saveUser,
      registerUser: registerUser,
      authenticateUser: authenticateUser,
      getCurrentUser: getCurrentUser,
      setCurrentUser: setCurrentUser,
      clearCurrentUser: clearCurrentUser,
      updateUserProfile: updateUserProfile,
      getAdminUsersData: getAdminUsersData,
      deleteUserByAdmin: deleteUserByAdmin,
      resetUserPasswordByAdmin: resetUserPasswordByAdmin,
      getVehicles: getVehicles,
      saveVehicle: saveVehicle,
      deleteVehicle: deleteVehicle,
      getParts: getParts,
      savePart: savePart,
      deletePart: deletePart,
      getServiceLogs: getServiceLogs,
      saveServiceLog: saveServiceLog,
      deleteServiceLog: deleteServiceLog,
      getAllData: getAllData,
      importAllData: importAllData,
      clearAllData: clearAllData
    };
  })();

  // ── Toast Module ───────────────────────────────────────────

  function showToast(message, type) {
    type = type || 'info';
    var iconMap = {
      success: 'check-circle',
      error: 'alert-circle',
      info: 'info',
      warning: 'alert-triangle'
    };
    var icon = iconMap[type] || 'info';
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML =
      '<div class="toast-content">' +
        '<i data-lucide="' + icon + '"></i>' +
        '<span>' + escHtml(message) + '</span>' +
      '</div>' +
      '<button class="toast-close"><i data-lucide="x"></i></button>';

    container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [toast] });

    var closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', function () {
      removeToast(toast);
    });

    setTimeout(function () {
      removeToast(toast);
    }, 4000);
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('fade-out');
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }

  // ── Modal Module ───────────────────────────────────────────

  function openModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  function closeModal(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop.active').forEach(function (m) {
      m.classList.remove('active');
    });
  }

  // ── Custom Animated Confirmation Dialog Module ──────────

  function showConfirmDialog(options) {
    return new Promise(function (resolve) {
      options = options || {};
      var modal = document.getElementById('confirmModal');
      var titleEl = document.getElementById('confirmTitle');
      var msgEl = document.getElementById('confirmMessage');
      var iconWrapper = document.getElementById('confirmIconWrapper');
      var iconEl = document.getElementById('confirmIcon');
      var btnProceed = document.getElementById('btnConfirmProceed');
      var btnCancel = document.getElementById('btnConfirmCancel');

      if (!modal) {
        resolve(confirm(options.messageText || 'Apakah Anda yakin ingin melanjutkan?'));
        return;
      }

      var type = options.type || 'danger'; // 'danger' | 'warning' | 'info'
      if (titleEl) titleEl.textContent = options.title || 'Konfirmasi Hapus';
      if (msgEl) msgEl.innerHTML = options.message || 'Apakah Anda yakin ingin menghapus data ini?';

      if (iconWrapper) {
        iconWrapper.className = 'confirm-icon-wrapper ' + type;
      }
      if (iconEl) {
        var iconName = options.icon || (type === 'danger' ? 'trash-2' : type === 'warning' ? 'alert-triangle' : 'help-circle');
        iconEl.setAttribute('data-lucide', iconName);
      }

      if (btnProceed) {
        btnProceed.className = 'btn ' + (type === 'danger' ? 'btn-danger' : 'btn-primary') + ' confirm-btn-proceed';
        btnProceed.innerHTML = '<i data-lucide="' + (options.confirmIcon || (type === 'danger' ? 'trash-2' : 'check')) + '"></i> ' + escHtml(options.confirmText || 'Hapus Sekarang');
      }

      if (btnCancel) {
        btnCancel.innerHTML = '<i data-lucide="x"></i> ' + escHtml(options.cancelText || 'Batal');
      }

      if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [modal] });

      openModal('confirmModal');

      var resolved = false;

      function cleanup(result) {
        if (resolved) return;
        resolved = true;
        closeModal('confirmModal');
        btnProceed.removeEventListener('click', onProceed);
        btnCancel.removeEventListener('click', onCancel);
        resolve(result);
      }

      function onProceed(e) {
        e.preventDefault();
        cleanup(true);
      }

      function onCancel(e) {
        e.preventDefault();
        cleanup(false);
      }

      btnProceed.addEventListener('click', onProceed);
      btnCancel.addEventListener('click', onCancel);
    });
  }

  // ── App State ──────────────────────────────────────────────

  var activeVehicleId = null;
  var currentStatusFilter = 'all';
  var currentCategoryFilter = 'all';
  var currentSearchText = '';
  var categoryChartInstance = null;

  // ── Auth Module (Multi-User) ───────────────────────────────

  function isAuthenticated() {
    return Boolean(DataStore.getCurrentUser());
  }

  function doLogin(username, password) {
    var user = DataStore.authenticateUser(username, password);
    if (user) {
      DataStore.setCurrentUser(user);
      return user;
    }
    return null;
  }

  function doRegister(fullName, username, password) {
    var user = DataStore.registerUser({ fullName: fullName, username: username, password: password });
    if (user) {
      DataStore.setCurrentUser(user);
      return user;
    }
    return null;
  }

  function doLogout() {
    DataStore.clearCurrentUser();
    activeVehicleId = null;
    showLoginScreen();
    showToast('Anda telah keluar dari aplikasi.', 'info');
  }

  function showLoginScreen() {
    var login = document.getElementById('loginScreen');
    var app = document.getElementById('authenticatedApp');
    if (login) login.style.display = '';
    if (app) app.style.display = 'none';

    switchAuthTab('login');
    var loginForm = document.getElementById('loginForm');
    var regForm = document.getElementById('registerForm');
    if (loginForm) loginForm.reset();
    if (regForm) regForm.reset();
    var errLogin = document.getElementById('loginErrorAlert');
    var errReg = document.getElementById('registerErrorAlert');
    if (errLogin) errLogin.style.display = 'none';
    if (errReg) errReg.style.display = 'none';
  }

  function showApp() {
    var login = document.getElementById('loginScreen');
    var app = document.getElementById('authenticatedApp');
    if (login) login.style.display = 'none';
    if (app) app.style.display = '';

    var user = DataStore.getCurrentUser();
    var headerName = document.getElementById('headerUserName');
    var headerBadge = document.getElementById('headerUserRoleBadge');
    var btnAdmin = document.getElementById('btnAdminUsersModal');
    var cloudPill = document.getElementById('cloudSyncStatusPill');
    var btnCloud = document.getElementById('btnOpenFirebaseModal');

    if (user) {
      if (headerName) headerName.textContent = user.fullName || user.username;
      var isAdmin = Boolean(user.username && user.username.toLowerCase() === 'admin');
      if (headerBadge) {
        if (isAdmin) {
          headerBadge.textContent = 'Administrator';
          headerBadge.classList.add('admin-role');
        } else {
          headerBadge.textContent = 'Pengguna';
          headerBadge.classList.remove('admin-role');
        }
      }
      if (btnAdmin) {
        if (isAdmin) {
          btnAdmin.style.display = '';
          btnAdmin.classList.remove('admin-only-hidden');
        } else {
          btnAdmin.style.display = 'none';
          btnAdmin.classList.add('admin-only-hidden');
        }
      }
      if (cloudPill) {
        if (isAdmin) {
          cloudPill.style.display = 'flex';
          cloudPill.classList.remove('admin-only-hidden');
        } else {
          cloudPill.style.display = 'none';
          cloudPill.classList.add('admin-only-hidden');
        }
      }
      if (btnCloud) {
        if (isAdmin) {
          btnCloud.style.display = '';
          btnCloud.classList.remove('admin-only-hidden');
        } else {
          btnCloud.style.display = 'none';
          btnCloud.classList.add('admin-only-hidden');
        }
      }
    }
  }

  function renderAdminUsersModal(searchQuery) {
    var stats = DataStore.getAdminUsersData();
    searchQuery = (searchQuery || '').toLowerCase().trim();

    var totalUsersEl = document.getElementById('adminTotalUsers');
    var totalVehEl = document.getElementById('adminTotalVehicles');
    var totalLogsEl = document.getElementById('adminTotalLogs');
    var tbody = document.getElementById('adminUsersTableBody');

    if (totalUsersEl) totalUsersEl.textContent = stats.totalUsers;
    if (totalVehEl) totalVehEl.textContent = stats.totalVehicles;
    if (totalLogsEl) totalLogsEl.textContent = stats.totalLogs;

    if (!tbody) return;

    var filteredUsers = stats.users.filter(function (u) {
      if (!searchQuery) return true;
      return (u.fullName && u.fullName.toLowerCase().indexOf(searchQuery) >= 0) ||
             (u.username && u.username.toLowerCase().indexOf(searchQuery) >= 0);
    });

    if (filteredUsers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="admin-empty-state"><i data-lucide="user-x" style="display:block;margin:0 auto 0.5rem;width:28px;height:28px;"></i>Tidak ada pengguna yang cocok dengan pencarian</td></tr>';
      if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [tbody] });
      return;
    }

    var html = '';
    filteredUsers.forEach(function (u) {
      var initial = (u.fullName || u.username || 'U').charAt(0).toUpperCase();
      var dateStr = u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

      html += '<tr>' +
        '<td>' +
          '<div class="admin-user-cell">' +
            '<div class="admin-user-avatar ' + (u.isAdmin ? 'is-admin' : '') + '">' + initial + '</div>' +
            '<div class="admin-user-name-group">' +
              '<span class="admin-user-fullname">' + escHtml(u.fullName) + '</span>' +
              '<span class="admin-user-subtext">' + (u.isAdmin ? 'Super Admin' : 'Anggota') + '</span>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td><code style="font-size:0.78rem;color:var(--primary-cyan);">@' + escHtml(u.username) + '</code></td>' +
        '<td>' + dateStr + '</td>' +
        '<td><span class="chip-badge">' + u.vehicleCount + ' Motor</span></td>' +
        '<td><span class="chip-badge">' + u.logCount + ' Servis</span></td>' +
        '<td>' +
          (u.isAdmin
            ? '<span class="admin-role-badge-tag role-admin"><i data-lucide="shield" style="width:12px;height:12px;"></i> Admin</span>'
            : '<span class="admin-role-badge-tag role-user"><i data-lucide="user" style="width:12px;height:12px;"></i> User</span>'
          ) +
        '</td>' +
        '<td>' +
          '<div class="admin-user-actions">' +
            (!u.isAdmin
              ? '<button class="btn-icon btn-xs btn-admin-reset-pw" data-user-id="' + u.id + '" data-user-name="' + escHtml(u.fullName) + '" title="Reset Password">' +
                  '<i data-lucide="key"></i>' +
                '</button>' +
                '<button class="btn-icon btn-xs btn-admin-delete-user" data-user-id="' + u.id + '" data-user-name="' + escHtml(u.fullName) + '" title="Hapus Akun Pengguna">' +
                  '<i data-lucide="trash-2"></i>' +
                '</button>'
              : '<span class="text-xs text-muted" style="font-size:0.72rem;color:var(--text-faint);">Utama</span>'
            ) +
          '</div>' +
        '</td>' +
      '</tr>';
    });

    tbody.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [tbody] });
  }

  function switchAuthTab(tab) {
    var tabLogin = document.getElementById('tabBtnLogin');
    var tabReg = document.getElementById('tabBtnRegister');
    var formLogin = document.getElementById('loginForm');
    var formReg = document.getElementById('registerForm');

    if (tab === 'login') {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabReg) tabReg.classList.remove('active');
      if (formLogin) { formLogin.style.display = ''; formLogin.classList.add('active'); }
      if (formReg) { formReg.style.display = 'none'; formReg.classList.remove('active'); }
    } else {
      if (tabReg) tabReg.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
      if (formReg) { formReg.style.display = ''; formReg.classList.add('active'); }
      if (formLogin) { formLogin.style.display = 'none'; formLogin.classList.remove('active'); }
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ── Vehicle Module ─────────────────────────────────────────

  async function loadVehicles() {
    var user = DataStore.getCurrentUser();
    var vehicles = await DataStore.getVehicles();

    // If default admin and 0 vehicles, load demo data
    if ((!vehicles || vehicles.length === 0) && user && user.username === 'admin') {
      await loadDemoData();
      vehicles = await DataStore.getVehicles();
    }

    if (vehicles && vehicles.length > 0) {
      if (!activeVehicleId || !vehicles.find(function (v) { return v.id === activeVehicleId; })) {
        activeVehicleId = vehicles[0].id;
      }
    } else {
      activeVehicleId = null;
    }
    renderVehicleDropdown(vehicles || []);
    return vehicles || [];
  }

  function renderVehicleDropdown(vehicles) {
    var container = document.getElementById('vehicleListOptions');
    if (!container) return;

    if (!vehicles || vehicles.length === 0) {
      container.innerHTML = '<div class="dropdown-empty">Belum ada motor terdaftar</div>';
      return;
    }

    var html = '';
    vehicles.forEach(function (v) {
      var isActive = v.id === activeVehicleId;
      html +=
        '<div class="vehicle-option' + (isActive ? ' active' : '') + '" data-vehicle-id="' + v.id + '">' +
          '<div class="vehicle-option-info">' +
            '<strong>' + escHtml(v.name) + '</strong>' +
            '<span>' + escHtml(v.plate || '-') + ' &bull; ' + (v.year || '-') + '</span>' +
          '</div>' +
          '<div class="vehicle-option-actions">' +
            (isActive ? '<span class="active-badge">Aktif</span>' : '') +
            '<button class="btn-icon btn-xs btn-edit-vehicle" data-vehicle-id="' + v.id + '" title="Edit Motor">' +
              '<i data-lucide="edit-3"></i>' +
            '</button>' +
            '<button class="btn-icon btn-xs btn-delete-vehicle" data-vehicle-id="' + v.id + '" title="Hapus Motor">' +
              '<i data-lucide="trash-2"></i>' +
            '</button>' +
          '</div>' +
        '</div>';
    });
    container.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [container] });
  }

  async function switchVehicle(id) {
    activeVehicleId = id;
    var vehicles = await DataStore.getVehicles();
    var vehicle = vehicles.find(function (v) { return v.id === id; });
    if (!vehicle) return;

    // Update header
    var nameEl = document.getElementById('activeVehicleName');
    if (nameEl) nameEl.textContent = vehicle.name || 'Motor';

    // Update hero
    var plateEl = document.getElementById('vehPlate');
    if (plateEl) plateEl.textContent = vehicle.plate || '-';

    var fullNameEl = document.getElementById('vehFullName');
    if (fullNameEl) fullNameEl.textContent = (vehicle.name || '') + ' (' + (vehicle.year || '-') + ')';

    var metaEl = document.getElementById('vehMetaInfo');
    if (metaEl) {
      var updatedStr = vehicle.updated_at ? formatDate(vehicle.updated_at.substring(0, 10)) : 'Hari Ini';
      metaEl.textContent = 'Terakhir Update: ' + updatedStr;
    }

    // Update odometer
    updateOdometerDisplay(vehicle.current_odometer || 0);

    // Re-render dropdown to show active indicator
    renderVehicleDropdown(vehicles);

    // Close dropdown
    var ddMenu = document.getElementById('vehicleDropdownMenu');
    if (ddMenu) ddMenu.classList.remove('active');

    // Refresh all data views
    await refreshAllData();
  }

  function updateOdometerDisplay(km) {
    var el = document.getElementById('odometerDigitDisplay');
    if (!el) return;
    var str = String(Math.max(0, Math.floor(km))).padStart(6, '0');
    var html = '';
    for (var i = 0; i < str.length; i++) {
      html += '<span class="digit">' + str[i] + '</span>';
    }
    el.innerHTML = html;
  }

  async function createDefaultParts(vehicleId, currentOdometer) {
    for (var i = 0; i < DEFAULT_PARTS_PRESET.length; i++) {
      var preset = DEFAULT_PARTS_PRESET[i];
      var part = {
        id: generateId(),
        vehicle_id: vehicleId,
        name: preset.name,
        category: preset.category,
        interval_km: preset.interval_km,
        last_replaced_km: currentOdometer || 0,
        icon: preset.icon,
        image_url: preset.image_url || null,
        est_price: preset.est_price,
        description: preset.description
      };
      await DataStore.savePart(part);
    }
  }

  function renderNoVehicleState() {
    activeVehicleId = null;

    // 1. Update active vehicle selector trigger
    var nameEl = document.getElementById('activeVehicleName');
    if (nameEl) nameEl.textContent = 'Belum Ada Motor';

    // 2. Update hero overview
    var plateEl = document.getElementById('vehPlate');
    if (plateEl) {
      plateEl.textContent = 'MOTOR BELUM TERDAFTAR';
      plateEl.style.opacity = '0.6';
    }

    var fullNameEl = document.getElementById('vehFullName');
    if (fullNameEl) fullNameEl.textContent = 'Belum Ada Motor Ditambahkan';

    var metaEl = document.getElementById('vehMetaInfo');
    if (metaEl) metaEl.textContent = 'Klik tombol "+ Tambah Motor Baru" untuk mulai memantau dan melacak kondisi sparepart.';

    // 3. Reset Summary numbers
    var critEl = document.getElementById('countCritical');
    var warnEl = document.getElementById('countWarning');
    var safeEl = document.getElementById('countSafe');
    var expEl = document.getElementById('totalServiceExpense');
    if (critEl) critEl.textContent = '0';
    if (warnEl) warnEl.textContent = '0';
    if (safeEl) safeEl.textContent = '0';
    if (expEl) expEl.textContent = 'Rp 0';

    // 4. Reset Odometer digits to 000000
    updateOdometerDisplay(0);

    // 5. Hide Top Alert Banner and Bell Badge
    var banner = document.getElementById('maintenanceAlertBanner');
    if (banner) banner.style.display = 'none';
    var bellBadge = document.getElementById('headerAlertBellBadge');
    if (bellBadge) bellBadge.style.display = 'none';

    // 6. Render clean empty states
    renderParts([]);
    renderHistory([]);
    loadStatistics();
  }

  // ── Parts Module ───────────────────────────────────────────

  function calcPartStatus(part, currentOdometer) {
    var usedKm = currentOdometer - (part.last_replaced_km || 0);
    if (usedKm < 0) usedKm = 0;
    var intervalKm = part.interval_km || 1;
    var percent = Math.round((usedKm / intervalKm) * 100);
    var status, label;
    if (percent >= 100) {
      status = 'danger';
      label = 'Wajib Ganti!';
    } else if (percent >= 70) {
      status = 'warning';
      label = 'Perlu Perhatian';
    } else {
      status = 'safe';
      label = 'Kondisi Aman';
    }
    return { usedKm: usedKm, percent: percent, status: status, label: label };
  }

  async function loadParts() {
    if (!activeVehicleId) {
      renderParts([]);
      return;
    }
    var parts = await DataStore.getParts(activeVehicleId);
    renderParts(parts);
  }

  function renderParts(parts) {
    var grid = document.getElementById('partsGrid');
    var emptyState = document.getElementById('emptyPartsState');
    var tabCount = document.getElementById('tabPartCount');

    if (!activeVehicleId) {
      if (tabCount) tabCount.textContent = '0';
      if (grid) { grid.innerHTML = ''; grid.style.display = 'none'; }
      if (emptyState) {
        emptyState.style.display = '';
        emptyState.innerHTML =
          '<div class="empty-icon"><i data-lucide="bike"></i></div>' +
          '<h3>Belum Ada Motor Terdaftar</h3>' +
          '<p>Anda belum memiliki motor yang dipantau. Tambahkan motor pertama Anda untuk mulai melacak kondisi sparepart.</p>' +
          '<button class="btn btn-primary" id="btnEmptyAddVehicle" style="margin-top:1rem;">' +
            '<i data-lucide="plus-circle"></i> Tambah Motor Pertama' +
          '</button>';
        if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [emptyState] });
        var btnEmptyVeh = document.getElementById('btnEmptyAddVehicle');
        if (btnEmptyVeh) {
          btnEmptyVeh.addEventListener('click', function() {
            var form = document.getElementById('vehicleForm');
            if (form) form.reset();
            var editIdEl = document.getElementById('editVehicleId');
            if (editIdEl) editIdEl.value = '';
            var title = document.getElementById('vehicleModalTitle');
            if (title) title.innerHTML = '<i data-lucide="plus-circle"></i> Tambah Motor Baru';
            var presetGroup = document.getElementById('vehPresetGroup');
            if (presetGroup) presetGroup.style.display = '';
            openModal('vehicleModal');
            if (typeof lucide !== 'undefined') lucide.createIcons();
          });
        }
      }
      return;
    }

    var vehicles = JSON.parse(localStorage.getItem('mototrack_vehicles') || '[]');
    var vehicle = vehicles.find(function (v) { return v.id === activeVehicleId; });
    var currentOdo = vehicle ? (vehicle.current_odometer || 0) : 0;

    // Augment with status
    var augmented = parts.map(function (p) {
      var s = calcPartStatus(p, currentOdo);
      return Object.assign({}, p, { _status: s.status, _label: s.label, _percent: s.percent, _usedKm: s.usedKm });
    });

    // Filter
    var filtered = augmented.filter(function (p) {
      if (currentStatusFilter !== 'all' && p._status !== currentStatusFilter) return false;
      if (currentCategoryFilter !== 'all' && p.category !== currentCategoryFilter) return false;
      if (currentSearchText) {
        var q = currentSearchText.toLowerCase();
        if ((p.name || '').toLowerCase().indexOf(q) === -1) return false;
      }
      return true;
    });

    // Sort: danger first, warning, safe
    var statusOrder = { danger: 0, warning: 1, safe: 2 };
    filtered.sort(function (a, b) {
      return (statusOrder[a._status] || 2) - (statusOrder[b._status] || 2);
    });

    var grid = document.getElementById('partsGrid');
    var emptyState = document.getElementById('emptyPartsState');
    var tabCount = document.getElementById('tabPartCount');

    if (tabCount) tabCount.textContent = parts.length;

    if (filtered.length === 0) {
      if (grid) grid.style.display = 'none';
      if (emptyState) emptyState.style.display = '';
    } else {
      if (grid) grid.style.display = '';
      if (emptyState) emptyState.style.display = 'none';
    }

    if (!grid) return;

    var html = '';
    filtered.forEach(function (p) {
      var displayPercent = Math.min(p._percent, 100);
      var partImg = getPartImage(p);
      html +=
        '<div class="part-card" data-part-id="' + p.id + '" data-status="' + p._status + '">' +
          '<div class="part-card-header">' +
            '<div class="part-header-main">' +
              '<div class="part-icon-wrapper ' + p._status + '">' +
                '<i data-lucide="' + (p.icon || 'wrench') + '"></i>' +
              '</div>' +
              '<div class="part-title-group">' +
                '<h4 class="part-name">' + escHtml(p.name) + '</h4>' +
                '<span class="part-category-badge">' + escHtml(getCategoryLabel(p.category)) + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="part-image-badge" title="' + escHtml(p.name) + '">' +
              '<img src="' + partImg + '" alt="' + escHtml(p.name) + '" class="part-preview-img" loading="lazy" />' +
            '</div>' +
          '</div>' +
          '<div class="part-status-section">' +
            '<div class="part-progress-bar">' +
              '<div class="part-progress-fill ' + p._status + '" style="width: ' + displayPercent + '%"></div>' +
            '</div>' +
            '<div class="part-progress-text">' + p._usedKm.toLocaleString('id-ID') + ' / ' + (p.interval_km || 0).toLocaleString('id-ID') + ' KM (' + p._percent + '%)</div>' +
            '<span class="part-status-badge ' + p._status + '">' + escHtml(p._label) + '</span>' +
          '</div>' +
          '<div class="part-info-row">' +
            '<span>Terakhir diganti: ' + (p.last_replaced_km || 0).toLocaleString('id-ID') + ' KM</span>' +
            '<span>Estimasi: ' + formatRupiah(p.est_price || 0) + '</span>' +
          '</div>' +
          '<div class="part-actions">' +
            '<button class="btn btn-primary btn-sm btn-replace" data-part-id="' + p.id + '">' +
              '<i data-lucide="check-circle-2"></i> Tandai Sudah Diganti' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm btn-edit-part" data-part-id="' + p.id + '">' +
              '<i data-lucide="edit-3"></i>' +
            '</button>' +
            '<button class="btn btn-danger btn-sm btn-delete-part" data-part-id="' + p.id + '">' +
              '<i data-lucide="trash-2"></i>' +
            '</button>' +
          '</div>' +
        '</div>';
    });

    grid.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [grid] });

    // Update summary counters
    var dangerCount = 0, warningCount = 0, safeCount = 0;
    augmented.forEach(function (p) {
      if (p._status === 'danger') dangerCount++;
      else if (p._status === 'warning') warningCount++;
      else safeCount++;
    });

    var critEl = document.getElementById('countCritical');
    var warnEl = document.getElementById('countWarning');
    var safeEl = document.getElementById('countSafe');
    if (critEl) critEl.textContent = dangerCount;
    if (warnEl) warnEl.textContent = warningCount;
    if (safeEl) safeEl.textContent = safeCount;

    // Update maintenance notification bell & banner
    updateMaintenanceAlertNotification(augmented, vehicle, false);

    // Total service expense from logs
    updateTotalExpense();
  }

  // ── Maintenance Reminder Notification Module ───────────────

  function updateMaintenanceAlertNotification(augmentedParts, vehicle, autoPopup) {
    if (!augmentedParts || !vehicle) return;

    var criticalParts = augmentedParts.filter(function (p) { return p._status === 'danger'; });
    var warningParts = augmentedParts.filter(function (p) { return p._status === 'warning'; });
    var urgentParts = criticalParts.concat(warningParts);
    var totalUrgent = urgentParts.length;

    // 1. Update Header Bell Badge
    var bellBadge = document.getElementById('headerAlertBellBadge');
    if (bellBadge) {
      if (totalUrgent > 0) {
        bellBadge.textContent = totalUrgent;
        bellBadge.style.display = 'flex';
      } else {
        bellBadge.style.display = 'none';
      }
    }

    // 2. Update Top Alert Banner
    var banner = document.getElementById('maintenanceAlertBanner');
    var bannerTitle = document.getElementById('alertBannerTitle');
    var bannerMsg = document.getElementById('alertBannerMessage');

    if (banner) {
      if (totalUrgent > 0) {
        banner.style.display = 'flex';
        var vehName = vehicle.name || 'Motor Anda';
        if (bannerTitle) {
          bannerTitle.innerHTML = '🚨 Pengingat Servis: <strong>' + escHtml(vehName) + '</strong>';
        }
        if (bannerMsg) {
          var msgParts = [];
          if (criticalParts.length > 0) msgParts.push('<strong>' + criticalParts.length + ' part Wajib Ganti</strong>');
          if (warningParts.length > 0) msgParts.push('<strong>' + warningParts.length + ' part Perhatian</strong>');
          bannerMsg.innerHTML = 'Perhatian! Terdapat ' + msgParts.join(' dan ') + ' berdasarkan KM terkini (' + (vehicle.current_odometer || 0).toLocaleString('id-ID') + ' KM).';
        }
      } else {
        banner.style.display = 'none';
      }
    }

    // 3. Populate Maintenance Alert Modal
    var modalCritText = document.getElementById('alertCriticalCountText');
    var modalWarnText = document.getElementById('alertWarningCountText');
    var modalVehName = document.getElementById('alertVehicleNameDisplay');
    var listContainer = document.getElementById('alertPartsListContainer');

    if (modalCritText) modalCritText.textContent = criticalParts.length + ' Part Wajib Ganti';
    if (modalWarnText) modalWarnText.textContent = warningParts.length + ' Part Perhatian';
    if (modalVehName) modalVehName.textContent = (vehicle.name || 'Motor') + ' (' + (vehicle.current_odometer || 0).toLocaleString('id-ID') + ' KM)';

    if (listContainer) {
      if (urgentParts.length === 0) {
        listContainer.innerHTML = '<div class="alert-empty-state"><i data-lucide="check-circle" style="width:32px;height:32px;color:var(--color-safe);margin:0 auto 0.5rem;display:block;"></i>Semua komponen motor dalam kondisi prima & aman!</div>';
      } else {
        var html = '';
        urgentParts.forEach(function (p) {
          var isCrit = p._status === 'danger';
          var statusClass = isCrit ? 'critical' : 'warning';
          var statusText = isCrit ? 'Wajib Ganti' : 'Perhatian';
          var remainingKm = (p.interval_km || 0) - p._usedKm;
          var partImg = getPartImage(p);
          var kmInfoText = isCrit
            ? 'Terlambat <strong style="color:#fca5a5;">+' + Math.abs(remainingKm).toLocaleString('id-ID') + ' KM</strong> dari jadwal batas'
            : 'Sisa pemakaian <strong style="color:#fcd34d;">' + remainingKm.toLocaleString('id-ID') + ' KM</strong> lagi';

          html +=
            '<div class="alert-part-card ' + statusClass + '">' +
              '<div class="alert-part-left">' +
                '<div class="part-image-badge alert-thumb" style="width:44px;height:44px;background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.1);">' +
                  '<img src="' + partImg + '" alt="' + escHtml(p.name) + '" class="part-preview-img" />' +
                '</div>' +
                '<div class="alert-details">' +
                  '<div class="alert-part-name-row">' +
                    '<span class="alert-part-name">' + escHtml(p.name) + '</span>' +
                    '<span class="part-category-badge" style="font-size:0.68rem;">' + escHtml(getCategoryLabel(p.category)) + '</span>' +
                  '</div>' +
                  '<div class="alert-part-km-info ' + statusClass + '">' +
                    kmInfoText + ' (Interval: ' + (p.interval_km || 0).toLocaleString('id-ID') + ' KM)' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="alert-part-right">' +
                '<span class="alert-status-badge ' + statusClass + '">' + statusText + '</span>' +
                '<button type="button" class="btn btn-primary btn-sm btn-alert-service-part" data-part-id="' + p.id + '">' +
                  '<i data-lucide="check-circle-2"></i> Ganti Part' +
                '</button>' +
              '</div>' +
            '</div>';
        });
        listContainer.innerHTML = html;
      }
      if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [listContainer] });
    }

    // 4. Auto Popup on login / initial launch if urgent parts exist
    if (autoPopup && totalUrgent > 0) {
      openModal('maintenanceAlertModal');
    }
  }

  async function checkAndShowMaintenanceAlerts(autoPopup) {
    if (!activeVehicleId) return;
    var vehicles = await DataStore.getVehicles();
    var vehicle = vehicles.find(function (v) { return v.id === activeVehicleId; });
    if (!vehicle) return;

    var parts = await DataStore.getParts(activeVehicleId);
    var currentOdo = vehicle.current_odometer || 0;
    var augmented = parts.map(function (p) {
      var s = calcPartStatus(p, currentOdo);
      return Object.assign({}, p, { _status: s.status, _label: s.label, _percent: s.percent, _usedKm: s.usedKm });
    });

    updateMaintenanceAlertNotification(augmented, vehicle, autoPopup);
  }

  async function updateTotalExpense() {
    if (!activeVehicleId) return;
    var logs = await DataStore.getServiceLogs(activeVehicleId);
    var total = 0;
    logs.forEach(function (l) {
      total += (Number(l.part_price) || 0) + (Number(l.labor_fee) || 0);
    });
    var el = document.getElementById('totalServiceExpense');
    if (el) el.textContent = formatRupiah(total);
  }

  // ── Service History Module ─────────────────────────────────

  async function loadHistory() {
    if (!activeVehicleId) {
      renderHistory([]);
      return;
    }
    var logs = await DataStore.getServiceLogs(activeVehicleId);
    renderHistory(logs);
  }

  function renderHistory(logs) {
    var container = document.getElementById('historyListContainer');
    var emptyState = document.getElementById('emptyHistoryState');
    var tabCount = document.getElementById('tabHistoryCount');

    if (tabCount) tabCount.textContent = logs.length;

    if (!logs || logs.length === 0) {
      if (container) container.innerHTML = '';
      if (container) container.style.display = 'none';
      if (emptyState) emptyState.style.display = '';
      return;
    }

    if (container) container.style.display = '';
    if (emptyState) emptyState.style.display = 'none';

    var html = '';
    logs.forEach(function (l) {
      var totalCost = (Number(l.part_price) || 0) + (Number(l.labor_fee) || 0);
      html +=
        '<div class="history-item" data-log-id="' + l.id + '">' +
          '<div class="history-item-header">' +
            '<div>' +
              '<span class="history-date">' + formatDate(l.service_date) + '</span>' +
              '<span class="history-part-name">' + escHtml(l.part_name || '-') + '</span>' +
            '</div>' +
            '<span class="history-cost">' + formatRupiah(totalCost) + '</span>' +
          '</div>' +
          '<div class="history-item-body">' +
            '<div class="history-detail-row"><strong>KM Saat Servis:</strong> ' + (l.odometer || 0).toLocaleString('id-ID') + ' KM</div>' +
            '<div class="history-detail-row"><strong>Merek/Tipe:</strong> ' + escHtml(l.part_brand || '-') + '</div>' +
            '<div class="history-detail-row"><strong>Bengkel:</strong> ' + escHtml(l.shop_name || '-') + '</div>' +
            '<div class="history-detail-row"><strong>Harga Part:</strong> ' + formatRupiah(l.part_price || 0) + '</div>' +
            '<div class="history-detail-row"><strong>Ongkos Jasa:</strong> ' + formatRupiah(l.labor_fee || 0) + '</div>' +
            (l.notes ? '<div class="history-notes">' + escHtml(l.notes) + '</div>' : '') +
          '</div>' +
          '<button class="btn btn-danger btn-sm history-delete-btn" data-log-id="' + l.id + '">' +
            '<i data-lucide="trash-2"></i> Hapus' +
          '</button>' +
        '</div>';
    });

    if (container) {
      container.innerHTML = html;
      if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [container] });
    }
  }

  // ── Statistics Module ──────────────────────────────────────

  async function loadStatistics() {
    if (!activeVehicleId) {
      var elTotal = document.getElementById('statsTotalCost');
      if (elTotal) elTotal.textContent = 'Rp 0';
      var elCount = document.getElementById('statsServiceCount');
      if (elCount) elCount.textContent = 'Dari 0 kali transaksi';
      var elAvg = document.getElementById('statsAvgCost');
      if (elAvg) elAvg.textContent = 'Rp 0';
      var elHealth = document.getElementById('statsHealthScore');
      if (elHealth) elHealth.textContent = '100%';
      var elHealthText = document.getElementById('statsHealthText');
      if (elHealthText) elHealthText.textContent = 'Belum Ada Data Motor';
      var elLastDate = document.getElementById('statsLastServiceDate');
      if (elLastDate) elLastDate.textContent = '-';
      var elLastPart = document.getElementById('statsLastServicePart');
      if (elLastPart) elLastPart.textContent = '-';
      renderCategoryChart([], []);
      renderFrequentParts([]);
      return;
    }

    var logs = await DataStore.getServiceLogs(activeVehicleId);
    var parts = await DataStore.getParts(activeVehicleId);
    var vehicles = await DataStore.getVehicles();
    var vehicle = vehicles.find(function (v) { return v.id === activeVehicleId; });
    var currentOdo = vehicle ? (vehicle.current_odometer || 0) : 0;

    // Total cost
    var totalCost = 0;
    logs.forEach(function (l) {
      totalCost += (Number(l.part_price) || 0) + (Number(l.labor_fee) || 0);
    });
    var count = logs.length;

    var elTotal = document.getElementById('statsTotalCost');
    if (elTotal) elTotal.textContent = formatRupiah(totalCost);

    var elCount = document.getElementById('statsServiceCount');
    if (elCount) elCount.textContent = 'Dari ' + count + ' kali transaksi';

    var elAvg = document.getElementById('statsAvgCost');
    if (elAvg) elAvg.textContent = count > 0 ? formatRupiah(Math.round(totalCost / count)) : 'Rp 0';

    // Health score
    var safeCount = 0;
    parts.forEach(function (p) {
      var s = calcPartStatus(p, currentOdo);
      if (s.status === 'safe') safeCount++;
    });
    var healthPercent = parts.length > 0 ? Math.round((safeCount / parts.length) * 100) : 100;
    var elHealth = document.getElementById('statsHealthScore');
    if (elHealth) elHealth.textContent = healthPercent + '%';

    var elHealthText = document.getElementById('statsHealthText');
    if (elHealthText) {
      if (healthPercent >= 80) elHealthText.textContent = 'Kondisi Sangat Prima';
      else if (healthPercent >= 60) elHealthText.textContent = 'Kondisi Baik';
      else if (healthPercent >= 40) elHealthText.textContent = 'Perlu Perhatian';
      else elHealthText.textContent = 'Kondisi Kritis';
    }

    // Last service
    var elLastDate = document.getElementById('statsLastServiceDate');
    var elLastPart = document.getElementById('statsLastServicePart');
    if (logs.length > 0) {
      if (elLastDate) elLastDate.textContent = formatDate(logs[0].service_date);
      if (elLastPart) elLastPart.textContent = logs[0].part_name || '-';
    } else {
      if (elLastDate) elLastDate.textContent = '-';
      if (elLastPart) elLastPart.textContent = '-';
    }

    // Category expense chart
    renderCategoryChart(logs, parts);

    // Frequent parts
    renderFrequentParts(logs);
  }

  function renderCategoryChart(logs, parts) {
    var canvas = document.getElementById('categoryExpenseChart');
    if (!canvas) return;

    // Build part-id to category map
    var partCategoryMap = {};
    parts.forEach(function (p) {
      partCategoryMap[p.id] = p.category;
      // Also map by name for manual logs
      partCategoryMap[p.name] = p.category;
    });

    // Group expense by category
    var categoryTotals = {};
    logs.forEach(function (l) {
      var cost = (Number(l.part_price) || 0) + (Number(l.labor_fee) || 0);
      var cat = partCategoryMap[l.part_id] || partCategoryMap[l.part_name] || 'mesin';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + cost;
    });

    var labels = [];
    var data = [];
    var colors = [];
    Object.keys(CATEGORY_LABELS).forEach(function (key) {
      if (categoryTotals[key]) {
        labels.push(CATEGORY_LABELS[key]);
        data.push(categoryTotals[key]);
        colors.push(CATEGORY_COLORS[key]);
      }
    });

    if (categoryChartInstance) {
      categoryChartInstance.destroy();
      categoryChartInstance = null;
    }

    if (data.length === 0) {
      // No data, show empty text
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    categoryChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.label + ': ' + formatRupiah(context.raw);
              }
            }
          }
        }
      }
    });
  }

  function renderFrequentParts(logs) {
    var container = document.getElementById('frequentPartsList');
    if (!container) return;

    // Count occurrences by part_name
    var counts = {};
    logs.forEach(function (l) {
      var name = l.part_name || 'Tidak Diketahui';
      counts[name] = (counts[name] || 0) + 1;
    });

    var sorted = Object.keys(counts).map(function (k) {
      return { name: k, count: counts[k] };
    }).sort(function (a, b) { return b.count - a.count; }).slice(0, 5);

    if (sorted.length === 0) {
      container.innerHTML = '<p class="text-muted text-sm" style="padding: 1rem;">Belum ada data servis.</p>';
      return;
    }

    var html = '<div class="frequent-list">';
    sorted.forEach(function (item, idx) {
      html +=
        '<div class="frequent-item">' +
          '<span class="frequent-rank">#' + (idx + 1) + '</span>' +
          '<span class="frequent-name">' + escHtml(item.name) + '</span>' +
          '<span class="frequent-count">' + item.count + 'x</span>' +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  // ── Print Module ───────────────────────────────────────────

  async function generatePrintReport() {
    var vehicles = await DataStore.getVehicles();
    var vehicle = vehicles.find(function (v) { return v.id === activeVehicleId; });
    if (!vehicle) {
      showToast('Pilih motor terlebih dahulu', 'warning');
      return;
    }

    var parts = await DataStore.getParts(activeVehicleId);
    var logs = await DataStore.getServiceLogs(activeVehicleId);
    var currentOdo = vehicle.current_odometer || 0;

    var html = '<div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">';
    html += '<h1 style="margin-bottom:4px;">MOTO-TRACK - Laporan Servis</h1>';
    html += '<hr>';
    html += '<h3>' + escHtml(vehicle.name) + ' (' + (vehicle.year || '') + ')</h3>';
    html += '<p>Plat: ' + escHtml(vehicle.plate || '-') + ' &bull; Odometer: ' + currentOdo.toLocaleString('id-ID') + ' KM</p>';

    // Parts table
    html += '<h3 style="margin-top:24px;">Daftar Sparepart</h3>';
    html += '<table style="width:100%; border-collapse:collapse; font-size:13px;">';
    html += '<tr style="background:#f1f5f9;"><th style="border:1px solid #ddd;padding:6px;text-align:left;">Nama Part</th><th style="border:1px solid #ddd;padding:6px;">Kategori</th><th style="border:1px solid #ddd;padding:6px;">Interval</th><th style="border:1px solid #ddd;padding:6px;">Pemakaian</th><th style="border:1px solid #ddd;padding:6px;">Status</th></tr>';
    parts.forEach(function (p) {
      var s = calcPartStatus(p, currentOdo);
      var statusColor = s.status === 'danger' ? '#ef4444' : (s.status === 'warning' ? '#f59e0b' : '#22c55e');
      html += '<tr>';
      html += '<td style="border:1px solid #ddd;padding:6px;">' + escHtml(p.name) + '</td>';
      html += '<td style="border:1px solid #ddd;padding:6px;text-align:center;">' + escHtml(getCategoryLabel(p.category)) + '</td>';
      html += '<td style="border:1px solid #ddd;padding:6px;text-align:center;">' + (p.interval_km || 0).toLocaleString('id-ID') + ' KM</td>';
      html += '<td style="border:1px solid #ddd;padding:6px;text-align:center;">' + s.usedKm.toLocaleString('id-ID') + ' KM (' + s.percent + '%)</td>';
      html += '<td style="border:1px solid #ddd;padding:6px;text-align:center;color:' + statusColor + ';font-weight:bold;">' + escHtml(s.label) + '</td>';
      html += '</tr>';
    });
    html += '</table>';

    // Recent logs table
    if (logs.length > 0) {
      html += '<h3 style="margin-top:24px;">Riwayat Servis Terbaru</h3>';
      html += '<table style="width:100%; border-collapse:collapse; font-size:13px;">';
      html += '<tr style="background:#f1f5f9;"><th style="border:1px solid #ddd;padding:6px;">Tanggal</th><th style="border:1px solid #ddd;padding:6px;">Part</th><th style="border:1px solid #ddd;padding:6px;">KM</th><th style="border:1px solid #ddd;padding:6px;">Biaya</th><th style="border:1px solid #ddd;padding:6px;">Bengkel</th></tr>';
      logs.slice(0, 20).forEach(function (l) {
        var cost = (Number(l.part_price) || 0) + (Number(l.labor_fee) || 0);
        html += '<tr>';
        html += '<td style="border:1px solid #ddd;padding:6px;">' + formatDate(l.service_date) + '</td>';
        html += '<td style="border:1px solid #ddd;padding:6px;">' + escHtml(l.part_name || '-') + '</td>';
        html += '<td style="border:1px solid #ddd;padding:6px;text-align:center;">' + (l.odometer || 0).toLocaleString('id-ID') + '</td>';
        html += '<td style="border:1px solid #ddd;padding:6px;text-align:right;">' + formatRupiah(cost) + '</td>';
        html += '<td style="border:1px solid #ddd;padding:6px;">' + escHtml(l.shop_name || '-') + '</td>';
        html += '</tr>';
      });
      html += '</table>';
    }

    html += '<p style="margin-top:24px;font-size:11px;color:#999;">Dicetak pada: ' + new Date().toLocaleString('id-ID') + '</p>';
    html += '</div>';

    var printArea = document.getElementById('printArea');
    if (printArea) {
      printArea.innerHTML = html;
      window.print();
    }
  }

  // ── Export/Import Module ───────────────────────────────────

  async function exportJson() {
    try {
      var data = await DataStore.getAllData();
      var json = JSON.stringify(data, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'mototrack-backup-' + getTodayString() + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Data berhasil diekspor!', 'success');
    } catch (e) {
      showToast('Gagal mengekspor data: ' + e.message, 'error');
    }
  }

  async function importJson(file) {
    try {
      var text = await file.text();
      var data = JSON.parse(text);
      if (!data.vehicles || !data.parts || !data.serviceLogs) {
        showToast('Format file tidak valid. Harus berisi vehicles, parts, dan serviceLogs.', 'error');
        return;
      }
      await DataStore.importAllData(data);
      activeVehicleId = null;
      await initAppData();
      closeModal('dataBackupModal');
      showToast('Data berhasil dipulihkan dari backup!', 'success');
    } catch (e) {
      showToast('Gagal mengimpor data: ' + e.message, 'error');
    }
  }

  // ── Demo Data ──────────────────────────────────────────────

  async function loadDemoData() {
    await DataStore.clearAllData();

    // Vehicle 1
    var veh1Id = generateId();
    var vehicle1 = {
      id: veh1Id,
      name: 'Honda Vario 160 CBS',
      year: 2023,
      plate: 'B 4821 SIK',
      current_odometer: 24580,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await DataStore.saveVehicle(vehicle1);

    // Vehicle 1 Parts with varied last_replaced_km
    var v1Replacements = [20580, 18580, 20580, 18580, 8580, 8580, 4580, 12580, 10580, 8580, 2580, 4580, 8580];
    for (var i = 0; i < DEFAULT_PARTS_PRESET.length; i++) {
      var preset = DEFAULT_PARTS_PRESET[i];
      await DataStore.savePart({
        id: generateId(),
        vehicle_id: veh1Id,
        name: preset.name,
        category: preset.category,
        interval_km: preset.interval_km,
        last_replaced_km: v1Replacements[i],
        icon: preset.icon,
        est_price: preset.est_price,
        description: preset.description
      });
    }

    // Vehicle 1 Service Logs
    var v1Logs = [
      { service_date: '2026-08-15', part_name: 'Oli Mesin', odometer: 20580, part_brand: 'AHM MPX2 10W-30', shop_name: 'AHASS Jl. Sudirman', part_price: 65000, labor_fee: 15000, notes: 'Oli lama sudah hitam pekat' },
      { service_date: '2026-07-01', part_name: 'Filter Udara', odometer: 20580, part_brand: 'AHM Genuine', shop_name: 'AHASS Jl. Sudirman', part_price: 45000, labor_fee: 10000, notes: '' },
      { service_date: '2026-05-20', part_name: 'Busi', odometer: 18580, part_brand: 'NGK CPR9EA-9', shop_name: 'Bengkel Pak Agus', part_price: 38000, labor_fee: 10000, notes: 'Busi lama sudah aus' },
      { service_date: '2026-03-10', part_name: 'Kampas Rem Depan', odometer: 12580, part_brand: 'Indoparts', shop_name: 'AHASS Jl. Sudirman', part_price: 45000, labor_fee: 20000, notes: 'Rem sudah tipis, perlu diganti segera' },
      { service_date: '2025-12-05', part_name: 'Oli Mesin', odometer: 16580, part_brand: 'Motul Scooter Expert', shop_name: 'Bengkel Mitra', part_price: 72000, labor_fee: 15000, notes: '' },
      { service_date: '2025-08-20', part_name: 'V-Belt', odometer: 8580, part_brand: 'AHM Genuine V-Belt', shop_name: 'AHASS Jl. Sudirman', part_price: 125000, labor_fee: 50000, notes: 'Ganti sekaligus roller CVT' }
    ];
    for (var j = 0; j < v1Logs.length; j++) {
      await DataStore.saveServiceLog(Object.assign({ id: generateId(), vehicle_id: veh1Id }, v1Logs[j]));
    }

    // Vehicle 2
    var veh2Id = generateId();
    var vehicle2 = {
      id: veh2Id,
      name: 'Yamaha NMAX 155 ABS',
      year: 2022,
      plate: 'B 6712 XYZ',
      current_odometer: 31200,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await DataStore.saveVehicle(vehicle2);

    // Vehicle 2 Parts
    var v2Replacements = [27200, 25200, 27200, 25200, 15200, 15200, 11200, 19200, 20200, 15200, 8200, 12200, 15200];
    for (var k = 0; k < DEFAULT_PARTS_PRESET.length; k++) {
      var p2 = DEFAULT_PARTS_PRESET[k];
      await DataStore.savePart({
        id: generateId(),
        vehicle_id: veh2Id,
        name: p2.name,
        category: p2.category,
        interval_km: p2.interval_km,
        last_replaced_km: v2Replacements[k],
        icon: p2.icon,
        est_price: p2.est_price,
        description: p2.description
      });
    }

    // Vehicle 2 Service Logs
    var v2Logs = [
      { service_date: '2026-07-28', part_name: 'Oli Mesin', odometer: 27200, part_brand: 'Yamalube Blue Core', shop_name: 'Yamaha Shop Jl. Gatot Subroto', part_price: 68000, labor_fee: 15000, notes: '' },
      { service_date: '2026-06-05', part_name: 'Filter Udara', odometer: 27200, part_brand: 'Yamaha Genuine', shop_name: 'Yamaha Shop Jl. Gatot Subroto', part_price: 48000, labor_fee: 10000, notes: '' },
      { service_date: '2026-02-18', part_name: 'Coolant Radiator', odometer: 15200, part_brand: 'Yamaha Coolant', shop_name: 'Yamaha Shop Jl. Gatot Subroto', part_price: 55000, labor_fee: 20000, notes: 'Top up coolant radiator' },
      { service_date: '2025-10-12', part_name: 'Kampas Rem Belakang', odometer: 20200, part_brand: 'TDR Racing', shop_name: 'Bengkel Pak Rahmat', part_price: 42000, labor_fee: 15000, notes: '' }
    ];
    for (var m = 0; m < v2Logs.length; m++) {
      await DataStore.saveServiceLog(Object.assign({ id: generateId(), vehicle_id: veh2Id }, v2Logs[m]));
    }
  }

  // ── Refresh All Data ───────────────────────────────────────

  async function refreshAllData() {
    if (!activeVehicleId) {
      renderNoVehicleState();
      return;
    }
    await loadParts();
    await loadHistory();
    await loadStatistics();
    await updateTotalExpense();
  }

  async function initAppData(autoPopup) {
    var vehicles = await loadVehicles();
    if (activeVehicleId) {
      await switchVehicle(activeVehicleId);
      if (autoPopup) {
        await checkAndShowMaintenanceAlerts(true);
      }
    } else {
      renderNoVehicleState();
    }
  }

  // ── Cloud Sync Status ──────────────────────────────────────

  function updateCloudPill(connected) {
    var pill = document.getElementById('cloudSyncStatusPill');
    if (!pill) return;
    var user = DataStore.getCurrentUser();
    var isAdmin = Boolean(user && user.username && user.username.toLowerCase() === 'admin');
    if (!isAdmin) {
      pill.style.display = 'none';
      pill.classList.add('admin-only-hidden');
      return;
    }
    pill.classList.remove('admin-only-hidden');
    pill.style.display = 'flex';

    var dot = pill.querySelector('.sync-dot');
    var text = pill.querySelector('.sync-text');
    if (connected) {
      pill.classList.remove('offline');
      pill.classList.add('connected');
      if (text) text.textContent = 'Cloud Terhubung';
    } else {
      pill.classList.remove('connected');
      pill.classList.add('offline');
      if (text) text.textContent = 'Mode Lokal';
    }
  }

  async function tryAutoConnectCloud() {
    var user = DataStore.getCurrentUser();
    var isAdmin = Boolean(user && user.username && user.username.toLowerCase() === 'admin');
    if (!isAdmin) return;
    if (!window.SupabaseManager) return;
    var config = SupabaseManager.getConfig();
    if (!config || !config.url || !config.anonKey) return;

    try {
      var ok = await SupabaseManager.testConnection();
      updateCloudPill(ok);
    } catch (e) {
      updateCloudPill(false);
    }
  }

  // ── Event Listeners Setup ─────────────────────────────────

  function setupEventListeners() {

    // ── Auth Switcher Tabs ──
    var tabLogin = document.getElementById('tabBtnLogin');
    if (tabLogin) {
      tabLogin.addEventListener('click', function () {
        switchAuthTab('login');
      });
    }

    var tabReg = document.getElementById('tabBtnRegister');
    if (tabReg) {
      tabReg.addEventListener('click', function () {
        switchAuthTab('register');
      });
    }

    // ── Login Form ──
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        var username = document.getElementById('loginUsername').value.trim();
        var password = document.getElementById('loginPassword').value;
        var errorAlert = document.getElementById('loginErrorAlert');
        var errorMsg = document.getElementById('loginErrorMessage');

        var user = doLogin(username, password);
        if (user) {
          if (errorAlert) errorAlert.style.display = 'none';
          showApp();
          activeVehicleId = null;
          await initAppData(true);
          tryAutoConnectCloud();
          showToast('Selamat datang kembali, ' + (user.fullName || user.username) + '!', 'success');
        } else {
          if (errorAlert) errorAlert.style.display = '';
          if (errorMsg) errorMsg.textContent = 'Username atau password salah!';
        }
      });
    }

    // ── Register Form ──
    var regForm = document.getElementById('registerForm');
    if (regForm) {
      regForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        var fullName = document.getElementById('regFullName').value.trim();
        var username = document.getElementById('regUsername').value.trim();
        var password = document.getElementById('regPassword').value;
        var confirmPassword = document.getElementById('regConfirmPassword').value;
        var errorAlert = document.getElementById('registerErrorAlert');
        var errorMsg = document.getElementById('registerErrorMessage');

        if (!fullName || !username || !password) {
          if (errorAlert) errorAlert.style.display = '';
          if (errorMsg) errorMsg.textContent = 'Mohon lengkapi semua kolom bertanda *!';
          return;
        }

        if (password.length < 4) {
          if (errorAlert) errorAlert.style.display = '';
          if (errorMsg) errorMsg.textContent = 'Password minimal 4 karakter!';
          return;
        }

        if (password !== confirmPassword) {
          if (errorAlert) errorAlert.style.display = '';
          if (errorMsg) errorMsg.textContent = 'Konfirmasi password tidak cocok!';
          return;
        }

        try {
          var user = doRegister(fullName, username, password);
          if (user) {
            if (errorAlert) errorAlert.style.display = 'none';
            showApp();
            activeVehicleId = null;
            await initAppData(false);
            showToast('Akun berhasil didaftarkan! Selamat datang di MOTO-TRACK, ' + (user.fullName || user.username) + '!', 'success');
          }
        } catch (err) {
          if (errorAlert) errorAlert.style.display = '';
          if (errorMsg) errorMsg.textContent = err.message || 'Gagal mendaftarkan akun.';
        }
      });
    }

    // ── Toggle Password on Login ──
    var btnTogglePw = document.getElementById('btnTogglePassword');
    if (btnTogglePw) {
      btnTogglePw.addEventListener('click', function () {
        var pwInput = document.getElementById('loginPassword');
        var eyeIcon = document.getElementById('eyeIcon');
        if (!pwInput) return;
        if (pwInput.type === 'password') {
          pwInput.type = 'text';
          if (eyeIcon) eyeIcon.setAttribute('data-lucide', 'eye-off');
        } else {
          pwInput.type = 'password';
          if (eyeIcon) eyeIcon.setAttribute('data-lucide', 'eye');
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    }

    // ── Toggle Password on Register ──
    var btnToggleRegPw = document.getElementById('btnToggleRegPassword');
    if (btnToggleRegPw) {
      btnToggleRegPw.addEventListener('click', function () {
        var pwInput = document.getElementById('regPassword');
        var eyeIcon = document.getElementById('eyeRegIcon');
        if (!pwInput) return;
        if (pwInput.type === 'password') {
          pwInput.type = 'text';
          if (eyeIcon) eyeIcon.setAttribute('data-lucide', 'eye-off');
        } else {
          pwInput.type = 'password';
          if (eyeIcon) eyeIcon.setAttribute('data-lucide', 'eye');
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    }

    // ── User Profile Trigger & Modal ──
    var profileTrigger = document.getElementById('userProfileTrigger');
    if (profileTrigger) {
      profileTrigger.addEventListener('click', function () {
        var user = DataStore.getCurrentUser();
        if (!user) return;
        var nameInput = document.getElementById('profileFullName');
        var userInput = document.getElementById('profileUsername');
        var oldPwInput = document.getElementById('profileOldPassword');
        var newPwInput = document.getElementById('profileNewPassword');
        var confirmNewPwInput = document.getElementById('profileConfirmNewPassword');

        if (nameInput) nameInput.value = user.fullName || '';
        if (userInput) userInput.value = user.username || '';
        if (oldPwInput) oldPwInput.value = '';
        if (newPwInput) newPwInput.value = '';
        if (confirmNewPwInput) confirmNewPwInput.value = '';

        openModal('userProfileModal');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    }

    // ── User Profile Form Submit ──
    var userProfileForm = document.getElementById('userProfileForm');
    if (userProfileForm) {
      userProfileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var user = DataStore.getCurrentUser();
        if (!user) return;

        var fullName = document.getElementById('profileFullName').value.trim();
        var oldPw = document.getElementById('profileOldPassword').value;
        var newPw = document.getElementById('profileNewPassword').value;
        var confirmNewPw = document.getElementById('profileConfirmNewPassword').value;

        if (newPw) {
          if (!oldPw) {
            showToast('Masukkan password saat ini untuk mengganti password!', 'error');
            return;
          }
          if (newPw !== confirmNewPw) {
            showToast('Konfirmasi password baru tidak cocok!', 'error');
            return;
          }
        }

        try {
          var updated = DataStore.updateUserProfile(user.id, fullName, oldPw, newPw);
          var headerName = document.getElementById('headerUserName');
          if (headerName) headerName.textContent = updated.fullName || updated.username;
          closeModal('userProfileModal');
          showToast('Profil akun berhasil diperbarui!', 'success');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }

    // ── Admin Users Management Modal ──
    var btnAdminUsers = document.getElementById('btnAdminUsersModal');
    if (btnAdminUsers) {
      btnAdminUsers.addEventListener('click', function () {
        var searchInput = document.getElementById('adminSearchUserInput');
        if (searchInput) searchInput.value = '';
        renderAdminUsersModal('');
        openModal('adminUsersModal');
      });
    }

    // ── Admin Search User Filter ──
    var adminSearchInput = document.getElementById('adminSearchUserInput');
    if (adminSearchInput) {
      adminSearchInput.addEventListener('input', function (e) {
        renderAdminUsersModal(e.target.value);
      });
    }

    // ── Admin User Action Delegation (Reset Password & Delete User) ──
    var adminTableBody = document.getElementById('adminUsersTableBody');
    if (adminTableBody) {
      adminTableBody.addEventListener('click', async function (e) {
        // Reset password button
        var btnReset = e.target.closest('.btn-admin-reset-pw');
        if (btnReset) {
          var uid = btnReset.getAttribute('data-user-id');
          var uname = btnReset.getAttribute('data-user-name') || 'Pengguna';
          var newPw = prompt('Masukkan password baru untuk ' + uname + ' (minimal 4 karakter):');
          if (newPw !== null) {
            if (newPw.trim().length < 4) {
              showToast('Password baru minimal 4 karakter!', 'error');
              return;
            }
            try {
              DataStore.resetUserPasswordByAdmin(uid, newPw.trim());
              showToast('Password pengguna "' + uname + '" berhasil direset!', 'success');
            } catch (err) {
              showToast(err.message, 'error');
            }
          }
          return;
        }

        // Delete user button
        var btnDelete = e.target.closest('.btn-admin-delete-user');
        if (btnDelete) {
          var delUid = btnDelete.getAttribute('data-user-id');
          var delUname = btnDelete.getAttribute('data-user-name') || 'Pengguna';

          var confirmed = await showConfirmDialog({
            title: 'Hapus Akun Pengguna',
            message: 'Apakah Anda yakin ingin menghapus akun <strong>"' + escHtml(delUname) + '"</strong> beserta seluruh data motor dan riwayat servisnya?',
            icon: 'user-x',
            type: 'danger',
            confirmText: 'Ya, Hapus Akun',
            confirmIcon: 'trash-2'
          });

          if (confirmed) {
            try {
              await DataStore.deleteUserByAdmin(delUid);
              var searchVal = (document.getElementById('adminSearchUserInput') || {}).value || '';
              renderAdminUsersModal(searchVal);
              showToast('Akun pengguna "' + delUname + '" berhasil dihapus!', 'success');
            } catch (err) {
              showToast(err.message, 'error');
            }
          }
          return;
        }
      });
    }

    // ── Maintenance Reminder Listeners (Bell, Banner, Modal) ──
    var btnAlertBell = document.getElementById('btnHeaderAlertBell');
    if (btnAlertBell) {
      btnAlertBell.addEventListener('click', function () {
        checkAndShowMaintenanceAlerts(true);
      });
    }

    var btnBannerModal = document.getElementById('btnOpenAlertModalFromBanner');
    if (btnBannerModal) {
      btnBannerModal.addEventListener('click', function () {
        openModal('maintenanceAlertModal');
      });
    }

    var btnDismissBanner = document.getElementById('btnDismissAlertBanner');
    if (btnDismissBanner) {
      btnDismissBanner.addEventListener('click', function () {
        var banner = document.getElementById('maintenanceAlertBanner');
        if (banner) banner.style.display = 'none';
      });
    }

    var btnFilterUrgent = document.getElementById('btnFilterUrgentParts');
    if (btnFilterUrgent) {
      btnFilterUrgent.addEventListener('click', function () {
        closeModal('maintenanceAlertModal');
        setStatusFilterTo('danger');
      });
    }

    var alertListContainer = document.getElementById('alertPartsListContainer');
    if (alertListContainer) {
      alertListContainer.addEventListener('click', function (e) {
        var serviceBtn = e.target.closest('.btn-alert-service-part');
        if (serviceBtn) {
          var partId = serviceBtn.getAttribute('data-part-id');
          closeModal('maintenanceAlertModal');
          if (partId) handleReplacePart(partId);
        }
      });
    }

    // ── Logout ──
    var btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async function () {
        var confirmed = await showConfirmDialog({
          title: 'Keluar dari Aplikasi',
          message: 'Apakah Anda yakin ingin keluar dari akun Anda?',
          icon: 'log-out',
          type: 'warning',
          confirmText: 'Ya, Keluar',
          confirmIcon: 'log-out'
        });
        if (confirmed) {
          doLogout();
        }
      });
    }

    // ── Vehicle Dropdown Trigger ──
    var vehTrigger = document.getElementById('activeVehicleTrigger');
    if (vehTrigger) {
      vehTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var ddMenu = document.getElementById('vehicleDropdownMenu');
        if (ddMenu) ddMenu.classList.toggle('active');
      });
    }

    // ── Click outside dropdown to close ──
    document.addEventListener('click', function (e) {
      var ddMenu = document.getElementById('vehicleDropdownMenu');
      var wrapper = document.querySelector('.vehicle-selector-wrapper');
      if (ddMenu && ddMenu.classList.contains('active')) {
        if (!wrapper || !wrapper.contains(e.target)) {
          ddMenu.classList.remove('active');
        }
      }
    });

    // ── Vehicle List Click (delegation) ──
    var vehListEl = document.getElementById('vehicleListOptions');
    if (vehListEl) {
      vehListEl.addEventListener('click', async function (e) {
        // Edit vehicle button
        var editBtn = e.target.closest('.btn-edit-vehicle');
        if (editBtn) {
          e.stopPropagation();
          var editVid = editBtn.getAttribute('data-vehicle-id');
          if (editVid) handleEditVehicle(editVid);
          return;
        }

        // Delete vehicle button
        var deleteBtn = e.target.closest('.btn-delete-vehicle');
        if (deleteBtn) {
          e.stopPropagation();
          var vid = deleteBtn.getAttribute('data-vehicle-id');
          if (vid) {
            var vehicles = await DataStore.getVehicles();
            var targetVeh = vehicles.find(function (v) { return v.id === vid; });
            var vehName = targetVeh ? targetVeh.name : 'Motor';

            var confirmed = await showConfirmDialog({
              title: 'Hapus Motor Matic',
              message: 'Hapus motor <strong>"' + escHtml(vehName) + '"</strong> beserta seluruh daftar part dan riwayat servisnya?',
              icon: 'trash-2',
              type: 'danger',
              confirmText: 'Ya, Hapus Motor',
              confirmIcon: 'trash-2'
            });

            if (confirmed) {
              await DataStore.deleteVehicle(vid);
              if (vid === activeVehicleId) {
                activeVehicleId = null;
              }
              await initAppData();
              showToast('Motor "' + vehName + '" berhasil dihapus!', 'success');
            }
          }
          return;
        }

        // Switch vehicle
        var option = e.target.closest('.vehicle-option');
        if (option) {
          var id = option.getAttribute('data-vehicle-id');
          if (id) switchVehicle(id);
        }
      });
    }

    // ── Add Vehicle Modal ──
    var btnAddVeh = document.getElementById('btnOpenAddVehicleModal');
    if (btnAddVeh) {
      btnAddVeh.addEventListener('click', function () {
        var form = document.getElementById('vehicleForm');
        if (form) form.reset();
        var editId = document.getElementById('editVehicleId');
        if (editId) editId.value = '';
        var title = document.getElementById('vehicleModalTitle');
        if (title) title.innerHTML = '<i data-lucide="bike"></i> Tambah Motor Matic';
        var presetGroup = document.getElementById('vehPresetGroup');
        if (presetGroup) presetGroup.style.display = '';
        openModal('vehicleModal');
        if (typeof lucide !== 'undefined') lucide.createIcons();
        // Close dropdown
        var ddMenu = document.getElementById('vehicleDropdownMenu');
        if (ddMenu) ddMenu.classList.remove('active');
      });
    }

    // ── Vehicle Form Submit ──
    var vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
      vehicleForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        try {
          var editId = document.getElementById('editVehicleId').value;
          var name = document.getElementById('vehName').value.trim();
          var year = parseInt(document.getElementById('vehYear').value) || 2024;
          var plate = document.getElementById('vehPlateInput').value.trim().toUpperCase();
          var odo = parseInt(document.getElementById('vehCurrentOdoInput').value) || 0;
          var preset = document.getElementById('vehPresetType').value;

          var vehicle = {
            id: editId || generateId(),
            name: name,
            year: year,
            plate: plate,
            current_odometer: odo
          };

          await DataStore.saveVehicle(vehicle);

          // Auto-create default parts for new vehicle with standard_matic preset
          if (!editId && preset === 'standard_matic') {
            await createDefaultParts(vehicle.id, odo);
          }

          closeModal('vehicleModal');
          activeVehicleId = vehicle.id;
          await initAppData();
          showToast(editId ? 'Data motor "' + vehicle.name + '" berhasil diperbarui!' : 'Motor baru "' + vehicle.name + '" berhasil ditambahkan!', 'success');
        } catch (err) {
          showToast('Gagal menyimpan motor: ' + err.message, 'error');
        }
      });
    }

    // ── Edit Odometer ──
    var btnEditOdo = document.getElementById('btnEditOdometer');
    if (btnEditOdo) {
      btnEditOdo.addEventListener('click', async function () {
        var vehicles = await DataStore.getVehicles();
        var vehicle = vehicles.find(function (v) { return v.id === activeVehicleId; });
        var input = document.getElementById('inputNewOdometer');
        if (input && vehicle) input.value = vehicle.current_odometer || 0;
        openModal('editOdometerModal');
      });
    }

    // ── Odometer Form Submit ──
    var odoForm = document.getElementById('editOdometerForm');
    if (odoForm) {
      odoForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        try {
          var newOdo = parseInt(document.getElementById('inputNewOdometer').value);
          if (isNaN(newOdo) || newOdo < 0) {
            showToast('Nilai KM tidak valid', 'error');
            return;
          }
          var vehicles = await DataStore.getVehicles();
          var vehicle = vehicles.find(function (v) { return v.id === activeVehicleId; });
          if (vehicle) {
            vehicle.current_odometer = newOdo;
            await DataStore.saveVehicle(vehicle);
            updateOdometerDisplay(newOdo);
            await refreshAllData();
            closeModal('editOdometerModal');
            showToast('Odometer berhasil diperbarui ke ' + newOdo.toLocaleString('id-ID') + ' KM', 'success');
          }
        } catch (err) {
          showToast('Gagal memperbarui odometer: ' + err.message, 'error');
        }
      });
    }

    // ── Quick KM Increment Buttons ──
    document.querySelectorAll('.btn-chip[data-add-km]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        try {
          var addKm = parseInt(btn.getAttribute('data-add-km')) || 0;
          var vehicles = await DataStore.getVehicles();
          var vehicle = vehicles.find(function (v) { return v.id === activeVehicleId; });
          if (vehicle) {
            vehicle.current_odometer = (vehicle.current_odometer || 0) + addKm;
            await DataStore.saveVehicle(vehicle);
            updateOdometerDisplay(vehicle.current_odometer);
            await refreshAllData();
            showToast('+' + addKm + ' KM ditambahkan. Total: ' + vehicle.current_odometer.toLocaleString('id-ID') + ' KM', 'info');
          }
        } catch (err) {
          showToast('Gagal menambah KM: ' + err.message, 'error');
        }
      });
    });

    // ── Tab Buttons ──
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tabId = btn.getAttribute('data-tab');
        // Remove active from all tabs and panes
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-pane').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        var pane = document.getElementById(tabId);
        if (pane) pane.classList.add('active');
        // Refresh stats when switching to that tab
        if (tabId === 'expenseStatsTab') loadStatistics();
      });
    });

    // ── Status Filter ──
    var statusList = document.getElementById('statusFilterList');
    if (statusList) {
      statusList.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip-filter');
        if (!chip) return;
        statusList.querySelectorAll('.chip-filter').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        currentStatusFilter = chip.getAttribute('data-status-filter') || 'all';
        loadParts();
      });
    }

    // ── Category Filter ──
    var catList = document.getElementById('categoryFilterList');
    if (catList) {
      catList.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip-filter');
        if (!chip) return;
        catList.querySelectorAll('.chip-filter').forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        currentCategoryFilter = chip.getAttribute('data-category-filter') || 'all';
        loadParts();
      });
    }

    // ── Part Search ──
    var searchInput = document.getElementById('partSearchInput');
    var clearSearchBtn = document.getElementById('btnClearSearch');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        currentSearchText = searchInput.value;
        if (clearSearchBtn) clearSearchBtn.style.display = currentSearchText ? '' : 'none';
        loadParts();
      });
    }
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', function () {
        if (searchInput) searchInput.value = '';
        currentSearchText = '';
        clearSearchBtn.style.display = 'none';
        loadParts();
      });
    }

    // ── Reset Filters ──
    var btnResetFilters = document.getElementById('btnResetFilters');
    if (btnResetFilters) {
      btnResetFilters.addEventListener('click', function () {
        currentStatusFilter = 'all';
        currentCategoryFilter = 'all';
        currentSearchText = '';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        // Reset active chips
        if (statusList) {
          statusList.querySelectorAll('.chip-filter').forEach(function (c) { c.classList.remove('active'); });
          var allChip = statusList.querySelector('[data-status-filter="all"]');
          if (allChip) allChip.classList.add('active');
        }
        if (catList) {
          catList.querySelectorAll('.chip-filter').forEach(function (c) { c.classList.remove('active'); });
          var allCatChip = catList.querySelector('[data-category-filter="all"]');
          if (allCatChip) allCatChip.classList.add('active');
        }
        loadParts();
      });
    }

    // ── Summary Box Click -> Filter Shortcuts ──
    var critBox = document.getElementById('summaryCriticalBox');
    if (critBox) {
      critBox.addEventListener('click', function () {
        setStatusFilterTo('danger');
      });
    }
    var warnBox = document.getElementById('summaryWarningBox');
    if (warnBox) {
      warnBox.addEventListener('click', function () {
        setStatusFilterTo('warning');
      });
    }
    var safeBox = document.getElementById('summarySafeBox');
    if (safeBox) {
      safeBox.addEventListener('click', function () {
        setStatusFilterTo('safe');
      });
    }

    // ── Add Part Modal ──
    var btnAddPart = document.getElementById('btnOpenAddPartModal');
    if (btnAddPart) {
      btnAddPart.addEventListener('click', function () {
        var form = document.getElementById('partForm');
        if (form) form.reset();
        var editId = document.getElementById('editPartId');
        if (editId) editId.value = '';
        var title = document.getElementById('partModalTitle');
        if (title) title.innerHTML = '<i data-lucide="plus-circle"></i> Tambah Sparepart Baru';
        openModal('partFormModal');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    }

    // ── Part Card Actions (delegation on partsGrid) ──
    var partsGrid = document.getElementById('partsGrid');
    if (partsGrid) {
      partsGrid.addEventListener('click', function (e) {
        var replaceBtn = e.target.closest('.btn-replace');
        if (replaceBtn) {
          handleReplacePart(replaceBtn.getAttribute('data-part-id'));
          return;
        }

        var editBtn = e.target.closest('.btn-edit-part');
        if (editBtn) {
          handleEditPart(editBtn.getAttribute('data-part-id'));
          return;
        }

        var deleteBtn = e.target.closest('.btn-delete-part');
        if (deleteBtn) {
          handleDeletePart(deleteBtn.getAttribute('data-part-id'));
          return;
        }
      });
    }

    // ── Part Form Submit ──
    var partForm = document.getElementById('partForm');
    if (partForm) {
      partForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        try {
          var editId = document.getElementById('editPartId').value;
          var part = {
            id: editId || generateId(),
            vehicle_id: activeVehicleId,
            name: document.getElementById('partName').value.trim(),
            category: document.getElementById('partCategory').value,
            interval_km: parseInt(document.getElementById('partIntervalKm').value) || 4000,
            last_replaced_km: parseInt(document.getElementById('partLastReplacedKm').value) || 0,
            icon: document.getElementById('partIcon').value || 'wrench',
            image_url: document.getElementById('partImageUrl').value || null,
            est_price: parseInt(document.getElementById('partEstPrice').value) || 0,
            description: document.getElementById('partDescription').value.trim()
          };

          await DataStore.savePart(part);
          closeModal('partFormModal');
          await refreshAllData();
          showToast(editId ? 'Data sparepart "' + part.name + '" berhasil diperbarui!' : 'Sparepart baru "' + part.name + '" berhasil ditambahkan!', 'success');
        } catch (err) {
          showToast('Gagal menyimpan part: ' + err.message, 'error');
        }
      });
    }

    // ── Service Log Form Submit ──
    var logForm = document.getElementById('serviceLogForm');
    if (logForm) {
      logForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        try {
          var partId = document.getElementById('logPartId').value;
          var logDate = document.getElementById('logDate').value;
          var logOdo = parseInt(document.getElementById('logOdometer').value) || 0;
          var logBrand = document.getElementById('logPartBrand').value.trim();
          var logShop = document.getElementById('logShopName').value.trim();
          var logPrice = parseInt(document.getElementById('logPartPrice').value) || 0;
          var logLabor = parseInt(document.getElementById('logLaborFee').value) || 0;
          var logNotes = document.getElementById('logNotes').value.trim();

          // Get part name
          var partName = '';
          var partCategory = '';
          if (partId) {
            var parts = await DataStore.getParts(activeVehicleId);
            var part = parts.find(function (p) { return p.id === partId; });
            if (part) {
              partName = part.name;
              partCategory = part.category;
              // Update part last_replaced_km
              part.last_replaced_km = logOdo;
              await DataStore.savePart(part);
            }
          } else {
            // Manual log - get part name from modal title
            var modalTitle = document.getElementById('modalServicePartName');
            partName = (modalTitle ? modalTitle.textContent : '') || 'Servis Manual';
          }

          var log = {
            id: generateId(),
            vehicle_id: activeVehicleId,
            part_id: partId || null,
            part_name: partName,
            part_category: partCategory,
            service_date: logDate,
            odometer: logOdo,
            part_brand: logBrand,
            shop_name: logShop,
            part_price: logPrice,
            labor_fee: logLabor,
            notes: logNotes
          };

          await DataStore.saveServiceLog(log);

          // Update vehicle odometer if log odometer is higher
          var vehicles = await DataStore.getVehicles();
          var vehicle = vehicles.find(function (v) { return v.id === activeVehicleId; });
          if (vehicle && logOdo > (vehicle.current_odometer || 0)) {
            vehicle.current_odometer = logOdo;
            await DataStore.saveVehicle(vehicle);
            updateOdometerDisplay(logOdo);
          }

          closeModal('serviceLogModal');
          await refreshAllData();
          showToast('Catatan servis untuk "' + partName + '" berhasil disimpan!', 'success');
        } catch (err) {
          showToast('Gagal menyimpan log servis: ' + err.message, 'error');
        }
      });
    }

    // ── History Delete (delegation) ──
    var historyContainer = document.getElementById('historyListContainer');
    if (historyContainer) {
      historyContainer.addEventListener('click', async function (e) {
        var deleteBtn = e.target.closest('.history-delete-btn');
        if (deleteBtn) {
          var logId = deleteBtn.getAttribute('data-log-id');
          if (logId) {
            var confirmed = await showConfirmDialog({
              title: 'Hapus Riwayat Servis',
              message: 'Apakah Anda yakin ingin menghapus catatan servis ini dari riwayat?',
              icon: 'trash-2',
              type: 'danger',
              confirmText: 'Ya, Hapus Catatan',
              confirmIcon: 'trash-2'
            });

            if (confirmed) {
              await DataStore.deleteServiceLog(logId);
              await refreshAllData();
              showToast('Catatan riwayat servis berhasil dihapus!', 'success');
            }
          }
        }
      });
    }

    // ── Manual Service Log Button ──
    var btnManualLog = document.getElementById('btnOpenManualLogModal');
    if (btnManualLog) {
      btnManualLog.addEventListener('click', async function () {
        var form = document.getElementById('serviceLogForm');
        if (form) form.reset();
        var partIdInput = document.getElementById('logPartId');
        if (partIdInput) partIdInput.value = '';
        var modalTitle = document.getElementById('modalServicePartName');
        if (modalTitle) modalTitle.textContent = 'Catat Servis Manual';
        var dateInput = document.getElementById('logDate');
        if (dateInput) dateInput.value = getTodayString();

        var vehicles = await DataStore.getVehicles();
        var vehicle = vehicles.find(function (v) { return v.id === activeVehicleId; });
        var odoInput = document.getElementById('logOdometer');
        if (odoInput && vehicle) odoInput.value = vehicle.current_odometer || 0;

        openModal('serviceLogModal');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      });
    }

    // ── Export/Import Modal ──
    var btnExIm = document.getElementById('btnExportImportModal');
    if (btnExIm) {
      btnExIm.addEventListener('click', function () {
        openModal('dataBackupModal');
      });
    }

    // ── Export JSON ──
    var btnExport = document.getElementById('btnExportJson');
    if (btnExport) {
      btnExport.addEventListener('click', function () {
        exportJson();
      });
    }

    // ── Trigger Import ──
    var btnTriggerImport = document.getElementById('btnTriggerImportJson');
    if (btnTriggerImport) {
      btnTriggerImport.addEventListener('click', function () {
        var fileInput = document.getElementById('importJsonFileInput');
        if (fileInput) fileInput.click();
      });
    }

    // ── Import File Change ──
    var importInput = document.getElementById('importJsonFileInput');
    if (importInput) {
      importInput.addEventListener('change', function () {
        if (importInput.files && importInput.files[0]) {
          importJson(importInput.files[0]);
          importInput.value = '';
        }
      });
    }

    // ── Load Demo Data ──
    var btnDemo = document.getElementById('btnLoadDemoData');
    if (btnDemo) {
      btnDemo.addEventListener('click', async function () {
        var confirmed = await showConfirmDialog({
          title: 'Muat Data Contoh',
          message: 'Muat data contoh motor matic? <strong>Data saat ini akan digantikan dengan data demo (Vario 160 & NMAX).</strong>',
          icon: 'refresh-cw',
          type: 'warning',
          confirmText: 'Ya, Muat Data Demo',
          confirmIcon: 'download'
        });
        if (!confirmed) return;
        try {
          await loadDemoData();
          activeVehicleId = null;
          await initAppData();
          closeModal('dataBackupModal');
          showToast('Data contoh berhasil dimuat!', 'success');
        } catch (err) {
          showToast('Gagal memuat data contoh: ' + err.message, 'error');
        }
      });
    }

    // ── Reset All Data ──
    var btnReset = document.getElementById('btnResetAllData');
    if (btnReset) {
      btnReset.addEventListener('click', async function () {
        var confirmed = await showConfirmDialog({
          title: 'Hapus SEMUA Data',
          message: 'Apakah Anda yakin ingin menghapus <strong>SEMUA data motor, sparepart, dan riwayat servis</strong>? Data yang dihapus tidak dapat dipulihkan kembali.',
          icon: 'alert-triangle',
          type: 'danger',
          confirmText: 'Ya, Hapus Semua Data',
          confirmIcon: 'trash-2'
        });
        if (!confirmed) return;
        try {
          await DataStore.clearAllData();
          activeVehicleId = null;
          await initAppData();
          closeModal('dataBackupModal');
          showToast('Semua data berhasil dihapus dan dibersihkan!', 'info');
        } catch (err) {
          showToast('Gagal menghapus data: ' + err.message, 'error');
        }
      });
    }

    // ── Print Report ──
    var btnPrint = document.getElementById('btnPrintReport');
    if (btnPrint) {
      btnPrint.addEventListener('click', function () {
        generatePrintReport();
      });
    }

    // ── Firebase/Supabase Settings ──
    var btnFirebase = document.getElementById('btnOpenFirebaseModal');
    if (btnFirebase) {
      btnFirebase.addEventListener('click', function (e) {
        var user = DataStore.getCurrentUser();
        var isAdmin = Boolean(user && user.username && user.username.toLowerCase() === 'admin');
        if (!isAdmin) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        prefillCloudSettingsForm();
        openModal('firebaseSettingsModal');
      });
    }
    var cloudPill = document.getElementById('cloudSyncStatusPill');
    if (cloudPill) {
      cloudPill.addEventListener('click', function (e) {
        var user = DataStore.getCurrentUser();
        var isAdmin = Boolean(user && user.username && user.username.toLowerCase() === 'admin');
        if (!isAdmin) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        prefillCloudSettingsForm();
        openModal('firebaseSettingsModal');
      });
    }

    var fbForm = document.getElementById('firebaseSettingsForm');
    if (fbForm) {
      fbForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        try {
          var urlEl = document.getElementById('supabaseUrl');
          var keyEl = document.getElementById('supabaseAnonKey');
          var url = urlEl ? urlEl.value.trim() : '';
          var anonKey = keyEl ? keyEl.value.trim() : '';

          if (!url || !anonKey) {
            showToast('URL dan Anon Key harus diisi', 'error');
            return;
          }

          var ok = await SupabaseManager.connect(url, anonKey);
          if (ok) {
            updateCloudPill(true);
            closeModal('firebaseSettingsModal');
            showToast('Berhasil terhubung ke Supabase Cloud!', 'success');
            // Sync local data to cloud
            var data = await DataStore.getAllData();
            await DataStore.importAllData(data);
          } else {
            showToast('Gagal terhubung ke Supabase. Periksa URL dan Anon Key.', 'error');
          }
        } catch (err) {
          showToast('Error koneksi: ' + err.message, 'error');
        }
      });
    }

    // ── Modal Close Buttons ──
    document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var modalId = btn.getAttribute('data-close-modal');
        closeModal(modalId);
      });
    });

    // ── Modal Backdrop Click ──
    document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) {
          backdrop.classList.remove('active');
        }
      });
    });

    // ── ESC Key ──
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllModals();
        var ddMenu = document.getElementById('vehicleDropdownMenu');
        if (ddMenu) ddMenu.classList.remove('active');
      }
    });
  }

  // ── Helper: Set Status Filter Programmatically ─────────────

  function setStatusFilterTo(status) {
    currentStatusFilter = status;
    var statusList = document.getElementById('statusFilterList');
    if (statusList) {
      statusList.querySelectorAll('.chip-filter').forEach(function (c) { c.classList.remove('active'); });
      var target = statusList.querySelector('[data-status-filter="' + status + '"]');
      if (target) target.classList.add('active');
    }
    // Switch to parts tab if not active
    var partsTab = document.querySelector('.tab-btn[data-tab="partsTrackerTab"]');
    if (partsTab && !partsTab.classList.contains('active')) {
      partsTab.click();
    }
    loadParts();
  }

  // ── Helper: Handle Part Actions ────────────────────────────

  async function handleReplacePart(partId) {
    if (!partId) return;
    var parts = await DataStore.getParts(activeVehicleId);
    var part = parts.find(function (p) { return p.id === partId; });
    if (!part) return;

    // Open service log modal pre-filled
    var form = document.getElementById('serviceLogForm');
    if (form) form.reset();

    var partIdInput = document.getElementById('logPartId');
    if (partIdInput) partIdInput.value = part.id;

    var modalTitle = document.getElementById('modalServicePartName');
    if (modalTitle) modalTitle.textContent = 'Ganti ' + part.name;

    var iconEl = document.getElementById('modalServicePartIcon');
    if (iconEl) {
      iconEl.innerHTML = '<img src="' + getPartImage(part) + '" alt="' + escHtml(part.name) + '" style="width:28px;height:28px;object-fit:contain;" />';
    }

    var dateInput = document.getElementById('logDate');
    if (dateInput) dateInput.value = getTodayString();

    var vehicles = await DataStore.getVehicles();
    var vehicle = vehicles.find(function (v) { return v.id === activeVehicleId; });
    var odoInput = document.getElementById('logOdometer');
    if (odoInput && vehicle) odoInput.value = vehicle.current_odometer || 0;

    var priceInput = document.getElementById('logPartPrice');
    if (priceInput && part.est_price) priceInput.value = part.est_price;

    openModal('serviceLogModal');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  async function handleEditPart(partId) {
    if (!partId) return;
    var parts = await DataStore.getParts(activeVehicleId);
    var part = parts.find(function (p) { return p.id === partId; });
    if (!part) return;

    var editIdEl = document.getElementById('editPartId');
    if (editIdEl) editIdEl.value = part.id;

    document.getElementById('partName').value = part.name || '';
    document.getElementById('partCategory').value = part.category || 'mesin';
    document.getElementById('partIntervalKm').value = part.interval_km || '';
    document.getElementById('partLastReplacedKm').value = part.last_replaced_km || 0;
    document.getElementById('partIcon').value = part.icon || 'wrench';
    document.getElementById('partImageUrl').value = part.image_url || '';
    document.getElementById('partEstPrice').value = part.est_price || '';
    document.getElementById('partDescription').value = part.description || '';

    var title = document.getElementById('partModalTitle');
    if (title) title.innerHTML = '<i data-lucide="edit-3"></i> Edit Sparepart';

    openModal('partFormModal');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  async function handleDeletePart(partId) {
    if (!partId) return;
    var parts = await DataStore.getParts(activeVehicleId);
    var part = parts.find(function (p) { return p.id === partId; });
    var partName = part ? part.name : 'Sparepart';

    var confirmed = await showConfirmDialog({
      title: 'Hapus Sparepart',
      message: 'Apakah Anda yakin ingin menghapus sparepart <strong>"' + escHtml(partName) + '"</strong> dari daftar pemantauan?',
      icon: 'trash-2',
      type: 'danger',
      confirmText: 'Ya, Hapus Part',
      confirmIcon: 'trash-2'
    });

    if (!confirmed) return;

    try {
      await DataStore.deletePart(partId);
      await refreshAllData();
      showToast('Sparepart "' + partName + '" berhasil dihapus!', 'success');
    } catch (err) {
      showToast('Gagal menghapus part: ' + err.message, 'error');
    }
  }

  // ── Helper: Handle Vehicle Edit ───────────────────────────

  async function handleEditVehicle(vehId) {
    if (!vehId) return;
    var vehicles = await DataStore.getVehicles();
    var veh = vehicles.find(function (v) { return v.id === vehId; });
    if (!veh) return;

    var editIdEl = document.getElementById('editVehicleId');
    if (editIdEl) editIdEl.value = veh.id;

    var nameEl = document.getElementById('vehName');
    if (nameEl) nameEl.value = veh.name || '';

    var yearEl = document.getElementById('vehYear');
    if (yearEl) yearEl.value = veh.year || 2024;

    var plateEl = document.getElementById('vehPlateInput');
    if (plateEl) plateEl.value = veh.plate || '';

    var odoEl = document.getElementById('vehCurrentOdoInput');
    if (odoEl) odoEl.value = veh.current_odometer || 0;

    var title = document.getElementById('vehicleModalTitle');
    if (title) title.innerHTML = '<i data-lucide="edit-3"></i> Edit Data Motor';

    // Sembunyikan pilihan preset saat mode edit
    var presetGroup = document.getElementById('vehPresetGroup');
    if (presetGroup) presetGroup.style.display = 'none';

    openModal('vehicleModal');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    var ddMenu = document.getElementById('vehicleDropdownMenu');
    if (ddMenu) ddMenu.classList.remove('active');
  }

  // ── Helper: Prefill Cloud Settings Form ────────────────────

  function prefillCloudSettingsForm() {
    if (!window.SupabaseManager) return;
    var config = SupabaseManager.getConfig();
    if (!config) return;

    var urlEl = document.getElementById('supabaseUrl');
    var keyEl = document.getElementById('supabaseAnonKey');
    if (urlEl && config.url) urlEl.value = config.url;
    if (keyEl && config.anonKey) keyEl.value = config.anonKey;
  }

  // ── Initialization ─────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', async function () {
    // Render static icons
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Setup all event listeners
    setupEventListeners();

    // Check auth
    if (isAuthenticated()) {
      showApp();

      // Auto-connect cloud in background
      tryAutoConnectCloud();

      // Load app data & check maintenance alerts
      await initAppData(true);
    } else {
      showLoginScreen();
    }
  });

})();
