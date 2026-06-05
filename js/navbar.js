/* ============================================================
   JEKTIS TRAVEL — Navbar JS
   Handles: scroll effect, hamburger, drawer, mob-dropdowns
   ============================================================ */
(function () {
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("nav-hamburger");
  const drawer = document.getElementById("nav-mobile-drawer");
  const backdrop = document.getElementById("nav-backdrop");
  if (!navbar) return;

  /* ── inject drawer head (logo + close) if not already there ── */
  if (drawer && !drawer.querySelector(".mob-drawer-head")) {
    const head = document.createElement("div");
    head.className = "mob-drawer-head";
    head.innerHTML = `
      <div class="mob-drawer-logo">
         <img
           width="120"
           src="../images/logo_jektis.png"
           alt="Jektis Travel"
         />
      </div>
      <button class="mob-close" id="mob-close-btn" aria-label="Fermer">
        <i class="fa-solid fa-xmark"></i>
      </button>`;
    drawer.insertBefore(head, drawer.firstChild);
  }

  /* ── SCROLL ── */
  function onScroll() {
    const scrolled = window.scrollY > 60;
    navbar.classList.toggle("scrolled", scrolled);
    navbar.classList.toggle("on-hero", !scrolled);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── OPEN / CLOSE DRAWER ── */
  function openDrawer() {
    drawer && drawer.classList.add("open");
    backdrop && backdrop.classList.add("visible");
    hamburger && hamburger.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer && drawer.classList.remove("open");
    backdrop && backdrop.classList.remove("visible");
    hamburger && hamburger.classList.remove("open");
    document.body.style.overflow = "";
  }

  hamburger &&
    hamburger.addEventListener("click", () => {
      drawer && drawer.classList.contains("open")
        ? closeDrawer()
        : openDrawer();
    });

  backdrop && backdrop.addEventListener("click", closeDrawer);

  /* close btn inside drawer */
  document.addEventListener("click", (e) => {
    if (e.target.closest("#mob-close-btn")) closeDrawer();
  });

  /* ── MOBILE DROPDOWNS ── */
  drawer &&
    drawer.querySelectorAll("[data-has-dropdown]").forEach((item) => {
      const link = item.querySelector(".mob-link");
      link &&
        link.addEventListener("click", (e) => {
          e.preventDefault();
          /* close others */
          drawer
            .querySelectorAll("[data-has-dropdown].expanded")
            .forEach((other) => {
              if (other !== item) other.classList.remove("expanded");
            });
          item.classList.toggle("expanded");
        });
    });

  /* ── CLOSE DRAWER ON INTERNAL LINK CLICK ── */
  drawer &&
    drawer
      .querySelectorAll("a:not([data-has-dropdown] > .mob-link)")
      .forEach((a) => {
        a.addEventListener("click", () => {
          /* small delay so navigation feels natural */
          setTimeout(closeDrawer, 120);
        });
      });

  /* ── CLOSE ON RESIZE IF DESKTOP ── */
  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) closeDrawer();
  });

  /* ── ACTIVE LINK HIGHLIGHT (current page) ── */
  const path = window.location.pathname.split("/").pop();
  navbar.querySelectorAll(".nav-link, .mob-link").forEach((link) => {
    const href = (link.getAttribute("href") || "").split("/").pop();
    if (href && href !== "#" && href === path) {
      link.classList.add("active");
      /* auto-expand parent mob-dropdown if inside one */
      const parent = link.closest("[data-has-dropdown]");
      if (parent) parent.classList.add("expanded");
    }
  });
})();
