'use strict';

// ===================== STATE =====================
const S = {
  token: localStorage.getItem('cp_token'),
  user: null,
  view: 'map',
  photos: [],
  friends: [],
  paths: [],
  stats: { friends: 0, photos: 0, geotagged: 0 },
  searchResults: [],
  searchQuery: '',
  pathFilter: { distance: 200, hours: 1 },
  mapInstance: null,
  mapLayers: { crossings: null, myPhotos: null, friendPhotos: null },
  showMyPhotos: false,
  pendingCount: 0,
};

// ===================== API =====================
async function api(method, path, body, isForm) {
  const opts = {
    method,
    headers: { ...(S.token ? { Authorization: `Bearer ${S.token}` } : {}) },
  };
  if (body && !isForm) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (isForm) {
    opts.body = body; // FormData
  }
  const r = await fetch('/api' + path, opts);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

function get(path) { return api('GET', path); }
function post(path, body) { return api('POST', path, body); }
function put(path, body) { return api('PUT', path, body); }
function del(path) { return api('DELETE', path); }

// ===================== TOAST =====================
let toastTimer;
function toast(msg, type = 'info') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3000);
}

// ===================== AUTH =====================
async function doLogin(email, password, errEl) {
  try {
    const { token, user } = await post('/auth/login', { email, password });
    S.token = token;
    S.user = user;
    localStorage.setItem('cp_token', token);
    await loadAll();
    renderApp();
  } catch (e) {
    errEl.textContent = e.message;
  }
}

async function doRegister(username, email, password, errEl) {
  try {
    const { token, user } = await post('/auth/register', { username, email, password });
    S.token = token;
    S.user = user;
    localStorage.setItem('cp_token', token);
    await loadAll();
    renderApp();
  } catch (e) {
    errEl.textContent = e.message;
  }
}

function doLogout() {
  S.token = null;
  S.user = null;
  localStorage.removeItem('cp_token');
  S.photos = []; S.friends = []; S.paths = [];
  if (S.mapInstance) { S.mapInstance.remove(); S.mapInstance = null; }
  renderAuth();
}

// ===================== DATA LOADING =====================
async function loadAll() {
  try {
    const [photos, friends, paths, stats] = await Promise.all([
      get('/photos'),
      get('/friends'),
      get('/paths/crossed'),
      get('/paths/stats'),
    ]);
    S.photos = photos;
    S.friends = friends;
    S.paths = paths;
    S.stats = stats;
    S.pendingCount = friends.filter(f => f.status === 'pending' && f.requester_id !== S.user.id).length;
  } catch (e) {
    console.error('Load error:', e);
  }
}

async function refreshPaths() {
  try {
    const { distance, hours } = S.pathFilter;
    S.paths = await get(`/paths/crossed?distance_m=${distance}&time_hours=${hours}`);
  } catch (e) {
    toast('Could not refresh paths', 'error');
  }
}

// ===================== RENDER ROOT =====================
function renderAuth() {
  document.getElementById('root').innerHTML = authHTML();
  bindAuth();
}

function renderApp() {
  document.getElementById('root').innerHTML = appShellHTML();
  bindNav();
  renderView();
}

// ===================== AUTH HTML =====================
function authHTML() {
  return `
    <div class="auth-wrap">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="auth-logo-icon">🗺️</div>
          <div>
            <div class="auth-logo-text">CrossPaths</div>
            <div class="auth-logo-sub">Find where your world overlapped</div>
          </div>
        </div>
        <div class="auth-tabs">
          <button class="auth-tab active" id="tabLogin" onclick="switchAuthTab('login')">Sign In</button>
          <button class="auth-tab" id="tabRegister" onclick="switchAuthTab('register')">Create Account</button>
        </div>
        <div id="authForm">${loginFormHTML()}</div>
      </div>
    </div>`;
}

