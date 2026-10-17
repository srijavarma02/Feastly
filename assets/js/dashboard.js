'use strict';

/* ── Config ── */
const BACKEND_BASE = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
)
  ? 'http://localhost:5000'
  : 'https://kateringking-backend.onrender.com';

/* ── Auth guard ── */
const token = localStorage.getItem('kk_token');
const role  = localStorage.getItem('kk_role');
const email = localStorage.getItem('kk_email');

if (!token || role !== 'manager') {
  window.location.replace('login.html');
}

// Verify token is still valid
fetch(`${BACKEND_BASE}/api/auth/me`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => {
  if (!r.ok) {
    localStorage.clear();
    window.location.replace('login.html');
  }
}).catch(() => {
  // Offline — allow dashboard to function with cached token
});

/* ── Show user email ── */
const emailEl = document.getElementById('db-user-email');
if (emailEl && email) emailEl.textContent = email;

/* ── Logout ── */
document.getElementById('db-logout').addEventListener('click', () => {
  localStorage.clear();
  window.location.replace('login.html');
});

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR NAVIGATION
═══════════════════════════════════════════════════════════════ */
const navItems = document.querySelectorAll('.db-nav-item[data-panel]');
const panels   = document.querySelectorAll('.db-panel');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const target = item.dataset.panel;

    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    panels.forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById(`panel-${target}`);
    if (targetPanel) targetPanel.classList.add('active');

    // Lazy-load analytics charts the first time that panel is opened
    if (target === 'analytics' && !chartsRendered) renderCharts();
    if (target === 'content' && !contentLoaded) loadContentEditor();
  });
});

/* ═══════════════════════════════════════════════════════════════
   BOOKINGS — fetch, render, filter, status update, delete
═══════════════════════════════════════════════════════════════ */
let allBookings = [];

async function fetchBookings() {
  const tbody = document.getElementById('bookings-tbody');
  try {
    const res  = await fetch(`${BACKEND_BASE}/api/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load');
    allBookings = json.data || [];
    renderBookingsTable(allBookings);
  } catch (err) {
    tbody.innerHTML = `<tr class="db-loading-row"><td colspan="8">Error: ${err.message}</td></tr>`;
  }
}

function renderBookingsTable(bookings) {
  const tbody = document.getElementById('bookings-tbody');
  if (!bookings.length) {
    tbody.innerHTML = '<tr class="db-loading-row"><td colspan="8">No bookings found.</td></tr>';
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    const date = b.eventDate ? new Date(b.eventDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    }) : '—';

    return `
      <tr data-id="${b._id}">
        <td>
          <strong>${escHtml(b.name)}</strong>
        </td>
        <td>
          <div>${escHtml(b.phone)}</div>
          <div style="font-size:0.72rem;color:var(--text-dim)">${escHtml(b.email)}</div>
        </td>
        <td>${escHtml(b.eventType)}</td>
        <td style="white-space:nowrap">${date}</td>
        <td>${b.guestCount ?? '—'}</td>
        <td>${escHtml(b.venue)}</td>
        <td>
          <select class="status-select" data-id="${b._id}" aria-label="Update status">
            ${['Pending','Reviewed','Confirmed','Cancelled'].map(s =>
              `<option value="${s}"${b.status === s ? ' selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </td>
        <td>
          <button class="db-action-btn db-action-btn--delete" data-id="${b._id}" title="Delete booking">Delete</button>
        </td>
      </tr>
    `;
  }).join('');

  // Status change listeners
  tbody.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', () => updateStatus(sel.dataset.id, sel.value, sel));
  });

  // Delete listeners
  tbody.querySelectorAll('.db-action-btn--delete').forEach(btn => {
    btn.addEventListener('click', () => deleteBooking(btn.dataset.id));
  });
}

