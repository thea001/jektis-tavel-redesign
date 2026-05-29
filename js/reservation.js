/* ============================================================
   JEKTIS TRAVEL — Reservation Page JS
   ============================================================ */

(function () {

  // ── CIVIL TITLE RADIOS ──────────────────────
  document.querySelectorAll('.civil-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const grp = opt.closest('.civil-group');
      grp.querySelectorAll('.civil-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // ── PAYMENT OPTIONS ──────────────────────────
  const payOpts = document.querySelectorAll('.pay-opt');
  const agencyWrap = document.getElementById('agency-wrap');

  payOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      payOpts.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      // Show agency selector only for agency payment options
      if (agencyWrap) {
        agencyWrap.classList.toggle('visible', opt.dataset.pay !== 'online');
      }
    });
  });

  // ── AGENCY TABS ──────────────────────────────
  document.querySelectorAll('.agency-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.agency-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // ── WISH CHIPS ───────────────────────────────
  document.querySelectorAll('.wish-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });

  // ── FORM VALIDATION & SUBMIT ─────────────────
  const form = document.getElementById('res-form');
  const submitBtn = document.getElementById('res-submit-btn');

  function validateField(input) {
    const val = input.value.trim();
    const isRequired = input.hasAttribute('required');
    const valid = !isRequired || val.length > 0;
    input.style.borderColor = valid ? '' : '#e53e3e';
    return valid;
  }

  form && form.querySelectorAll('input[required], select[required]').forEach(inp => {
    inp.addEventListener('blur', () => validateField(inp));
    inp.addEventListener('input', () => {
      if (inp.style.borderColor === 'rgb(229, 62, 62)') validateField(inp);
    });
  });

  submitBtn && submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('input[required], select[required]').forEach(inp => {
      if (!validateField(inp)) valid = false;
    });
    const terms = document.getElementById('terms-check');
    if (terms && !terms.checked) {
      terms.closest('.terms-row').style.outline = '2px solid #e53e3e';
      terms.closest('.terms-row').style.borderRadius = '12px';
      valid = false;
    } else if (terms) {
      terms.closest('.terms-row').style.outline = '';
    }
    if (!valid) {
      form.querySelector('[style*="border-color: rgb(229"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    // Success state
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Réservation confirmée !';
    submitBtn.style.background = 'linear-gradient(135deg,#16a34a,#22c55e)';
    setTimeout(() => {
      window.location.href = '#confirmation';
    }, 800);
  });

  // ── GUEST CIVIL SELECTS (inline in guest blocks) ─
  document.querySelectorAll('.guest-civil-group').forEach(grp => {
    grp.querySelectorAll('.civil-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        grp.querySelectorAll('.civil-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const sel = grp.querySelector('.civil-hidden');
        if (sel) sel.value = opt.dataset.val;
      });
    });
  });

  // ── STICKY SUMMARY ───────────────────────────
  const summary = document.querySelector('.res-summary-card');
  if (summary) {
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('navbar');
      const navH = navbar ? navbar.offsetHeight : 70;
      summary.style.top = (navH + 10) + 'px';
    }, { passive: true });
  }

  // ── AOS ──────────────────────────────────────
  if (typeof AOS !== 'undefined') AOS.init({ duration: 650, once: true, offset: 50 });

})();
