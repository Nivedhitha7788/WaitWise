// ============================================================
//  WaitWise — Shared JS utility (api.js)
//  Cinematic Blue & Warm Amber Style (Besloor Reference)
// ============================================================

/* ---------- Auth helpers ---------- */
const Auth = {
  get token()   { return localStorage.getItem('ww_token'); },
  get user()    { try { return JSON.parse(localStorage.getItem('ww_user')); } catch { return null; } },
  get role()    { return this.user?.role || null; },
  get isAuth()  { return !!(this.token && this.user); },

  login(token, user) {
    localStorage.setItem('ww_token', token);
    localStorage.setItem('ww_user', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('ww_token');
    localStorage.removeItem('ww_user');
    window.location.href = '/';
  }
};

/* ---------- Fetch wrapper ---------- */
async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (Auth.token) opts.headers['Authorization'] = `Bearer ${Auth.token}`;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.message || 'Request failed' };
  return data;
}

/* ---------- Navbar (Besloor Style) ---------- */
function renderNavbar(containerId = 'navbar') {
  const el = document.getElementById(containerId);
  if (!el) return;

  const roleLabel = { admin: 'Admin', doctor: 'Doctor', patient: 'Patient' };
  const dashLink  = { admin: '/pages/admin.html', doctor: '/pages/doctor.html', patient: '/pages/patient.html' };

  if (Auth.isAuth) {
    el.innerHTML = `
      <nav class="navbar">
        <a class="nav-brand" href="${dashLink[Auth.role] || '/'}">
          <span class="nav-brand-title">WAITWISE</span>
          <span class="nav-brand-sub">HOSPITAL QUEUE MANAGEMENT</span>
        </a>
        <div class="nav-links">
          <a href="${dashLink[Auth.role] || '/'}" class="active">Dashboard</a>
          <a href="/pages/display.html">Live Waiting Board</a>
          <a href="/">Home</a>
        </div>
        <div class="nav-right">
          <span class="nav-role-tag">${roleLabel[Auth.role] || Auth.role}</span>
          <span class="nav-user">${Auth.user?.name || ''}</span>
          <button class="btn btn-outline btn-sm" id="logoutBtn">Logout</button>
        </div>
      </nav>`;
    document.getElementById('logoutBtn').onclick = () => Auth.logout();
  } else {
    el.innerHTML = `
      <nav class="navbar">
        <a class="nav-brand" href="/">
          <span class="nav-brand-title">WAITWISE</span>
          <span class="nav-brand-sub">HOSPITAL QUEUE MANAGEMENT</span>
        </a>
        <div class="nav-links">
          <a href="/" class="active">Home</a>
          <a href="/#specialists">OP Doctors</a>
          <a href="/pages/display.html">Live Board</a>
        </div>
        <div class="nav-right">
          <a class="btn btn-orange btn-sm" href="/pages/login.html">Register / Login</a>
        </div>
      </nav>`;
  }
}

/* ---------- Guard: redirect if not logged in / wrong role ---------- */
function guardPage(requiredRole) {
  if (!Auth.isAuth) {
    window.location.href = `/pages/login.html?role=${requiredRole}`;
    return false;
  }
  if (Auth.role !== requiredRole) {
    const map = { admin: '/pages/admin.html', doctor: '/pages/doctor.html', patient: '/pages/patient.html' };
    window.location.href = map[Auth.role] || '/';
    return false;
  }
  return true;
}

/* ---------- Small DOM helpers ---------- */
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}
function showAlert(container, type, msg) {
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}
function clearAlert(container) { if (container) container.innerHTML = ''; }

function statusBadge(status) {
  const map = {
    waiting: 'waiting',
    'in-consultation': 'in-consultation',
    completed: 'completed',
    cancelled: 'cancelled'
  };
  const labels = {
    waiting: '⏳ Waiting in Queue',
    'in-consultation': '🩺 In Consultation',
    completed: '✅ Completed',
    cancelled: '✕ Cancelled'
  };
  return `<span class="badge badge-${map[status] || ''}">${labels[status] || status}</span>`;
}

function fmtDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
