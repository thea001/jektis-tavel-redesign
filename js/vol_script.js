/* ============================================================
   JEKTIS TRAVEL — Vol Page Script (vol_script.js)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ── Hero Carousel ──────────────────────────────────────────
  const slides = document.querySelectorAll(".vol-slide");
  const dots = document.querySelectorAll(".vol-dot");
  let cur = 0,
    timer = null;

  const titles = [
    "Réservez votre vol aux<br><em>meilleurs tarifs</em>",
    "Partez découvrir<br><em>le monde entier</em>",
    "Vols directs &amp; avec<br><em>escale à prix imbattable</em>",
    "Voyagez malin,<br><em>voyagez avec Jektis</em>",
  ];
  const subs = [
    "Des billets d'avion pour toutes les destinations, à portée de clic.",
    "Compagnies nationales et internationales — trouvez votre vol idéal.",
    "Recherchez, comparez et réservez en quelques minutes.",
    "Paiement sécurisé, billet électronique envoyé par e-mail immédiatement.",
  ];

  function goTo(n) {
    slides[cur].classList.remove("active");
    dots[cur].classList.remove("active");
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add("active");
    dots[cur].classList.add("active");
    const title = document.getElementById("vol-hero-title");
    const sub = document.getElementById("vol-hero-sub");
    if (title) title.innerHTML = titles[cur];
    if (sub) sub.textContent = subs[cur].replace(/&amp;/g, "&");
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(cur + 1), 5500);
  }

  dots.forEach((d) =>
    d.addEventListener("click", () => {
      goTo(+d.dataset.idx);
      startTimer();
    }),
  );
  document.getElementById("vol-prev")?.addEventListener("click", () => {
    goTo(cur - 1);
    startTimer();
  });
  document.getElementById("vol-next")?.addEventListener("click", () => {
    goTo(cur + 1);
    startTimer();
  });
  startTimer();

  // ── Search Tabs ────────────────────────────────────────────
  const retourField = document.getElementById("field-retour");
  document.querySelectorAll(".vol-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".vol-tab")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (retourField) {
        retourField.style.display = btn.dataset.tab === "one" ? "none" : "";
      }
    });
  });

  // ── Option Chips ──────────────────────────────────────────
  document.querySelectorAll(".vol-chip").forEach((c) => {
    c.addEventListener("click", () => c.classList.toggle("active"));
  });

  // ── Swap FROM ↔ TO ────────────────────────────────────────
  document.getElementById("vol-swap-btn")?.addEventListener("click", () => {
    const from = document.getElementById("vol-from");
    const to = document.getElementById("vol-to");
    if (!from || !to) return;
    [from.value, to.value] = [to.value, from.value];
  });

  // ── FAQ Accordion ─────────────────────────────────────────
  document.querySelectorAll(".vol-faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".vol-faq-item");
      const isOpen = item.classList.contains("open");
      document
        .querySelectorAll(".vol-faq-item.open")
        .forEach((el) => el.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });

  // ── Navbar scroll effect ───────────────────────────────────
  // On vol.html the navbar is always visible; just add scrolled class on scroll
  const navbar = document.getElementById("navbar");
  window.addEventListener(
    "scroll",
    () => {
      if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 40);
    },
    { passive: true },
  );

  // ── AOS ───────────────────────────────────────────────────
  if (typeof AOS !== "undefined")
    AOS.init({ duration: 750, once: true, offset: 60 });
});