function loginFormHTML() {
  return `
    <h2 class="auth-title">Welcome back</h2>
    <p class="auth-sub">Sign in to see where your paths have crossed.</p>
    <div class="field"><label>Email</label><input id="loginEmail" type="email" placeholder="you@example.com" autocomplete="email" /></div>
    <div class="field"><label>Password</label><input id="loginPassword" type="password" placeholder="••••••••" autocomplete="current-password" /></div>
    <p class="error-msg" id="loginErr"></p>
    <button class="btn btn-primary" id="loginBtn" onclick="submitLogin()">Sign In</button>`;
}

function registerFormHTML() {
  return `
    <h2 class="auth-title">Join CrossPaths</h2>
    <p class="auth-sub">Upload your camera roll and discover shared moments.</p>
    <div class="field"><label>Username</label><input id="regUsername" type="text" placeholder="yourname" autocomplete="username" /></div>
    <div class="field"><label>Email</label><input id="regEmail" type="email" placeholder="you@example.com" autocomplete="email" /></div>
    <div class="field"><label>Password</label><input id="regPassword" type="password" placeholder="min. 6 characters" autocomplete="new-password" /></div>
    <p class="error-msg" id="regErr"></p>
    <button class="btn btn-primary" id="regBtn" onclick="submitRegister()">Create Account</button>`;
}

function switchAuthTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('authForm').innerHTML = tab === 'login' ? loginFormHTML() : registerFormHTML();
}

function bindAuth() {
  // Allow Enter to submit
  document.addEventListener('keydown', function authKey(e) {
    if (e.key !== 'Enter') return;
    const loginBtn = document.getElementById('loginBtn');
    const regBtn = document.getElementById('regBtn');
    if (loginBtn) loginBtn.click();
    else if (regBtn) regBtn.click();
    document.removeEventListener('keydown', authKey);
  }, { once: false });
}

function submitLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const err = document.getElementById('loginErr');
  const btn = document.getElementById('loginBtn');
  if (!email || !password) { err.textContent = 'Fill in all fields'; return; }
  btn.disabled = true; btn.textContent = 'Signing in…';
  doLogin(email, password, err).finally(() => {
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
  });
}

function submitRegister() {
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const err = document.getElementById('regErr');
  const btn = document.getElementById('regBtn');
  if (!username || !email || !password) { err.textContent = 'Fill in all fields'; return; }
  btn.disabled = true; btn.textContent = 'Creating account…';
  doRegister(username, email, password, err).finally(() => {
    if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
  });
}

// ===================== APP SHELL =====================
function avatarHTML(color, username, size = 34) {
  return `<div class="avatar" style="background:${color};width:${size}px;height:${size}px;font-size:${Math.round(size*0.38)}px">${username[0].toUpperCase()}</div>`;
}

function appShellHTML() {
  const badge = S.pendingCount > 0 ? `<span class="nav-badge">${S.pendingCount}</span>` : '';
  const crossCount = S.paths.length;
  return `
    <div class="app-shell">
      <nav class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <div class="sidebar-logo-icon">🗺️</div>
            <div>
              <div class="sidebar-logo-text">CrossPaths</div>
              <div class="sidebar-logo-sub">shared moments in time</div>
            </div>
          </div>
        </div>
        <div class="sidebar-nav">
          <button class="nav-item ${S.view==='map'?'active':''}" onclick="navigate('map')">
            <span class="nav-icon">🌍</span>Map
            ${crossCount > 0 ? `<span class="nav-badge" style="background:var(--success)">${crossCount}</span>` : ''}
          </button>
          <button class="nav-item ${S.view==='photos'?'active':''}" onclick="navigate('photos')">
            <span class="nav-icon">📷</span>Photos
          </button>
          <button class="nav-item ${S.view==='friends'?'active':''}" onclick="navigate('friends')">
            <span class="nav-icon">👥</span>Friends${badge}
          </button>
          <button class="nav-item ${S.view==='timeline'?'active':''}" onclick="navigate('timeline')">
            <span class="nav-icon">🔗</span>Timeline
          </button>
        </div>
        <div class="sidebar-footer">
          <div class="user-card">
            ${avatarHTML(S.user.avatar_color, S.user.username)}
            <div class="user-info">
              <div class="user-name">${esc(S.user.username)}</div>
              <div class="user-email">${esc(S.user.email)}</div>
            </div>
            <button class="logout-btn" onclick="doLogout()" title="Sign out">⎋</button>
          </div>
        </div>
      </nav>
      <main class="main-content">
        <div id="viewContainer" class="content-body"></div>
      </main>
    </div>`;
}

