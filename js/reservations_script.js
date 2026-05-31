/* ============================================================
   JEKTIS TRAVEL — Reservations Script
   Handles: countdown timers, filter tabs, QR code generation
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ══════════════════════════════════════════════════════
  // COUNTDOWN TIMERS — live ticking for each ticket
  // ══════════════════════════════════════════════════════
  function pad(n) { return String(Math.floor(n)).padStart(2, '0'); }

  function updateTimers() {
    const now = Date.now();
    document.querySelectorAll('.ticket-timer').forEach(timer => {
      const depart = new Date(timer.dataset.depart).getTime();
      const diff   = depart - now;

      if (diff <= 0) {
        // Departed
        timer.querySelectorAll('.t-val').forEach(v => v.textContent = '00');
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const d = Math.floor(totalSec / 86400);
      const h = Math.floor((totalSec % 86400) / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      const vals = { d, h, m, s };
      timer.querySelectorAll('.t-val').forEach(el => {
        const unit = el.dataset.unit;
        el.textContent = pad(vals[unit]);
      });

      // Urgency colour: red when < 24h
      const blocks = timer.querySelectorAll('.timer-block');
      if (diff < 86400000) { // < 24h
        blocks.forEach(b => {
          b.style.background = 'rgba(239,83,80,0.12)';
          b.style.borderColor = 'rgba(239,83,80,0.3)';
          b.querySelector('.t-val').style.color = '#ef9a9a';
        });
      } else if (diff < 259200000) { // < 3 days
        blocks.forEach(b => {
          b.style.background = 'rgba(255,167,38,0.12)';
          b.style.borderColor = 'rgba(255,167,38,0.3)';
          b.querySelector('.t-val').style.color = '#ffcc80';
        });
      }
    });
  }

  updateTimers();
  setInterval(updateTimers, 1000);

  // ══════════════════════════════════════════════════════
  // FILTER TABS
  // ══════════════════════════════════════════════════════
  const filters = document.querySelectorAll('.res-filter');
  const tickets = document.querySelectorAll('.ticket');
  const empty   = document.getElementById('res-empty');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const f = btn.dataset.filter;
      let visible = 0;

      tickets.forEach(t => {
        const show = f === 'all' || t.classList.contains(f);
        if (show) {
          t.classList.remove('filtered');
          visible++;
          // Re-trigger entrance animation
          t.style.animation = 'none';
          t.offsetHeight;
          t.style.animation = '';
        } else {
          t.classList.add('filtered');
        }
      });

      empty.style.display = visible === 0 ? 'block' : 'none';
    });
  });

  // ══════════════════════════════════════════════════════
  // QR CODE GENERATOR — lightweight procedural canvas QR
  // Generates a visual that looks like a QR code using the
  // data string as a seed. Not scannable — decorative only.
  // ══════════════════════════════════════════════════════
  function drawQR(canvas, data) {
    const size   = 72;
    const cells  = 21;      // 21×21 grid (QR v1 size)
    const cell   = size / cells;

    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0b1829';
    ctx.fillRect(0, 0, size, size);

    // Seed from data string
    let seed = 0;
    for (let i = 0; i < data.length; i++) seed = (seed * 31 + data.charCodeAt(i)) >>> 0;
    function rand() {
      seed ^= seed << 13;
      seed ^= seed >> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 4294967296;
    }

    // Build module grid
    const grid = Array.from({length: cells}, () => Array(cells).fill(0));

    // Seed random data modules
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        grid[r][c] = rand() > 0.5 ? 1 : 0;
      }
    }

    // Finder patterns (top-left, top-right, bottom-left)
    function finder(row, col) {
      const pat = [
        [1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1],
      ];
      pat.forEach((row_, ri) => {
        row_.forEach((v, ci) => { grid[row + ri][col + ci] = v; });
      });
    }
    finder(0, 0);
    finder(0, cells - 7);
    finder(cells - 7, 0);

    // Timing patterns
    for (let i = 8; i < cells - 8; i++) {
      grid[6][i] = i % 2 === 0 ? 1 : 0;
      grid[i][6] = i % 2 === 0 ? 1 : 0;
    }

    // Draw modules
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        if (grid[r][c]) {
          ctx.fillStyle = '#c9a84c';
          // Slightly rounded modules
          const x = c * cell + 0.5;
          const y = r * cell + 0.5;
          const w = cell - 1;
          const h = cell - 1;
          const rad = w * 0.18;
          ctx.beginPath();
          ctx.moveTo(x + rad, y);
          ctx.lineTo(x + w - rad, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
          ctx.lineTo(x + w, y + h - rad);
          ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
          ctx.lineTo(x + rad, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
          ctx.lineTo(x, y + rad);
          ctx.quadraticCurveTo(x, y, x + rad, y);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Border frame
    ctx.strokeStyle = 'rgba(201,168,76,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
  }

  document.querySelectorAll('.qr-canvas').forEach(canvas => {
    drawQR(canvas, canvas.dataset.code || 'JKT');
  });

  // ══════════════════════════════════════════════════════
  // BUTTON INTERACTIONS — demo feedback
  // ══════════════════════════════════════════════════════
  document.querySelectorAll('.t-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      // Ripple effect
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute; border-radius:50%;
        background:rgba(255,255,255,0.18);
        transform:scale(0); animation:ripple 0.5s ease;
        pointer-events:none;
        width:60px; height:60px;
        left:${e.offsetX - 30}px; top:${e.offsetY - 30}px;
      `;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });

  // Inject ripple animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to { transform: scale(3); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

});
