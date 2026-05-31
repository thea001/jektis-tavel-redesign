/* ============================================================
   JEKTIS TRAVEL — Mes Réservations JS
   Handles: countdown timers, filter tabs, search, sort
   ============================================================ */
(function () {

  // ── COUNTDOWN TIMERS ─────────────────────────
  function pad(n) { return String(n).padStart(2, '0'); }

  function updateTimers() {
    document.querySelectorAll('[data-departure]').forEach(el => {
      const dep = new Date(el.dataset.departure).getTime();
      const now = Date.now();
      const diff = dep - now;

      if (diff <= 0) {
        el.innerHTML = '<span class="timer-past"><i class="fa-solid fa-check-circle" style="color:#22c55e"></i> Voyage effectué</span>';
        return;
      }

      const days  = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000)  / 60000);
      const secs  = Math.floor((diff % 60000)    / 1000);

      const urgent = days < 3;
      const cls    = urgent ? 'timer-num urgent' : 'timer-num';

      el.innerHTML = `
        <div class="timer-unit"><span class="${cls}">${pad(days)}</span><span class="timer-lbl">Jours</span></div>
        <span class="timer-sep">:</span>
        <div class="timer-unit"><span class="${cls}">${pad(hours)}</span><span class="timer-lbl">Heures</span></div>
        <span class="timer-sep">:</span>
        <div class="timer-unit"><span class="${cls}">${pad(mins)}</span><span class="timer-lbl">Min</span></div>
        <span class="timer-sep">:</span>
        <div class="timer-unit"><span class="${cls}">${pad(secs)}</span><span class="timer-lbl">Sec</span></div>
      `;
    });
  }

  updateTimers();
  setInterval(updateTimers, 1000);

  // ── FILTER TABS ──────────────────────────────
  const ftabs   = document.querySelectorAll('.ftab');
  const tickets = document.querySelectorAll('.ticket');

  ftabs.forEach(tab => {
    tab.addEventListener('click', () => {
      ftabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterTickets();
    });
  });

  // ── SEARCH ───────────────────────────────────
  const searchInput = document.getElementById('res-search');
  searchInput && searchInput.addEventListener('input', filterTickets);

  // ── SORT ─────────────────────────────────────
  const sortSel = document.getElementById('res-sort');
  sortSel && sortSel.addEventListener('change', () => {
    const grid  = document.querySelector('.tickets-grid');
    const items = [...grid.querySelectorAll('.ticket')];
    const val   = sortSel.value;

    items.sort((a, b) => {
      if (val === 'date-asc')  return new Date(a.dataset.departure || 0) - new Date(b.dataset.departure || 0);
      if (val === 'date-desc') return new Date(b.dataset.departure || 0) - new Date(a.dataset.departure || 0);
      if (val === 'price-asc') return parseFloat(a.dataset.price || 0) - parseFloat(b.dataset.price || 0);
      if (val === 'price-desc')return parseFloat(b.dataset.price || 0) - parseFloat(a.dataset.price || 0);
      return 0;
    });
    items.forEach(el => grid.appendChild(el));
  });

  function filterTickets() {
    const activeTab = document.querySelector('.ftab.active');
    const status    = activeTab ? activeTab.dataset.filter : 'all';
    const query     = searchInput ? searchInput.value.toLowerCase() : '';

    let visible = 0;
    tickets.forEach(t => {
      const matchStatus = status === 'all' || t.dataset.status === status;
      const text        = t.textContent.toLowerCase();
      const matchQuery  = !query || text.includes(query);
      const show        = matchStatus && matchQuery;
      t.style.display   = show ? '' : 'none';
      if (show) visible++;
    });

    const empty = document.getElementById('empty-state');
    if (empty) empty.style.display = visible === 0 ? 'flex' : 'none';
  }

  // ── TICKET EXPAND / MODAL ────────────────────
  document.querySelectorAll('.ticket-btn[data-action="details"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const ticket = btn.closest('.ticket');
      ticket.classList.toggle('expanded');
    });
  });

  // ── CANCEL CONFIRM ───────────────────────────
  document.querySelectorAll('.ticket-btn.danger').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
        const ticket = btn.closest('.ticket');
        ticket.style.opacity = '0.4';
        ticket.style.pointerEvents = 'none';
        const badge = ticket.querySelector('.ticket-status-badge');
        if (badge) { badge.className = 'ticket-status-badge badge-cancelled'; badge.innerHTML = '<i class="fa-solid fa-xmark"></i> Annulée'; }
      }
    });
  });

  // ── PROGRESS BARS ANIMATE ────────────────────
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target.querySelector('.progress-fill');
        if (fill) fill.style.width = fill.dataset.pct + '%';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.trip-progress').forEach(el => {
    const fill = el.querySelector('.progress-fill');
    if (fill) { const pct = fill.dataset.pct; fill.style.width = '0%'; }
    io.observe(el);
  });

  // ── AOS ──────────────────────────────────────
  if (typeof AOS !== 'undefined') AOS.init({ duration: 650, once: true, offset: 40 });

})();
