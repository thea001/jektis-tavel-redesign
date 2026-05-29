/* ============================================================
   JEKTIS TRAVEL — Home Page Script
   Handles:
     - Intro splash
     - Plane takeoff animation (scroll-driven)
     - Navbar reveal (after plane scene)
     - Hero carousel
     - Search tabs
     - Reviews inject
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ══════════════════════════════════════════════════════
  // DOM REFERENCES
  // ══════════════════════════════════════════════════════
  const splash = document.getElementById("intro-splash");
  const planeSc = document.getElementById("plane-scene");
  const planeEl = document.getElementById("plane-img");
  const shadowEl = document.getElementById("plane-shadow");
  const textLeft = document.getElementById("plane-text-left");
  const textRight = document.getElementById("plane-text-right");
  const runwayLine = document.getElementById("runway-line");
  const runwayGlow = document.getElementById("runway-glow");
  const navbar = document.getElementById("navbar");

  // ══════════════════════════════════════════════════════
  // INTRO SPLASH — lock scroll briefly, hide on first scroll
  // ══════════════════════════════════════════════════════
  document.body.style.overflow = "hidden";
  setTimeout(() => {
    document.body.style.overflow = "";
  }, 2200);

  function hideSplash() {
    if (!splash.classList.contains("hidden")) {
      splash.classList.add("hidden");
      setTimeout(() => {
        splash.style.display = "none";
      }, 1000);
    }
  }

  // ══════════════════════════════════════════════════════
  // PLANE ANIMATION — sticky-scroll driven
  //
  // Architecture:
  //   #plane-scene  = tall scroll track (2800px, position:relative)
  //   #plane-stage  = sticky 100vh panel (position:sticky, top:0)
  //   All animation coordinates are relative to the 100vh stage.
  //
  // How it works:
  //   While the user scrolls within #plane-scene, #plane-stage stays
  //   pinned to the viewport. `rel` = how far into the scene we've
  //   scrolled (0 → 2800). The plane moves inside the fixed 100vh stage.
  //
  // Phase 1 (rel   0 → 1400): Tiny plane at top, rolls down & grows (0.1x→1.0x)
  // Phase 2 (rel 1400 → 2800): Liftoff — nose up, scale 1.0x→4.0x,
  //   flies toward viewer, exits bottom. Shadow stays & fades. Text appears.
  //
  // CRITICAL: scene bounds measured ONCE. Never re-read offsetTop inside
  // onScroll — the .gone class sets height:0 which corrupts the measurement.
  // ══════════════════════════════════════════════════════

  // ── Cached scene bounds (measured once at load + on resize) ──
  let sceneTop = 0;
  let sceneBottom = 0;

  function measureScene() {
    // Read real geometry — safe because .gone no longer collapses height
    sceneTop = planeSc.offsetTop;
    sceneBottom = sceneTop + planeSc.offsetHeight; // sceneTop + 2800px
  }

  measureScene();
  window.addEventListener("resize", measureScene, { passive: true });

  // ── setPlane: write all element styles in one shot per frame ──
  //
  // KEY DESIGN: the plane's <img> is anchored at top:0, left:50%.
  // ALL movement (vertical position + scale + rotation) is done through
  // a single `transform` chain. This avoids the top+transform conflict
  // where changing `top` and `scale(transform-origin)` independently
  // causes the plane to scale in place without moving.
  //
  // Transform order matters:
  //   translateX(-50%)           → centre horizontally
  //   translateY(posY)           → move down the runway / into the sky
  //   scale(s)                   → grow/shrink (pivot = where translateY placed us)
  //   perspective(1200px)        → 3-D context for rotateX
  //   rotateX(deg)               → nose up/down pitch
  //   rotateZ(deg)               → tail waggle
  function setPlane({
    scale, // plane size multiplier
    posY, // vertical offset in px (translateY, from top of stage)
    rotateX, // pitch: negative = nose up
    rotateZ, // roll waggle (small degrees)
    opacity, // plane opacity
    shadowScale, // shadow ellipse size multiplier
    shadowOpacity, // shadow darkness 0..1
    shadowPosY, // shadow top position in px inside stage (independent)
    textLeftOp, // "Fly with" opacity
    textRightOp, // "JektisTravel" opacity
    textScale, // text scale
  }) {
    // Plane image — top:0 is fixed, all movement is via transform
    planeEl.style.cssText = `
      position: absolute;
      width: 500px;
      left: 50%;
      top: 0;
      opacity: ${opacity};
      transform: translateX(-50%) translateY(${posY}px) scale(${scale}) perspective(1200px) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg);
      transform-origin: center center;
      will-change: transform, opacity;
      transition: none;
    `;

    // Shadow — stays on the "ground" (near bottom of stage during taxi,
    // then stays behind as plane lifts off and grows)
    const sw = 320 * shadowScale;
    const sh = 55 * shadowScale;
    const sd = Math.min(0.88, shadowOpacity);
    shadowEl.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${shadowPosY}px;
      width: ${sw}px;
      height: ${sh}px;
      opacity: ${shadowOpacity};
      transform: translateX(-50%);
      background: radial-gradient(
        ellipse at center,
        rgba(0,0,0,${sd}) 0%,
        rgba(0,0,0,${sd * 0.55}) 40%,
        rgba(0,0,0,${sd * 0.15}) 70%,
        transparent 100%
      );
      border-radius: 50%;
      filter: blur(${Math.max(4, 14 * shadowScale)}px);
      will-change: opacity, top, width, height;
      transition: none;
    `;

    // Text — absolute inside stage, vertically centered
    textLeft.style.cssText = `
      opacity: ${textLeftOp};
      transform: translateY(${-50 + (1 - textLeftOp) * 10}%) scale(${textScale});
    `;
    textRight.style.cssText = `
      opacity: ${textRightOp};
      transform: translateY(${-50 + (1 - textRightOp) * 10}%) scale(${textScale});
    `;
  }

  // ── Easing & math helpers ──
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }
  function mapRange(val, inLo, inHi, outLo, outHi) {
    return outLo + (outHi - outLo) * clamp((val - inLo) / (inHi - inLo), 0, 1);
  }

  // ── Main scroll handler ──
  function onScroll() {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    if (scrollY > 10) hideSplash();

    // rel: how many px into the scene we've scrolled (0 → 2800)
    const rel = scrollY - sceneTop;
    const inScene = scrollY >= sceneTop && scrollY < sceneBottom;

    // Navbar: hidden during animation, appears once scene ends
    if (scrollY > sceneBottom - 80) {
      navbar.classList.add("visible");
      navbar.classList.toggle("scrolled", scrollY > sceneBottom + 40);
    } else {
      navbar.classList.remove("visible");
      navbar.classList.remove("scrolled");
    }

    if (!inScene) {
      // Hide the stage visually — the 2800px track stays in the DOM
      // so scrollY never jumps and we never get a reset loop
      planeSc.classList.add("gone");
      runwayLine.classList.remove("visible");
      if (runwayGlow) runwayGlow.classList.remove("visible");
      // Hide text too when outside scene
      textLeft.style.opacity = "0";
      textRight.style.opacity = "0";
      return;
    }

    // Scene active — show sticky stage
    planeSc.classList.remove("gone");
    runwayLine.classList.add("visible");
    if (runwayGlow) runwayGlow.classList.add("visible");

    // ───────────────────────────────────────────────────────
    // PHASE 1 — Taxi & Roll  (rel 0 → 1400)
    //
    // Plane starts tiny (scale 0.1) at the top of the stage,
    // rolls toward the viewer, growing to scale 1.0 and moving
    // to 60% down the stage (near the "end of runway").
    // Shadow is fixed at the plane's bottom, dark & large.
    // ───────────────────────────────────────────────────────
    if (rel <= 1400) {
      const t = easeInOut(rel / 1400); // 0 → 1

      const scale = mapRange(t, 0, 1, 0.1, 1.0);
      const posY = mapRange(t, 0, 1, vh * 0.05, vh * 0.6) - 240; // top → 60% down
      const rotateX = 0;
      const rotateZ = 0;
      const opacity = mapRange(t, 0, 0.07, 0, 1); // snappy fade-in

      // Shadow tracks plane — dark, sized to match scale
      const shadowOpacity = 0.85;
      const shadowScale = scale; // shadow grows with plane
      const shadowPosY = (posY + 240) * scale; // just below belly

      setPlane({
        scale,
        posY,
        rotateX,
        rotateZ,
        opacity,
        shadowScale,
        shadowOpacity,
        shadowPosY,
        textLeftOp: 0,
        textRightOp: 0,
        textScale: 1,
      });
    }

    // ───────────────────────────────────────────────────────
    // PHASE 2 — Liftoff & Flyover  (rel 1400 → 2800)
    //
    // Plane's nose lifts (rotateX → −25°).
    // Scale explodes from 1.0 → 4.0 (flying over the camera).
    // Plane moves from 60% down to off the bottom (110vh).
    // Shadow stays at the "runway" position (~70% down), shrinks & fades.
    // Text ("Fly with" then "JektisTravel") fades in then out.
    // Plane fades out in the last 15%.
    // ───────────────────────────────────────────────────────
    else {
      const t = easeOut((rel - 1400) / 1400); // 0 → 1

      const scale = mapRange(t, 0, 1, 1.0, 4.0);
      const posY = mapRange(t, 0, 1, vh * 0.6, vh * 1.1) - 240; // 60% → off-bottom
      const rotateX = mapRange(t, 0, 1, 0, -25);
      const rotateZ = Math.sin(t * Math.PI) * 2.5 * mapRange(t, 0, 0.4, 1, 0); // waggle on liftoff only
      const opacity = mapRange(t, 0.82, 1.0, 1, 0); // fade out last 18%

      // Shadow stays at runway height (~70% of stage), shrinks as plane climbs
      const shadowScale = mapRange(t, 0, 0.7, 1.0, 0.05);
      const shadowOpacity = mapRange(t, 0, 0.6, 0.85, 0.0);
      const shadowPosY = vh * 0.72; // anchored to runway

      // "Fly with" appears first, then "JektisTravel"
      const textLeftOp =
        clamp(mapRange(t, 0.08, 0.28, 0, 1), 0, 1) *
        clamp(mapRange(t, 0.72, 0.88, 1, 0), 0, 1);
      const textRightOp =
        clamp(mapRange(t, 0.18, 0.38, 0, 1), 0, 1) *
        clamp(mapRange(t, 0.75, 0.9, 1, 0), 0, 1);
      const textScale = mapRange(t, 0, 0.3, 0.88, 1.08);

      setPlane({
        scale,
        posY,
        rotateX,
        rotateZ,
        opacity,
        shadowScale,
        shadowOpacity,
        shadowPosY,
        textLeftOp,
        textRightOp,
        textScale,
      });
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load

  // ══════════════════════════════════════════════════════
  // HERO CAROUSEL
  // ══════════════════════════════════════════════════════
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const titles = [
    'Découvrez la Magie<br>de la <span style="color:#BBCC1C">Tunisie</span>',
    'Plages Paradisiaques<br>&amp; <span style="color:#BBCC1C">Resorts Luxueux</span>',
    'Aventures <span style="color:#BBCC1C">Inoubliables</span><br>au Bout du Monde',
    'Circuits Culturels<br>&amp; <span style="color:#BBCC1C">Sahara Magique</span>',
  ];
  const subs = [
    "Des séjours inoubliables, des hôtels 5 étoiles, des circuits authentiques — tout commence ici.",
    "Hammamet, Djerba, Sousse — les plus belles plages de la Méditerranée vous attendent.",
    "Vols internationaux aux meilleurs prix, pour explorer chaque coin du globe.",
    "Tozeur, Douz, Matmata — laissez-vous envoûter par les dunes dorées.",
  ];
  let cur = 0;

  function goToSlide(n) {
    slides[cur].classList.remove("active");
    dots[cur].classList.remove("active");
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add("active");
    dots[cur].classList.add("active");
    document.getElementById("hero-title").innerHTML = titles[cur];
    document.getElementById("hero-sub").textContent = subs[cur];
  }

  dots.forEach((d) =>
    d.addEventListener("click", () => goToSlide(+d.dataset.idx)),
  );
  setInterval(() => goToSlide(cur + 1), 5000);

  // ══════════════════════════════════════════════════════
  // SEARCH TABS
  // ══════════════════════════════════════════════════════
  document.querySelectorAll(".stab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".stab")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".search-form-panel")
        .forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });

  // ══════════════════════════════════════════════════════
  // REVIEWS — inject cards
  // ══════════════════════════════════════════════════════
  const reviewData = [
    {
      name: "Sana B.",
      trip: "Séjour Djerba 7 nuits",
      stars: 5,
      text: "Service impeccable du début à la fin ! L'hôtel était magnifique, les transferts ponctuels. Je recommande vivement Jektis Travel pour vos prochaines vacances.",
    },
    {
      name: "Karim M.",
      trip: "Circuit Sud Tunisie",
      stars: 5,
      text: "Le circuit dans le sud était une expérience magique. Notre guide était excellent, passionné et très professionnel. Souvenirs inoubliables !",
    },
    {
      name: "Leila H.",
      trip: "Vol Tunis–Paris",
      stars: 4,
      text: "Excellent rapport qualité-prix pour le billet. Réservation facile et rapide sur le site. Petite attente au service client mais tout s'est bien passé.",
    },
    {
      name: "Youssef T.",
      trip: "Voyage de noce Maldives",
      stars: 5,
      text: "Jektis Travel a organisé notre voyage de noce de A à Z. Chaque détail était parfait — hôtel, surprises romantiques, excursions. Merci !",
    },
    {
      name: "Mariam C.",
      trip: "Séjour Hammamet",
      stars: 5,
      text: "Hôtel 5 étoiles à un prix imbattable ! La plage était à couper le souffle. On revient l'an prochain sans hésiter.",
    },
    {
      name: "Adel K.",
      trip: "Circuit Djerba Culturel",
      stars: 4,
      text: "Très bonne organisation du circuit. Les sites historiques étaient fascinants. Je recommande le forfait Djerba Patrimoine.",
    },
    {
      name: "Nadia R.",
      trip: "Séjour Tabarka",
      stars: 5,
      text: "Tabarka est une révélation ! Mer turquoise, forêts de pins, hôtel boutique sublime. On ne rêve que d'y retourner !",
    },
    {
      name: "Tarek B.",
      trip: "Voyage entreprise",
      stars: 5,
      text: "Jektis a géré notre séminaire d'entreprise avec un professionnalisme remarquable. 35 collaborateurs, zéro accroc. Bravo !",
    },
  ];

  function buildReviews() {
    const track = document.getElementById("reviews-track");
    const allReviews = [...reviewData, ...reviewData];
    track.innerHTML = allReviews
      .map(
        (r) => `
      <div class="review-card">
        <div class="review-stars">${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}</div>
        <p class="review-text">"${r.text}"</p>
        <div class="review-author">
          <div class="review-avatar">${r.name.charAt(0)}</div>
          <div>
            <div class="review-name">${r.name}</div>
            <div class="review-trip"><i class="fa-regular fa-plane fa-xs mr-1"></i>${r.trip}</div>
          </div>
        </div>
      </div>
    `,
      )
      .join("");
  }
  buildReviews();
});
