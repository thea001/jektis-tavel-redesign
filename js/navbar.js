/* ============================================================
   JEKTIS TRAVEL — Shared Navbar JS
   Handles: scroll effect, active link, mobile menu
   ============================================================ */
(function () {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  // ── Scroll effect ──────────────────────────
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
      navbar.classList.remove("on-hero");
    } else {
      navbar.classList.remove("scrolled");
      navbar.classList.add("on-hero");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ── Active nav link by current page ────────
  const path = window.location.pathname;
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (
      link.getAttribute("href") &&
      path.includes(link.getAttribute("href").replace("../", ""))
    ) {
      link.classList.add("active");
    }
  });
})();