async function updateStatus(id, status, selectEl) {
  selectEl.disabled = true;
  try {
    const res  = await fetch(`${BACKEND_BASE}/api/bookings/${id}/status`, {
      method:  'PATCH',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    // Update local cache
    const b = allBookings.find(x => x._id === id);
    if (b) b.status = status;
  } catch (err) {
    alert(`Failed to update status: ${err.message}`);
  } finally {
    selectEl.disabled = false;
  }
}

async function deleteBooking(id) {
  if (!confirm('Delete this booking? This cannot be undone.')) return;
  try {
    const res  = await fetch(`${BACKEND_BASE}/api/bookings/${id}`, {
      method:  'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    allBookings = allBookings.filter(b => b._id !== id);
    renderBookingsTable(applyFilter());
  } catch (err) {
    alert(`Failed to delete booking: ${err.message}`);
  }
}

// Filter
document.getElementById('bookings-filter').addEventListener('change', function() {
  renderBookingsTable(applyFilter());
});

function applyFilter() {
  const val = document.getElementById('bookings-filter').value;
  return val ? allBookings.filter(b => b.status === val) : allBookings;
}

// Init bookings on load
fetchBookings();


/* ═══════════════════════════════════════════════════════════════
   ANALYTICS — Chart.js charts (lazy, rendered once)
═══════════════════════════════════════════════════════════════ */
let chartsRendered = false;

function renderCharts() {
  chartsRendered = true;
  if (!allBookings.length) return;

  // ── Stat cards ──
  document.getElementById('stat-total').textContent     = allBookings.length;
  document.getElementById('stat-pending').textContent   = allBookings.filter(b => b.status === 'Pending').length;
  document.getElementById('stat-confirmed').textContent = allBookings.filter(b => b.status === 'Confirmed').length;

  // Most popular event type
  const typeCounts = {};
  allBookings.forEach(b => { typeCounts[b.eventType] = (typeCounts[b.eventType] || 0) + 1; });
  const topType = Object.entries(typeCounts).sort((a,b) => b[1]-a[1])[0];
  document.getElementById('stat-popular').textContent = topType ? topType[0] : '—';

  // ── Doughnut: by event type ──
  const typeLabels = Object.keys(typeCounts);
  const typeData   = typeLabels.map(k => typeCounts[k]);

  new Chart(document.getElementById('chart-event-type'), {
    type: 'doughnut',
    data: {
      labels: typeLabels,
      datasets: [{
        data: typeData,
        backgroundColor: ['#C9A84C','#E2C47A','#9A7A2E','#B8C0CC','#1E2F45'],
        borderColor: '#152233',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#F0EBE0', font: { size: 11 }, padding: 12 } }
      }
    }
  });

  // ── Bar: bookings per month (last 6) ──
  const now     = new Date();
  const months  = [];
  const counts  = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));
    counts.push(
      allBookings.filter(b => {
        const bd = new Date(b.createdAt);
        return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
      }).length
    );
  }

  new Chart(document.getElementById('chart-monthly'), {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Bookings',
        data: counts,
        backgroundColor: 'rgba(201,168,76,0.6)',
        borderColor: '#C9A84C',
        borderWidth: 1,
        borderRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: '#B8C0CC', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: {
          beginAtZero: true,
          ticks: { color: '#B8C0CC', font: { size: 11 }, stepSize: 1 },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}


/* ═══════════════════════════════════════════════════════════════
   CONTENT EDITOR
═══════════════════════════════════════════════════════════════ */
let contentLoaded = false;

async function loadContentEditor() {
  const wrap = document.getElementById('content-form-wrap');
  try {
    const res  = await fetch(`${BACKEND_BASE}/api/content`);
    const json = await res.json();
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error || 'Unable to load saved content.');
    }
    const data = json.data;
    renderContentEditor(data, wrap);
    contentLoaded = true;
  } catch (err) {
    contentLoaded = false;
    wrap.replaceChildren();

    const message = document.createElement('p');
    message.className = 'db-loading-msg';
    message.textContent = `Unable to load saved content: ${err.message}`;

    const retryButton = document.createElement('button');
    retryButton.className = 'db-content-save-btn';
    retryButton.textContent = 'Retry';
    retryButton.addEventListener('click', loadContentEditor);

    wrap.append(message, retryButton);
  }
}

function renderContentEditor(data, wrap) {
  wrap.innerHTML = '';

  // ── Text fields ──
  const textFields = [
    { key: 'heroTagline', label: 'Hero Tagline' },
    { key: 'heroDesc',    label: 'Hero Description' },
    { key: 'aboutBody1',  label: 'About Section — Paragraph 1' },
    { key: 'aboutBody2',  label: 'About Section — Paragraph 2' }
  ];

  textFields.forEach(({ key, label }) => {
    const field = makeTextField(key, label, data[key] || '');
    wrap.appendChild(field);
  });

  // ── Testimonials array ──
  wrap.appendChild(makeArrayField(
    'testimonials',
    'Testimonials',
    data.testimonials || [],
    () => ({ name: '', event: '', quote: '', rating: 5 }),
    renderTestimonialItem
  ));

  // ── Pricing array ──
  wrap.appendChild(makeArrayField(
    'pricing',
    'Pricing Packages',
    data.pricing || [],
    () => ({ tier: '', tagline: '', price: '', per: 'per person', features: [], featured: false }),
    renderPricingItem
  ));
}

function makeTextField(key, label, value) {
  const div = document.createElement('div');
  div.className = 'db-content-field';

  const isLong = key.includes('Body') || key.includes('Desc');
  div.innerHTML = `
    <label class="db-content-field-label">${label}</label>
    ${isLong
      ? `<textarea class="db-content-textarea" id="cf-${key}">${escHtml(value)}</textarea>`
      : `<input type="text" class="db-content-input" id="cf-${key}" value="${escHtml(value)}" />`
    }
    <button class="db-content-save-btn" data-key="${key}">Save</button>
    <p class="db-save-feedback" id="fb-${key}"></p>
  `;

  div.querySelector('.db-content-save-btn').addEventListener('click', async function() {
    const el  = div.querySelector(`#cf-${key}`);
    await saveContent(key, el.value, 'text', this, `fb-${key}`);
  });

  return div;
}

function makeArrayField(key, label, items, newItemFn, renderItemFn) {
  const div = document.createElement('div');
  div.className = 'db-content-field';
  div.innerHTML = `<label class="db-content-field-label">${label}</label>`;

  const list = document.createElement('div');
  list.className  = 'db-array-list';
  list.id         = `arr-${key}`;
  div.appendChild(list);

  // Collect data from DOM into array
  function getData() {
    return Array.from(list.children).map(item => {
      const obj = {};
      item.querySelectorAll('[data-field]').forEach(el => {
        const f = el.dataset.field;
        if (el.type === 'checkbox') obj[f] = el.checked;
        else if (f === 'features') {
          obj[f] = el.value.split('\n').map(s => s.trim()).filter(Boolean);
        } else {
          obj[f] = el.value;
        }
      });
      return obj;
    });
  }

  function rebuildList(data) {
    list.innerHTML = '';
    data.forEach((item, i) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'db-array-item';
      itemEl.innerHTML = renderItemFn(item, i) + `<button class="db-array-item-remove" title="Remove" aria-label="Remove item">&times;</button>`;
      itemEl.querySelector('.db-array-item-remove').addEventListener('click', () => {
        itemEl.remove();
      });
      list.appendChild(itemEl);
    });
  }

  rebuildList(items);

  // Add item
  const addBtn = document.createElement('button');
  addBtn.className   = 'db-array-add-btn';
  addBtn.textContent = `+ Add ${label.replace(' Packages','').replace('s','')}`;
  addBtn.addEventListener('click', () => {
    const itemEl = document.createElement('div');
    itemEl.className = 'db-array-item';
    itemEl.innerHTML = renderItemFn(newItemFn(), list.children.length) + `<button class="db-array-item-remove" title="Remove" aria-label="Remove item">&times;</button>`;
    itemEl.querySelector('.db-array-item-remove').addEventListener('click', () => itemEl.remove());
    list.appendChild(itemEl);
  });
  div.appendChild(addBtn);

  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.className       = 'db-content-save-btn';
  saveBtn.style.marginTop = '1rem';
  saveBtn.textContent     = 'Save All';
  div.appendChild(saveBtn);

  const fb = document.createElement('p');
  fb.className = 'db-save-feedback';
  fb.id        = `fb-${key}`;
  div.appendChild(fb);

  saveBtn.addEventListener('click', async function() {
    await saveContent(key, getData(), 'array', this, `fb-${key}`);
  });

  return div;
}

function renderTestimonialItem(t) {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.5rem">
      <div>
        <label style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:0.2rem">Name</label>
        <input type="text" class="db-content-input" data-field="name" value="${escHtml(t.name||'')}" placeholder="Customer Name" />
      </div>
      <div>
        <label style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:0.2rem">Event</label>
        <input type="text" class="db-content-input" data-field="event" value="${escHtml(t.event||'')}" placeholder="Wedding · Hyderabad" />
      </div>
    </div>
    <label style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:0.2rem">Quote</label>
    <textarea class="db-content-textarea" data-field="quote" style="min-height:60px;margin-bottom:0.5rem">${escHtml(t.quote||'')}</textarea>
    <label style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:0.2rem">Rating (1-5)</label>
    <input type="number" class="db-content-input" data-field="rating" value="${t.rating||5}" min="1" max="5" style="width:80px" />
  `;
}

function renderPricingItem(p) {
  const featuresStr = Array.isArray(p.features) ? p.features.join('\n') : (p.features||'');
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.5rem">
      <div>
        <label style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:0.2rem">Tier Name</label>
        <input type="text" class="db-content-input" data-field="tier" value="${escHtml(p.tier||'')}" placeholder="Signature" />
      </div>
      <div>
        <label style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:0.2rem">Price</label>
        <input type="text" class="db-content-input" data-field="price" value="${escHtml(p.price||'')}" placeholder="₹1,400" />
      </div>
    </div>
    <label style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:0.2rem">Tagline</label>
    <input type="text" class="db-content-input" data-field="tagline" value="${escHtml(p.tagline||'')}" placeholder="Our flagship experience" style="margin-bottom:0.5rem" />
    <label style="font-size:0.65rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;display:block;margin-bottom:0.2rem">Features (one per line)</label>
    <textarea class="db-content-textarea" data-field="features" style="min-height:80px;margin-bottom:0.5rem">${escHtml(featuresStr)}</textarea>
    <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.75rem;color:var(--text-dim);cursor:pointer">
      <input type="checkbox" data-field="featured" ${p.featured ? 'checked' : ''} />
      Mark as featured (Most Popular)
    </label>
  `;
}

async function saveContent(key, value, type, btn, fbId) {
  btn.disabled    = true;
  btn.textContent = 'Saving…';
  const fb = document.getElementById(fbId);
  if (fb) { fb.textContent = ''; fb.className = 'db-save-feedback'; }

  try {
    const res  = await fetch(`${BACKEND_BASE}/api/content/${key}`, {
      method:  'PUT',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ value, type })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      const errorMessage = json.error ||
        (Array.isArray(json.errors) ? json.errors.join(', ') : 'Save failed');
      throw new Error(errorMessage);
    }
    if (fb) { fb.textContent = '✓ Saved'; fb.className = 'db-save-feedback ok'; }
    setTimeout(() => { if (fb) fb.textContent = ''; }, 2500);
  } catch (err) {
    if (fb) { fb.textContent = `✗ ${err.message}`; fb.className = 'db-save-feedback err'; }
  } finally {
    btn.disabled    = false;
    btn.textContent = key.startsWith('arr') ? 'Save All' : 'Save';
  }
}

/* ── Utility ── */
function escHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