function navigate(view) {
  S.view = view;
  // Re-render sidebar active states
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.textContent.includes(viewLabel(view)));
  });
  renderView();
}

function viewLabel(v) { return { map: 'Map', photos: 'Photos', friends: 'Friends', timeline: 'Timeline' }[v] || ''; }

function renderView() {
  const c = document.getElementById('viewContainer');
  if (!c) return;
  if (S.view === 'map') renderMapView(c);
  else if (S.view === 'photos') renderPhotosView(c);
  else if (S.view === 'friends') renderFriendsView(c);
  else if (S.view === 'timeline') renderTimelineView(c);
}

function bindNav() {}

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmt(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function fmtDate(isoDate) {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

// ===================== MAP VIEW =====================
function renderMapView(container) {
  const hasCrossings = S.paths.length > 0;
  const hasGeo = S.photos.some(p => p.latitude);

  container.innerHTML = `
    <div id="map"></div>
    ${!hasCrossings ? `
      <div class="empty-map">
        <div class="empty-map-icon">${hasGeo ? '👥' : '📍'}</div>
        <h3>${hasGeo ? 'No crossings yet' : 'No geotagged photos'}</h3>
        <p>${hasGeo
          ? 'Add friends and compare photo locations to discover where you crossed paths.'
          : 'Upload photos with location data enabled to start finding crossed paths.'}</p>
      </div>` : ''}
    ${hasCrossings ? `
      <div class="map-sidebar">
        <div class="map-sidebar-header">
          <span>🔗 ${S.paths.length} crossing${S.paths.length !== 1 ? 's' : ''} found</span>
        </div>
        <div class="map-sidebar-list" id="crossingList">
          ${S.paths.map((p, i) => `
            <div class="crossing-item" onclick="focusCrossing(${i})">
              <div class="crossing-who">
                ${avatarHTML(p.friend.avatar_color, p.friend.username, 22)}
                <span>${esc(p.friend.username)}</span>
                <span class="crossing-badge">✓ Crossed</span>
              </div>
              <div class="crossing-meta">${fmtDate(p.date)} · ${p.distance_m}m apart · ${p.time_diff_minutes}min gap</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="map-controls">
        <button class="map-control-btn ${S.showMyPhotos ? 'active' : ''}" onclick="toggleMyPhotos()">My Photos</button>
      </div>` : ''}`;

  initMap();
}

function initMap() {
  if (S.mapInstance) { S.mapInstance.remove(); S.mapInstance = null; }
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  // Center on crossings, or photos, or world
  let center = [20, 0], zoom = 2;
  if (S.paths.length > 0) {
    center = [S.paths[0].latitude, S.paths[0].longitude];
    zoom = 13;
  } else if (S.photos.some(p => p.latitude)) {
    const gp = S.photos.find(p => p.latitude);
    center = [gp.latitude, gp.longitude];
    zoom = 10;
  }

  const map = L.map('map', { zoomControl: false }).setView(center, zoom);
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(map);

  S.mapInstance = map;

  // Add crossing markers
  const crossingGroup = L.layerGroup().addTo(map);
  S.paths.forEach((p, i) => {
    const icon = L.divIcon({ className: '', html: '<div class="crossing-marker"></div>', iconSize: [24, 24], iconAnchor: [12, 12] });
    L.marker([p.latitude, p.longitude], { icon })
      .bindPopup(`
        <div class="popup-title">🔗 Crossed with ${esc(p.friend.username)}</div>
        <div class="popup-meta">
          ${fmt(p.date)}<br>
          ~${p.distance_m}m apart · ${p.time_diff_minutes} min gap
        </div>`)
      .on('click', () => highlightListItem(i))
      .addTo(crossingGroup);
  });
  S.mapLayers.crossings = crossingGroup;

  // Add my photo markers (hidden by default)
  const myPhotoGroup = L.layerGroup();
  S.photos.filter(p => p.latitude).forEach(p => {
    const icon = L.divIcon({ className: '', html: '<div class="photo-marker"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
    L.marker([p.latitude, p.longitude], { icon })
      .bindPopup(`<div class="popup-meta">📷 ${esc(p.original_name)}<br>${fmt(p.taken_at)}</div>`)
      .addTo(myPhotoGroup);
  });
  S.mapLayers.myPhotos = myPhotoGroup;
  if (S.showMyPhotos) myPhotoGroup.addTo(map);

  // Fit bounds to all content
  if (S.paths.length > 0) {
    const pts = S.paths.map(p => [p.latitude, p.longitude]);
    if (pts.length > 1) map.fitBounds(L.latLngBounds(pts).pad(0.3));
  }
}

function focusCrossing(i) {
  const p = S.paths[i];
  if (!p || !S.mapInstance) return;
  S.mapInstance.flyTo([p.latitude, p.longitude], 15, { duration: 1.2 });
  highlightListItem(i);
}

function highlightListItem(i) {
  document.querySelectorAll('.crossing-item').forEach((el, idx) => {
    el.style.background = idx === i ? 'var(--surface2)' : '';
  });
}

function toggleMyPhotos() {
  S.showMyPhotos = !S.showMyPhotos;
  if (!S.mapInstance) return;
  if (S.showMyPhotos) S.mapLayers.myPhotos?.addTo(S.mapInstance);
  else S.mapLayers.myPhotos?.remove();
  document.querySelector('.map-control-btn')?.classList.toggle('active', S.showMyPhotos);
}

// ===================== PHOTOS VIEW =====================
function renderPhotosView(container) {
  const geoCount = S.photos.filter(p => p.latitude).length;
  container.innerHTML = `
    <div class="photos-view">
      <div class="photos-toolbar">
        <div class="photos-stats">${S.photos.length} photo${S.photos.length !== 1 ? 's' : ''} · ${geoCount} geotagged</div>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('fileInput').click()">+ Upload Photos</button>
        <input type="file" id="fileInput" accept="image/*,.heic,.heif" multiple />
      </div>
      <div id="uploadResult"></div>
      <div id="uploadProgress" style="display:none" class="upload-progress">
        <span id="uploadMsg">Uploading…</span>
        <div class="progress-bar-wrap"><div class="progress-bar" id="progBar" style="width:0%"></div></div>
      </div>
      <div id="uploadZoneArea">
        ${S.photos.length === 0 ? uploadZoneHTML() : ''}
      </div>
      <div class="photos-grid" id="photosGrid">
        ${S.photos.map(photoCardHTML).join('')}
      </div>
    </div>`;

  bindPhotos();
}

function uploadZoneHTML() {
  return `
    <div class="upload-zone" id="uploadZone">
      <div class="upload-zone-icon">📂</div>
      <h3>Drop your camera roll here</h3>
      <p>Drag & drop photos or click to browse.<br>JPEG, PNG, HEIC supported. EXIF location data extracted automatically.</p>
    </div>`;
}

function photoCardHTML(p) {
  return `
    <div class="photo-card" title="${esc(p.original_name)}">
      <img src="/uploads/${p.filename}" alt="${esc(p.original_name)}" loading="lazy" />
      ${p.latitude ? '<div class="photo-geo-badge">📍</div>' : ''}
      <button class="photo-del-btn" onclick="deletePhoto('${p.id}', event)" title="Delete">✕</button>
      <div class="photo-card-overlay">${fmtDate(p.taken_at || p.created_at)}</div>
    </div>`;
}

function bindPhotos() {
  const input = document.getElementById('fileInput');
  const zone = document.getElementById('uploadZone');
  if (input) input.addEventListener('change', e => handleFileUpload(e.target.files));
  if (zone) {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('drag-over'); handleFileUpload(e.dataTransfer.files); });
    zone.addEventListener('click', () => document.getElementById('fileInput').click());
  }
  // Also bind drag on whole view when photos exist
  const grid = document.getElementById('photosGrid');
  if (grid) {
    grid.addEventListener('dragover', e => e.preventDefault());
    grid.addEventListener('drop', e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); });
  }
}

async function handleFileUpload(files) {
  if (!files || files.length === 0) return;
  const prog = document.getElementById('uploadProgress');
  const bar = document.getElementById('progBar');
  const msg = document.getElementById('uploadMsg');
  const resultEl = document.getElementById('uploadResult');

  prog.style.display = 'block';
  bar.style.width = '10%';
  msg.textContent = `Uploading ${files.length} photo${files.length !== 1 ? 's' : ''}…`;
  resultEl.innerHTML = '';

  const formData = new FormData();
  for (const f of files) formData.append('photos', f);

  try {
    bar.style.width = '40%';
    const result = await api('POST', '/photos/upload', formData, true);
    bar.style.width = '100%';

    S.photos = await get('/photos');
    S.stats = await get('/paths/stats');

    resultEl.innerHTML = `
      <div class="upload-result success">
        ✓ Uploaded ${result.uploaded} photo${result.uploaded !== 1 ? 's' : ''}
        — ${result.with_location} with GPS location
      </div>`;

    // Refresh paths if geotagged photos were uploaded
    if (result.with_location > 0) {
      await refreshPaths();
    }

    // Re-render the photos grid
    document.getElementById('photosGrid').innerHTML = S.photos.map(photoCardHTML).join('');
    document.getElementById('uploadZoneArea').innerHTML = '';
  } catch (e) {
    resultEl.innerHTML = `<div class="upload-result error">✕ Upload failed: ${esc(e.message)}</div>`;
  } finally {
    prog.style.display = 'none';
    bar.style.width = '0%';
    const input = document.getElementById('fileInput');
    if (input) input.value = '';
    bindPhotos();
  }
}

async function deletePhoto(id, e) {
  e.stopPropagation();
  if (!confirm('Delete this photo?')) return;
  try {
    await del(`/photos/${id}`);
    S.photos = S.photos.filter(p => p.id !== id);
    S.stats.photos = S.photos.length;
    S.stats.geotagged = S.photos.filter(p => p.latitude).length;
    await refreshPaths();
    const grid = document.getElementById('photosGrid');
    if (grid) grid.innerHTML = S.photos.map(photoCardHTML).join('');
    toast('Photo deleted', 'success');
  } catch (err) {
    toast('Delete failed', 'error');
  }
}

// ===================== FRIENDS VIEW =====================
function renderFriendsView(container) {
  const pending = S.friends.filter(f => f.status === 'pending' && f.requester_id !== S.user.id);
  const accepted = S.friends.filter(f => f.status === 'accepted');
  const outgoing = S.friends.filter(f => f.status === 'pending' && f.requester_id === S.user.id);

  container.innerHTML = `
    <div class="friends-view">
      <div class="search-box">
        <input id="userSearch" type="text" placeholder="Search by username…" value="${esc(S.searchQuery)}" />
        <button class="btn btn-ghost" onclick="searchUsers()">Search</button>
      </div>

      ${S.searchResults.length > 0 ? `
        <div class="search-results">
          <div class="section-label">Search Results</div>
          ${S.searchResults.map(u => `
            <div class="user-row">
              ${avatarHTML(u.avatar_color, u.username, 38)}
              <div class="user-row-info">
                <div class="user-row-name">${esc(u.username)}</div>
              </div>
              <button class="btn btn-success btn-sm" onclick="sendRequest('${u.id}')">+ Add</button>
            </div>`).join('')}
        </div>` : ''}

      ${pending.length > 0 ? `
        <div class="search-results">
          <div class="section-label">Pending Requests (${pending.length})</div>
          ${pending.map(f => `
            <div class="user-row">
              ${avatarHTML(f.avatar_color, f.username, 38)}
              <div class="user-row-info">
                <div class="user-row-name">${esc(f.username)}</div>
                <div class="user-row-meta">Wants to compare paths with you</div>
              </div>
              <button class="btn btn-success btn-sm" onclick="acceptRequest('${f.friendship_id}')">Accept</button>
              <button class="btn btn-danger btn-sm" onclick="removeFriend('${f.friendship_id}')">✕</button>
            </div>`).join('')}
        </div>` : ''}

      <div class="friends-list">
        <div class="section-label">
          Friends (${accepted.length})
          ${accepted.length > 0 ? '— upload photos to find where you crossed paths' : ''}
        </div>
        ${accepted.length === 0 ? `<p class="no-results">No friends yet. Search for people by username to get started.</p>` : ''}
        ${accepted.map(f => `
          <div class="user-row">
            ${avatarHTML(f.avatar_color, f.username, 38)}
            <div class="user-row-info">
              <div class="user-row-name">${esc(f.username)}</div>
              <div class="user-row-meta">Friend since ${fmtDate(f.friendship_created_at)}</div>
            </div>
            <span class="status-badge status-accepted">Connected</span>
            <button class="btn btn-ghost btn-sm" onclick="removeFriend('${f.friendship_id}')">Remove</button>
          </div>`).join('')}
      </div>

      ${outgoing.length > 0 ? `
        <div class="friends-list">
          <div class="section-label">Sent Requests</div>
          ${outgoing.map(f => `
            <div class="user-row">
              ${avatarHTML(f.avatar_color, f.username, 38)}
              <div class="user-row-info">
                <div class="user-row-name">${esc(f.username)}</div>
              </div>
              <span class="status-badge status-pending">Pending</span>
              <button class="btn btn-ghost btn-sm" onclick="removeFriend('${f.friendship_id}')">Cancel</button>
            </div>`).join('')}
        </div>` : ''}
    </div>`;

  bindFriends();
}

function bindFriends() {
  const input = document.getElementById('userSearch');
  if (input) {
    input.addEventListener('keydown', e => { if (e.key === 'Enter') searchUsers(); });
    input.focus();
  }
}

async function searchUsers() {
  const q = document.getElementById('userSearch')?.value.trim() || '';
  S.searchQuery = q;
  if (q.length < 2) { S.searchResults = []; renderFriendsView(document.getElementById('viewContainer')); return; }
  try {
    S.searchResults = await get(`/users/search?q=${encodeURIComponent(q)}`);
    renderFriendsView(document.getElementById('viewContainer'));
  } catch (e) {
    toast('Search failed', 'error');
  }
}

async function sendRequest(userId) {
  try {
    await post('/friends/request', { userId });
    toast('Friend request sent!', 'success');
    S.searchResults = S.searchResults.filter(u => u.id !== userId);
    S.friends = await get('/friends');
    renderFriendsView(document.getElementById('viewContainer'));
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function acceptRequest(friendshipId) {
  try {
    await put(`/friends/${friendshipId}/accept`);
    S.friends = await get('/friends');
    S.pendingCount = S.friends.filter(f => f.status === 'pending' && f.requester_id !== S.user.id).length;
    await refreshPaths();
    toast('Friend added!', 'success');
    renderFriendsView(document.getElementById('viewContainer'));
    // Update nav badge
    const badge = document.querySelector('.nav-item:nth-child(3) .nav-badge');
    if (badge) { if (S.pendingCount > 0) badge.textContent = S.pendingCount; else badge.remove(); }
  } catch (e) {
    toast(e.message, 'error');
  }
}

async function removeFriend(friendshipId) {
  try {
    await del(`/friends/${friendshipId}`);
    S.friends = await get('/friends');
    S.pendingCount = S.friends.filter(f => f.status === 'pending' && f.requester_id !== S.user.id).length;
    await refreshPaths();
    toast('Removed', 'success');
    renderFriendsView(document.getElementById('viewContainer'));
  } catch (e) {
    toast(e.message, 'error');
  }
}

// ===================== TIMELINE VIEW =====================
function renderTimelineView(container) {
  container.innerHTML = `
    <div class="timeline-view">
      <div class="timeline-filters">
        <div class="filter-group">
          <span class="filter-label">Distance threshold</span>
          <select class="filter-select" id="distFilter" onchange="applyFilter()">
            <option value="100" ${S.pathFilter.distance===100?'selected':''}>100 m</option>
            <option value="200" ${S.pathFilter.distance===200?'selected':''}>200 m</option>
            <option value="500" ${S.pathFilter.distance===500?'selected':''}>500 m</option>
            <option value="1000" ${S.pathFilter.distance===1000?'selected':''}>1 km</option>
            <option value="2000" ${S.pathFilter.distance===2000?'selected':''}>2 km</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">Time window</span>
          <select class="filter-select" id="timeFilter" onchange="applyFilter()">
            <option value="0.5" ${S.pathFilter.hours===0.5?'selected':''}>30 min</option>
            <option value="1" ${S.pathFilter.hours===1?'selected':''}>1 hour</option>
            <option value="2" ${S.pathFilter.hours===2?'selected':''}>2 hours</option>
            <option value="6" ${S.pathFilter.hours===6?'selected':''}>6 hours</option>
            <option value="24" ${S.pathFilter.hours===24?'selected':''}>Same day</option>
          </select>
        </div>
      </div>
      ${S.paths.length === 0 ? noCrossingsHTML() : `
        <div class="timeline-list">
          ${S.paths.map(crossingCardHTML).join('')}
        </div>`}
    </div>`;
}

function noCrossingsHTML() {
  const hasGeo = S.photos.some(p => p.latitude);
  const hasFriends = S.friends.some(f => f.status === 'accepted');
  let hint = 'Upload photos with location data and add friends to discover where your worlds overlapped.';
  if (hasGeo && !hasFriends) hint = 'You have geotagged photos! Add friends to compare locations and find crossings.';
  else if (!hasGeo && hasFriends) hint = 'You have friends connected. Upload photos from your camera roll — ones with GPS data will reveal shared moments.';
  else if (hasGeo && hasFriends) hint = `No crossings found within ${S.pathFilter.distance}m / ${S.pathFilter.hours}h. Try widening the thresholds above.`;
  return `
    <div class="no-crossings">
      <div class="no-crossings-icon">🌐</div>
      <h3>No crossings found</h3>
      <p>${hint}</p>
    </div>`;
}

function crossingCardHTML(p) {
  return `
    <div class="timeline-card">
      <div class="timeline-card-header">
        <div class="tc-crossing-icon">🔗</div>
        <div class="tc-info">
          <div class="tc-title">You & ${esc(p.friend.username)} crossed paths</div>
          <div class="tc-date">${fmt(p.date)}</div>
          <div class="tc-badges">
            <span class="tc-badge tc-badge-dist">📍 ${p.distance_m}m apart</span>
            <span class="tc-badge tc-badge-time">⏱ ${p.time_diff_minutes} min gap</span>
          </div>
        </div>
        ${avatarHTML(p.friend.avatar_color, p.friend.username, 38)}
      </div>
      <div class="timeline-card-photos">
        <div class="tc-photo">
          <img src="/uploads/${p.my_photo.filename}" alt="Your photo" loading="lazy" />
          <div class="tc-photo-label">You · ${fmt(p.my_photo.taken_at)}</div>
        </div>
        <div class="tc-photo">
          <img src="/uploads/${p.friend_photo.filename}" alt="${esc(p.friend.username)}'s photo" loading="lazy" />
          <div class="tc-photo-label">${esc(p.friend.username)} · ${fmt(p.friend_photo.taken_at)}</div>
        </div>
      </div>
    </div>`;
}

async function applyFilter() {
  S.pathFilter.distance = parseInt(document.getElementById('distFilter').value);
  S.pathFilter.hours = parseFloat(document.getElementById('timeFilter').value);
  await refreshPaths();
  renderTimelineView(document.getElementById('viewContainer'));
}

// ===================== INIT =====================
async function init() {
  if (!S.token) { renderAuth(); return; }

  try {
    S.user = await get('/auth/me');
  } catch {
    S.token = null;
    localStorage.removeItem('cp_token');
    renderAuth();
    return;
  }

  await loadAll();
  renderApp();
}

init();
