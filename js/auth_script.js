/* ============================================================
   JEKTIS TRAVEL — Auth Page Script (auth_script.js)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ══════════════════════════════════════════════════════
  // STARS CANVAS — procedural twinkling night sky
  // ══════════════════════════════════════════════════════
  const canvas = document.getElementById("stars-canvas");
  const ctx = canvas.getContext("2d");
  let stars = [];
  let raf = null;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    createStars();
  }

  function createStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 1600);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.85, // sky portion
        r: Math.random() * 1.4 + 0.2,
        alpha: Math.random(),
        speed: Math.random() * 0.008 + 0.002,
        phase: Math.random() * Math.PI * 2,
        // tiny drift
        dx: (Math.random() - 0.5) * 0.04,
        dy: (Math.random() - 0.5) * 0.02,
        // colour tint: mostly white, a few warm/cool
        hue: Math.random() < 0.15 ? (Math.random() < 0.5 ? 40 : 210) : 0,
        sat: Math.random() < 0.15 ? 60 : 0,
      });
    }
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s) => {
      s.phase += s.speed;
      const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s.phase));

      // slow parallax drift
      s.x += s.dx;
      s.y += s.dy;
      if (s.x < 0) s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;
      if (s.y < 0) s.y = canvas.height * 0.85;
      if (s.y > canvas.height * 0.85) s.y = 0;

      const color =
        s.sat > 0
          ? `hsla(${s.hue}, ${s.sat}%, 90%, ${alpha})`
          : `rgba(240,235,224,${alpha})`;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Bright stars get a cross glint
      if (s.r > 1.2) {
        ctx.strokeStyle = `rgba(240,235,224,${alpha * 0.35})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x - s.r * 2.5, s.y);
        ctx.lineTo(s.x + s.r * 2.5, s.y);
        ctx.moveTo(s.x, s.y - s.r * 2.5);
        ctx.lineTo(s.x, s.y + s.r * 2.5);
        ctx.stroke();
      }
    });
    raf = requestAnimationFrame(drawStars);
  }

  resizeCanvas();
  drawStars(0);

  const ro = new ResizeObserver(resizeCanvas);
  ro.observe(canvas);
  window.addEventListener("resize", resizeCanvas, { passive: true });

  // ══════════════════════════════════════════════════════
  // FORM SWITCHING — Sign In ↔ Sign Up
  // ══════════════════════════════════════════════════════
  const btnSignIn = document.getElementById("btn-signin");
  const btnSignUp = document.getElementById("btn-signup");
  const formSignIn = document.getElementById("form-signin");
  const formSignUp = document.getElementById("form-signup");
  const indicator = document.querySelector(".auth-mode-indicator");
  const toSignUp = document.getElementById("to-signup");
  const toSignIn = document.getElementById("to-signin");

  function showSignIn() {
    btnSignIn.classList.add("active");
    btnSignUp.classList.remove("active");
    indicator.classList.remove("right");
    formSignIn.classList.remove("hidden");
    formSignUp.classList.add("hidden");
    // Re-trigger animation
    formSignIn.style.animation = "none";
    requestAnimationFrame(() => {
      formSignIn.style.animation = "";
    });
  }

  function showSignUp() {
    btnSignUp.classList.add("active");
    btnSignIn.classList.remove("active");
    indicator.classList.add("right");
    formSignUp.classList.remove("hidden");
    formSignIn.classList.add("hidden");
    formSignUp.style.animation = "none";
    requestAnimationFrame(() => {
      formSignUp.style.animation = "";
    });
  }

  btnSignIn.addEventListener("click", showSignIn);
  btnSignUp.addEventListener("click", showSignUp);
  toSignUp?.addEventListener("click", showSignUp);
  toSignIn?.addEventListener("click", showSignIn);

  // ══════════════════════════════════════════════════════
  // PASSWORD VISIBILITY TOGGLE
  // ══════════════════════════════════════════════════════
  document.querySelectorAll(".auth-eye").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      const icon = btn.querySelector("i");
      if (!input) return;
      if (input.type === "password") {
        input.type = "text";
        icon.className = "fa-regular fa-eye-slash";
      } else {
        input.type = "password";
        icon.className = "fa-regular fa-eye";
      }
    });
  });

  // ══════════════════════════════════════════════════════
  // PASSWORD STRENGTH METER
  // ══════════════════════════════════════════════════════
  const suPass = document.getElementById("su-pass");
  const strengthFill = document.getElementById("strength-fill");
  const strengthLbl = document.getElementById("strength-label");

  function measureStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0–5
  }

  const strengthConfig = [
    { pct: 0, color: "transparent", label: "" },
    { pct: 20, color: "#e53935", label: "Très faible" },
    { pct: 40, color: "#ef6c00", label: "Faible" },
    { pct: 60, color: "#f9a825", label: "Moyen" },
    { pct: 80, color: "#66bb6a", label: "Fort" },
    { pct: 100, color: "#2e7d32", label: "Très fort" },
  ];

  suPass?.addEventListener("input", () => {
    const score = measureStrength(suPass.value);
    const cfg = strengthConfig[score];
    if (strengthFill) {
      strengthFill.style.width = cfg.pct + "%";
      strengthFill.style.background = cfg.color;
    }
    if (strengthLbl) {
      strengthLbl.textContent = cfg.label;
      strengthLbl.style.color = cfg.color;
    }
  });

  // ══════════════════════════════════════════════════════
  // FORM SUBMISSION — demo / validation
  // ══════════════════════════════════════════════════════
  function shake(el) {
    el.style.animation = "none";
    el.offsetHeight; // reflow
    el.style.animation = "shakeField 0.4s ease";
  }

  function markError(inputWrap) {
    const input = inputWrap.querySelector("input");
    if (!input) return;
    input.style.borderColor = "#e53935";
    input.style.boxShadow = "0 0 0 3px rgba(229,57,53,0.12)";
    shake(inputWrap);
    input.addEventListener(
      "input",
      function clear() {
        input.style.borderColor = "";
        input.style.boxShadow = "";
        input.removeEventListener("input", clear);
      },
      { once: true },
    );
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  document.getElementById("signin-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    const emailWrap = document.getElementById("si-email").parentElement;
    const passWrap = document.getElementById("si-pass").parentElement;
    if (!isValidEmail(document.getElementById("si-email").value)) {
      markError(emailWrap);
      ok = false;
    }
    if (document.getElementById("si-pass").value.length < 6) {
      markError(passWrap);
      ok = false;
    }
    if (ok)
      submitSuccess(e.target.querySelector(".auth-submit-btn"), "Connexion…");
  });

  document.getElementById("signup-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    const fnameWrap = document.getElementById("su-fname").parentElement;
    const emailWrap = document.getElementById("su-email").parentElement;
    const passWrap = document.getElementById("su-pass").parentElement;
    if (!document.getElementById("su-fname").value.trim()) {
      markError(fnameWrap);
      ok = false;
    }
    if (!isValidEmail(document.getElementById("su-email").value)) {
      markError(emailWrap);
      ok = false;
    }
    if (document.getElementById("su-pass").value.length < 8) {
      markError(passWrap);
      ok = false;
    }
    if (!document.getElementById("su-terms").checked) {
      shake(document.getElementById("su-terms").closest(".auth-remember"));
      ok = false;
    }
    if (ok)
      submitSuccess(e.target.querySelector(".auth-submit-btn"), "Création…");
  });

  function submitSuccess(btn, loadingText) {
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> <span>${loadingText}</span>`;
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Succès !</span>`;
      btn.style.background = "linear-gradient(135deg, #2e7d32, #388e3c)";
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = "";
        btn.disabled = false;
      }, 2200);
    }, 1600);
  }

  // ══════════════════════════════════════════════════════
  // SOCIAL BUTTON DEMO FEEDBACK
  // ══════════════════════════════════════════════════════
  document.querySelectorAll(".auth-social-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const orig = btn.innerHTML;
      btn.style.borderColor = "var(--gold)";
      setTimeout(() => {
        btn.style.borderColor = "";
      }, 800);
    });
  });
});

/* ── CSS animation for field shake — injected via JS ── */
const shakeStyle = document.createElement("style");
shakeStyle.textContent = `
  @keyframes shakeField {
    0%,100% { transform: translateX(0); }
    15%     { transform: translateX(-6px); }
    35%     { transform: translateX(6px); }
    55%     { transform: translateX(-4px); }
    75%     { transform: translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);
