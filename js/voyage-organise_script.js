/* ============================================================
   JEKTIS TRAVEL — Voyage Organisé Script
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  AOS.init({ duration: 700, once: true, offset: 60 });

  // ── Price range dual slider ────────────────────────────────
  const rMin = document.getElementById("range-min");
  const rMax = document.getElementById("range-max");
  const rFill = document.getElementById("range-fill");
  const lblMin = document.getElementById("price-min-label");
  const lblMax = document.getElementById("price-max-label");

  function updateRange() {
    let lo = +rMin.value,
      hi = +rMax.value;
    if (lo > hi - 50) {
      lo = hi - 50;
      rMin.value = lo;
    }
    const pctLo = (lo / 5000) * 100;
    const pctHi = (hi / 5000) * 100;
    rFill.style.left = pctLo + "%";
    rFill.style.width = pctHi - pctLo + "%";
    lblMin.textContent = lo.toLocaleString("fr");
    lblMax.textContent = hi.toLocaleString("fr");
  }
  rMin?.addEventListener("input", updateRange);
  rMax?.addEventListener("input", updateRange);
  updateRange();

  // ── Filter group collapse ─────────────────────────────────
  document.querySelectorAll(".vo-filter-title").forEach((title) => {
    title.addEventListener("click", () => {
      const id = title.dataset.collapse;
      const body = document.getElementById("filter-" + id);
      if (!body) return;
      const collapsed = body.classList.toggle("collapsed");
      title.classList.toggle("collapsed", collapsed);
    });
  });

  // ── Star filter buttons ───────────────────────────────────
  document.querySelectorAll(".vo-star-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".vo-star-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // ── View toggle: grid ↔ list ──────────────────────────────
  const grid = document.getElementById("vo-grid");
  const btnGrid = document.getElementById("btn-grid");
  const btnList = document.getElementById("btn-list");
  btnGrid?.addEventListener("click", () => {
    grid.classList.remove("list-view");
    btnGrid.classList.add("active");
    btnList.classList.remove("active");
  });
  btnList?.addEventListener("click", () => {
    grid.classList.add("list-view");
    btnList.classList.add("active");
    btnGrid.classList.remove("active");
  });

  // ── Sort ─────────────────────────────────────────────────
  document.getElementById("vo-sort")?.addEventListener("change", (e) => {
    const cards = [...document.querySelectorAll(".vo-card")];
    const val = e.target.value;
    cards.sort((a, b) => {
      const pa = +a.dataset.price,
        pb = +b.dataset.price;
      const ra = +a.dataset.rating,
        rb = +b.dataset.rating;
      const da = +a.dataset.dur,
        db = +b.dataset.dur;
      if (val === "price-asc") return pa - pb;
      if (val === "price-desc") return pb - pa;
      if (val === "rating") return rb - ra;
      if (val === "duration") return da - db;
      return 0; // popularity = default order
    });
    cards.forEach((c) => grid.appendChild(c));
  });

  // ── Wishlist toggle ───────────────────────────────────────
  document.querySelectorAll(".vo-wishlist").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.classList.toggle("active");
      const icon = btn.querySelector("i");
      icon.className = btn.classList.contains("active")
        ? "fa-solid fa-heart"
        : "fa-regular fa-heart";
      icon.style.color = btn.classList.contains("active") ? "#e84393" : "";
    });
  });

  // ── Pagination ────────────────────────────────────────────
  let currentPage = 1;
  const totalPages = 6;

  document.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPage = +btn.dataset.page;
      updatePagination();
    });
  });
  document.getElementById("pg-prev")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      updatePagination();
    }
  });
  document.getElementById("pg-next")?.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      updatePagination();
    }
  });

  function updatePagination() {
    document.querySelectorAll("[data-page]").forEach((btn) => {
      btn.classList.toggle("active", +btn.dataset.page === currentPage);
    });
    const prev = document.getElementById("pg-prev");
    const next = document.getElementById("pg-next");
    if (prev) prev.disabled = currentPage === 1;
    if (next) next.disabled = currentPage === totalPages;
    window.scrollTo({
      top: document.querySelector(".vo-toolbar").offsetTop - 100,
      behavior: "smooth",
    });
  }

  // ── Mobile filter sidebar drawer ─────────────────────────
  const sidebar = document.getElementById("vo-sidebar");
  const filterBtn = document.getElementById("vo-filter-toggle");

  // Create backdrop
  const backdrop = document.createElement("div");
  backdrop.className = "vo-sidebar-backdrop";
  document.body.appendChild(backdrop);

  function openSidebar() {
    sidebar?.classList.add("drawer-open");
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeSidebar() {
    sidebar?.classList.remove("drawer-open");
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
  }

  filterBtn?.addEventListener("click", openSidebar);
  backdrop.addEventListener("click", closeSidebar);

  // Apply closes drawer on mobile
  document.getElementById("vo-apply")?.addEventListener("click", () => {
    if (window.innerWidth <= 960) closeSidebar();
  });

  // Reset
  document.getElementById("vo-reset")?.addEventListener("click", () => {
    document
      .querySelectorAll(".vo-filter-body input[type=checkbox]")
      .forEach((cb) => (cb.checked = false));
    if (rMin) rMin.value = 0;
    if (rMax) rMax.value = 5000;
    updateRange();
    document
      .querySelectorAll(".vo-star-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelector('.vo-star-btn[data-min="0"]')
      ?.classList.add("active");
    const fi = document.getElementById("date-from");
    const ti = document.getElementById("date-to");
    if (fi) fi.value = "";
    if (ti) ti.value = "";
  });

  // ── Reservation Wizard ─────────────────────────────────────
  const overlay = document.getElementById("resv-overlay");
  const step1 = document.getElementById("resv-step-1");
  const step2 = document.getElementById("resv-step-2");
  const step3 = document.getElementById("resv-step-3");

  function showStep(n) {
    [step1, step2, step3].forEach((s, i) => {
      if (s) s.style.display = i + 1 === n ? "block" : "none";
    });
  }

  // Open modal when any "Réserver" button is clicked
  document.addEventListener("click", (e) => {
    const reserveBtn = e.target.closest("[data-open-resv]");
    if (!reserveBtn) return;

    // Grab tour info from the parent card
    const card = reserveBtn.closest(".vo-card");
    const name =
      card?.querySelector(".vo-card-title")?.textContent?.trim() || "Ce voyage";
    const price = card?.dataset.price || "0";
    const dur = card?.dataset.dur || "—";

    document.getElementById("resv-tour-name").textContent = name;
    document.getElementById("resv-tour-meta").textContent =
      `Durée : ${dur} jours  ·  À partir de ${Number(price).toLocaleString("fr")} TND/pers.`;

    // Pre-compute total
    updateTotal(price);
    document
      .getElementById("resv-step-1")
      .querySelector("#cnt-val").dataset.price = price;

    showStep(1);
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  });

  // Close buttons
  ["resv-close", "resv-close-2"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", closeModal);
  });
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  // Pax counter
  let paxCount = 2;
  function updateTotal(pricePerPerson) {
    const p =
      pricePerPerson !== undefined
        ? pricePerPerson
        : document
            .getElementById("resv-tour-meta")
            .textContent.match(/[\d\s]+(?=\s*TND)/)?.[0]
            ?.replace(/\s/g, "") || "0";
    const total = paxCount * Number(p);
    document.getElementById("resv-total").textContent =
      total.toLocaleString("fr") + " TND";
  }

  document.getElementById("cnt-minus")?.addEventListener("click", () => {
    if (paxCount > 1) {
      paxCount--;
      refreshCounter();
    }
  });
  document.getElementById("cnt-plus")?.addEventListener("click", () => {
    if (paxCount < 20) {
      paxCount++;
      refreshCounter();
    }
  });
  function refreshCounter() {
    document.getElementById("cnt-val").textContent = paxCount;
    const meta = document.getElementById("resv-tour-meta").textContent;
    const match = meta.match(/([\d\s]+)\s*TND/);
    if (match) updateTotal(match[1].replace(/\s/g, ""));
  }

  // Step 1 → Step 2
  document.getElementById("resv-to-step2")?.addEventListener("click", () => {
    const prenom = document.getElementById("resv-prenom").value.trim();
    const nom = document.getElementById("resv-nom").value.trim();
    const email = document.getElementById("resv-email").value.trim();
    if (!prenom || !nom || !email) {
      alert("Veuillez remplir au moins le prénom, le nom et l'e-mail.");
      return;
    }
    showStep(2);
  });

  // Step 2 → Step 1 (back)
  document
    .getElementById("resv-to-step1")
    ?.addEventListener("click", () => showStep(1));

  // Payment method toggle
  document.querySelectorAll(".resv-pay-opt").forEach((opt) => {
    opt.addEventListener("click", () => {
      document
        .querySelectorAll(".resv-pay-opt")
        .forEach((o) => o.classList.remove("active"));
      opt.classList.add("active");
      const val = opt.dataset.pay;
      document.getElementById("pay-carte-fields").style.display =
        val === "carte" ? "" : "none";
      document.getElementById("pay-other-msg").style.display =
        val !== "carte" ? "" : "none";
    });
  });

  // Confirm button → Step 3
  document.getElementById("resv-confirm-btn")?.addEventListener("click", () => {
    // Generate a random reference number
    const ref =
      "JKT-" +
      Math.random().toString(36).substring(2, 7).toUpperCase() +
      "-" +
      Date.now().toString().slice(-4);
    document.getElementById("resv-ref-num").textContent = ref;
    showStep(3);
  });

  // Done → close
  document.getElementById("resv-done-btn")?.addEventListener("click", () => {
    closeModal();
    showStep(1); // reset for next time
    paxCount = 2;
    // Clear fields
    [
      "resv-prenom",
      "resv-nom",
      "resv-email",
      "resv-tel",
      "resv-date",
      "resv-card-num",
      "resv-card-exp",
      "resv-card-cvv",
      "resv-card-name",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    document.getElementById("cnt-val").textContent = "2";
  });
});
