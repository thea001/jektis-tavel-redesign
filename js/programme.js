/* ============================================================
   JEKTIS TRAVEL — Programme Page JS
   Handles: photo carousel, day accordion, booking qty,
            tab switching, scroll animations, map path
   ============================================================ */

// ── PHOTO CAROUSEL ───────────────────────────
(function () {
  const track = document.querySelector(".carousel-track");
  const slides = document.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll(".cdot");
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");
  if (!track || !slides.length) return;

  let cur = 0;
  let autoTimer;

  function goTo(n) {
    slides[cur].classList.remove("active");
    dots[cur] && dots[cur].classList.remove("active");
    cur = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
    slides[cur].classList.add("active");
    dots[cur] && dots[cur].classList.add("active");
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(cur + 1), 4500);
  }

  prevBtn &&
    prevBtn.addEventListener("click", () => {
      goTo(cur - 1);
      startAuto();
    });
  nextBtn &&
    nextBtn.addEventListener("click", () => {
      goTo(cur + 1);
      startAuto();
    });
  dots.forEach((d) =>
    d.addEventListener("click", () => {
      goTo(+d.dataset.idx);
      startAuto();
    }),
  );

  // Touch / swipe
  let tx = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      tx = e.touches[0].clientX;
    },
    { passive: true },
  );
  track.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) {
      goTo(dx < 0 ? cur + 1 : cur - 1);
      startAuto();
    }
  });

  slides[0].classList.add("active");
  dots[0] && dots[0].classList.add("active");
  startAuto();
})();

// ── PAGE TABS (Programme / Services / Tarifs / Conditions) ──
(function () {
  const tabs = document.querySelectorAll(".prog-tab");
  const sections = document.querySelectorAll(".prog-tab-section");
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      sections.forEach((s) => s.classList.remove("active"));
      tab.classList.add("active");
      const target = document.getElementById("section-" + tab.dataset.tab);
      if (target) {
        target.classList.add("active");
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();

// ── DAY ACCORDION ────────────────────────────
(function () {
  document.querySelectorAll(".day-header").forEach((header) => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;
      const dot = header.closest(".day-card")?.querySelector(".day-dot");
      const isOpen = header.classList.contains("open");

      // Close all
      document.querySelectorAll(".day-header.open").forEach((h) => {
        h.classList.remove("open");
        h.nextElementSibling && h.nextElementSibling.classList.remove("open");
        h.closest(".day-card")
          ?.querySelector(".day-dot")
          ?.classList.remove("open");
      });

      // Open this one if it was closed
      if (!isOpen) {
        header.classList.add("open");
        content && content.classList.add("open");
        dot && dot.classList.add("open");
      }
    });
  });

  // Auto-open first day
  const first = document.querySelector(".day-header");
  first && first.click();
})();

// ── BOOKING QTY CONTROLS ─────────────────────
(function () {
  const rows = document.querySelectorAll(".room-row");
  let grandTotal = 0;

  rows.forEach((row) => {
    const minus = row.querySelector(".qty-btn.minus");
    const plus = row.querySelector(".qty-btn.plus");
    const valEl = row.querySelector(".qty-val");
    const price = parseInt(row.dataset.price || 0, 10);
    let qty = 0;

    function updateTotal() {
      grandTotal = 0;
      document.querySelectorAll(".room-row").forEach((r) => {
        const q = parseInt(r.querySelector(".qty-val")?.textContent || 0, 10);
        const p = parseInt(r.dataset.price || 0, 10);
        grandTotal += q * p;
      });
      const totalEl = document.getElementById("booking-total");
      if (totalEl)
        totalEl.textContent = grandTotal.toLocaleString("fr-TN") + " TND";
    }

    minus &&
      minus.addEventListener("click", () => {
        if (qty > 0) {
          qty--;
          valEl.textContent = qty;
          updateTotal();
        }
      });
    plus &&
      plus.addEventListener("click", () => {
        qty++;
        valEl.textContent = qty;
        updateTotal();
      });
  });
})();

// ── SERVICES TOGGLE (Inclus / Non Inclus) ────
(function () {
  const tabs = document.querySelectorAll(".srv-tab");
  const panels = document.querySelectorAll(".srv-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = document.getElementById("srv-" + tab.dataset.srv);
      if (panel) panel.classList.add("active");
    });
  });
})();

// ── SCROLL-REVEAL for day cards ──────────────
(function () {
  const cards = document.querySelectorAll(".day-card");
  if (!cards.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("visible"), i * 80);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  cards.forEach((c) => io.observe(c));
})();

// ── STICKY TAB highlight on scroll ──────────
(function () {
  const sections = document.querySelectorAll(".prog-tab-section");
  const tabs = document.querySelectorAll(".prog-tab");
  if (!sections.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace("section-", "");
          tabs.forEach((t) => {
            t.classList.toggle("active", t.dataset.tab === id);
          });
        }
      });
    },
    { rootMargin: "-30% 0px -60% 0px" },
  );

  sections.forEach((s) => io.observe(s));
})();

// ── MAP PATH ANIMATION ───────────────────────
(function () {
  const path = document.getElementById("route-path");
  if (!path) return;

  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;

  const io = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        path.style.transition =
          "stroke-dashoffset 3s cubic-bezier(0.4,0,0.2,1)";
        path.style.strokeDashoffset = 0;

        // Animate city dots after path draws
        setTimeout(() => {
          document.querySelectorAll(".map-dot").forEach((dot, i) => {
            setTimeout(() => dot.classList.add("visible"), i * 280);
          });
        }, 600);

        io.disconnect();
      }
    },
    { threshold: 0.2 },
  );

  const mapEl = document.getElementById("journey-map");
  if (mapEl) io.observe(mapEl);
})();

// ── AOS ──────────────────────────────────────
if (typeof AOS !== "undefined")
  AOS.init({ duration: 700, once: true, offset: 60 });
