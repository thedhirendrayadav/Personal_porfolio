(() => {
  "use strict";

  const body = document.body;
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenu.classList.remove("is-open");
    body.classList.remove("menu-open");
  };

  menuButton?.addEventListener("click", () => {
    const opening = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(opening));
    mobileMenu?.setAttribute("aria-hidden", String(!opening));
    mobileMenu?.classList.toggle("is-open", opening);
    body.classList.toggle("menu-open", opening);
  });
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const progressBar = document.querySelector("[data-evidence-progress]");
  const scrollReadout = document.querySelector("[data-scroll-readout]");
  let scrollFrame = 0;
  const updateScroll = () => {
    scrollFrame = 0;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / max));
    progressBar?.style.setProperty("--evidence-progress", progress.toFixed(3));
    if (scrollReadout) scrollReadout.textContent = progress.toFixed(2);
  };
  addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }, { passive: true });
  updateScroll();

  const sectionLabels = [...document.querySelectorAll("[data-evidence-section], [data-evidence-announcer], [data-hud-section]")];
  const updateSectionLabel = (label) => {
    sectionLabels.forEach((element) => {
      element.textContent = label;
    });
  };
  const sections = [...document.querySelectorAll("[data-section]")];
  if (sectionLabels.length && sections.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (active) updateSectionLabel(active.target.dataset.section);
    }, { rootMargin: "-25% 0px -55%", threshold: [0, .2, .5] });
    sections.forEach((section) => observer.observe(section));
  }

  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!revealItems.length) {
    // nothing to reveal
  } else if (reduceMotion || !("requestAnimationFrame" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealPoint = () => innerHeight * 0.85;
    const updateReveal = () => {
      const trigger = revealPoint();
      revealItems.forEach((item) => {
        if (item.classList.contains("is-visible")) return;
        const rect = item.getBoundingClientRect();
        if (rect.top <= trigger && rect.bottom > 0) item.classList.add("is-visible");
      });
    };
    let revealFrame = 0;
    const requestReveal = () => {
      if (revealFrame) return;
      revealFrame = requestAnimationFrame(() => { revealFrame = 0; updateReveal(); });
    };
    addEventListener("scroll", requestReveal, { passive: true });
    addEventListener("resize", requestReveal);
    updateReveal();
  }

  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeValue = document.querySelector("[data-theme-value]");
  const accentCycle = document.querySelector("[data-accent-cycle]");
  const accentCode = document.querySelector("[data-accent-code]");
  const fontCycle = document.querySelector("[data-font-cycle]");
  const fontValue = document.querySelector("[data-font-value]");
  const store = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const accents = [
    "#9df9f3", "#79c7ff", "#b8a1ff", "#ff8fc8",
    "#ff7f73", "#f4bf4f", "#d7f171", "#75e6a4",
    "#64d8cb", "#a8c7fa", "#f7a76c", "#c4f0c5",
  ];
  const fontPresets = [
    {
      id: "rubik",
      label: "RUBIK",
      display: '"Rubik", Arial, sans-serif',
      mono: '"IBM Plex Mono", Consolas, monospace',
      googleFamilies: [],
    },
    {
      id: "space",
      label: "SPACE",
      display: '"Space Grotesk", Arial, sans-serif',
      mono: '"IBM Plex Mono", Consolas, monospace',
      googleFamilies: ["Space+Grotesk:wght@300..700"],
    },
    {
      id: "archivo",
      label: "ARCHIVO",
      display: '"Archivo", Arial, sans-serif',
      mono: '"Roboto Mono", Consolas, monospace',
      googleFamilies: ["Archivo:wdth,wght@75..125,300..900", "Roboto+Mono:wght@400;500"],
    },
    {
      id: "barlow",
      label: "BARLOW",
      display: '"Barlow Condensed", Arial, sans-serif',
      mono: '"JetBrains Mono", Consolas, monospace',
      googleFamilies: ["Barlow+Condensed:wght@300;400;500;600;700;800", "JetBrains+Mono:wght@400;500"],
    },
    {
      id: "syne",
      label: "SYNE",
      display: '"Syne", Arial, sans-serif',
      mono: '"Space Mono", Consolas, monospace',
      googleFamilies: ["Syne:wght@400..800", "Space+Mono:wght@400;700"],
    },
    {
      id: "manrope",
      label: "MANROPE",
      display: '"Manrope", Arial, sans-serif',
      mono: '"DM Mono", Consolas, monospace',
      googleFamilies: ["Manrope:wght@300..800", "DM+Mono:wght@400;500"],
    },
  ];

  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggle?.setAttribute("aria-pressed", String(theme === "light"));
    if (themeValue) themeValue.textContent = theme.toUpperCase();
  };
  const savedTheme = read("portfolio-theme");
  applyTheme(savedTheme === "light" ? "light" : "dark");
  themeToggle?.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    store("portfolio-theme", next);
  });

  const applyAccent = (candidate) => {
    const color = accents.includes(candidate?.toLowerCase()) ? candidate.toLowerCase() : accents[0];
    document.documentElement.style.setProperty("--accent", color);
    if (accentCode) accentCode.textContent = color.toUpperCase();
    return color;
  };
  let activeAccent = applyAccent(read("portfolio-accent"));
  accentCycle?.addEventListener("click", () => {
    const next = accents[(accents.indexOf(activeAccent) + 1) % accents.length];
    activeAccent = applyAccent(next);
    store("portfolio-accent", activeAccent);
  });

  const ensureFontLoaded = (preset) => {
    if (!preset.googleFamilies.length || document.getElementById(`font-preset-${preset.id}`)) return;
    const stylesheet = document.createElement("link");
    stylesheet.id = `font-preset-${preset.id}`;
    stylesheet.rel = "stylesheet";
    stylesheet.href = `https://fonts.googleapis.com/css2?${preset.googleFamilies.map((family) => `family=${family}`).join("&")}&display=swap`;
    document.head.append(stylesheet);
  };

  const applyFont = (candidate) => {
    const preset = fontPresets.find(({ id }) => id === candidate) || fontPresets[0];
    ensureFontLoaded(preset);
    document.documentElement.style.setProperty("--display", preset.display);
    document.documentElement.style.setProperty("--mono", preset.mono);
    document.documentElement.dataset.font = preset.id;
    if (fontValue) fontValue.textContent = preset.label;
    return preset.id;
  };
  let activeFont = applyFont(read("portfolio-font"));
  fontCycle?.addEventListener("click", () => {
    const currentIndex = fontPresets.findIndex(({ id }) => id === activeFont);
    activeFont = applyFont(fontPresets[(currentIndex + 1) % fontPresets.length].id);
    store("portfolio-font", activeFont);
  });

  const filterButtons = document.querySelectorAll("[data-project-filter]");
  const projects = document.querySelectorAll("[data-project-type]");
  filterButtons.forEach((button) => button.addEventListener("click", () => {
    const filter = button.dataset.projectFilter;
    filterButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    projects.forEach((project) => {
      project.hidden = filter !== "all" && project.dataset.projectType !== filter;
    });
  }));

  const workDeck = document.querySelector("[data-work-deck]");
  const workDeckCards = workDeck ? [...workDeck.querySelectorAll("[data-work-card]")] : [];
  const workDeckTicks = workDeck ? [...workDeck.querySelectorAll("[data-work-tick]")] : [];
  const workDeckIndex = workDeck?.querySelector("[data-work-index]");
  const workDeckTotal = workDeck?.querySelector("[data-work-total]");
  const workDeckSticky = workDeck?.querySelector(".work-deck-sticky");
  const workDeckMotionQuery = matchMedia("(min-width: 981px) and (prefers-reduced-motion: no-preference)");
  let workDeckFrame = 0;

  const updateWorkDeck = () => {
    workDeckFrame = 0;
    if (!workDeck || !workDeckCards.length) return;

    const total = workDeckCards.length;
    const enabled = workDeckMotionQuery.matches;
    workDeck.style.setProperty("--work-deck-count", total);
    if (workDeckTotal) workDeckTotal.textContent = String(total).padStart(2, "0");

    if (!enabled) {
      workDeck.removeAttribute("data-work-deck-ready");
      workDeck.style.setProperty("--work-deck-progress", "0");
      workDeck.style.setProperty("--work-deck-shift", "0%");
      if (workDeckIndex) workDeckIndex.textContent = "01";
      workDeckCards.forEach((card) => {
        card.classList.remove("is-active", "is-past", "is-future");
        card.removeAttribute("aria-hidden");
        card.inert = false;
      });
      workDeckTicks.forEach((tick, index) => tick.classList.toggle("is-active", index === 0));
      return;
    }

    workDeck.dataset.workDeckReady = "true";
    const start = workDeck.getBoundingClientRect().top + scrollY;
    const stickyHeight = workDeckSticky?.offsetHeight || innerHeight;
    const range = Math.max(1, workDeck.offsetHeight - stickyHeight);
    const progress = Math.min(1, Math.max(0, (scrollY - start) / range));
    const activeIndex = Math.min(total - 1, Math.floor(progress * total));
    if (sectionLabels.length && scrollY >= start && scrollY <= start + range) {
      updateSectionLabel(workDeck.dataset.section || "01 — WORK");
    }
    workDeck.style.setProperty("--work-deck-progress", progress.toFixed(3));
    workDeck.style.setProperty("--work-deck-shift", `-${(progress * 18).toFixed(2)}%`);
    if (workDeckIndex) workDeckIndex.textContent = String(activeIndex + 1).padStart(2, "0");

    workDeckCards.forEach((card, index) => {
      const active = index === activeIndex;
      card.classList.toggle("is-active", active);
      card.classList.toggle("is-past", index < activeIndex);
      card.classList.toggle("is-future", index > activeIndex);
      card.setAttribute("aria-hidden", String(!active));
      card.inert = !active;
    });
    workDeckTicks.forEach((tick, index) => tick.classList.toggle("is-active", index === activeIndex));
  };

  const requestWorkDeckUpdate = () => {
    if (!workDeckFrame) workDeckFrame = requestAnimationFrame(updateWorkDeck);
  };

  if (workDeckCards.length) {
    addEventListener("scroll", requestWorkDeckUpdate, { passive: true });
    addEventListener("resize", requestWorkDeckUpdate);
    workDeckMotionQuery.addEventListener?.("change", requestWorkDeckUpdate);
    updateWorkDeck();
  }

  document.querySelectorAll("[data-project-image]").forEach((image) => {
    image.addEventListener("error", () => {
      image.hidden = true;
      const fallback = image.parentElement?.querySelector("[data-image-fallback]");
      if (fallback) fallback.hidden = false;
    }, { once: true });
  });

  const contactForm = document.querySelector("#contactFormEnhanced");
  const formStatus = document.querySelector("#formStatus");
  contactForm?.addEventListener("submit", async (event) => {
    if (!("fetch" in window)) return;
    event.preventDefault();
    const submit = contactForm.querySelector(".submit-btn-enhanced");
    submit?.setAttribute("disabled", "");
    if (formStatus) formStatus.textContent = "Sending your message…";
    try {
      const response = await fetch(contactForm.action || location.pathname, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const result = await response.json();
      if (formStatus) formStatus.textContent = result.message;
      if (result.success) contactForm.reset();
    } catch {
      if (formStatus) formStatus.textContent = "Message could not be sent. Please try again or email directly.";
    } finally {
      submit?.removeAttribute("disabled");
    }
  });

  /* ============ HUD enhancements: truthful clock, audio, scramble ========= */
  const hudClocks = [...document.querySelectorAll("[data-hud-clock]")];
  if (hudClocks.length) {
    let nptFormatter = null;
    try {
      nptFormatter = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false, timeZone: "Asia/Kathmandu",
      });
    } catch { nptFormatter = null; }
    const tickClock = () => {
      const now = new Date();
      const value = nptFormatter ? nptFormatter.format(now) : now.toTimeString().slice(0, 8);
      hudClocks.forEach((el) => { el.textContent = value; });
    };
    tickClock();
    setInterval(tickClock, 1000);
  }

  const keyHint = document.querySelector("[data-hud-key]");
  if (keyHint && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)) {
    keyHint.textContent = "⌘ K";
  }

  /* --- Opt-in interface audio: synthesized with Web Audio (no assets). --- */
  const SFX_STORAGE = "portfolio-sfx";
  let audioContext = null;
  let sfxEnabled = false;
  try { sfxEnabled = localStorage.getItem(SFX_STORAGE) === "true"; } catch { sfxEnabled = false; }
  const audioContextFor = () => {
    if (!audioContext && ("AudioContext" in window || "webkitAudioContext" in window)) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      try { audioContext = new Ctor(); } catch { audioContext = null; }
    }
    if (audioContext && audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  };
  const blip = (freq = 520, duration = 0.05, type = "square", peak = 0.03) => {
    if (!sfxEnabled) return;
    const ctx = audioContextFor();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = ctx.currentTime;
    amp.gain.setValueAtTime(peak, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  };
  const sfxToggle = document.querySelector("[data-sfx-toggle]");
  const sfxValue = document.querySelector("[data-sfx-value]");
  const paintSfx = () => {
    sfxToggle?.setAttribute("aria-pressed", String(sfxEnabled));
    if (sfxValue) sfxValue.textContent = sfxEnabled ? "ON" : "OFF";
  };
  sfxToggle?.addEventListener("click", () => {
    sfxEnabled = !sfxEnabled;
    try { localStorage.setItem(SFX_STORAGE, String(sfxEnabled)); } catch { /* storage unavailable */ }
    paintSfx();
    if (sfxEnabled) { audioContextFor(); blip(680, 0.09, "square", 0.05); }
  });
  paintSfx();
  document.addEventListener("click", (event) => {
    if (!sfxEnabled) return;
    if (event.target.closest("a, button, .chip, .cmdk__item")) {
      blip(430 + ((event.clientX || 0) % 5) * 40, 0.04, "square", 0.02);
    }
  }, { passive: true });

  /* --- Text scrambler: decoder effect on nav / marked headings. ---------- */
  const scrambleGlyphs = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/\\<>#*+=—·";
  const scrambleEl = (el) => {
    if (reduceMotion || el.dataset.scrambleBusy === "true") return;
    const final = el.dataset.scrambleFinal || el.textContent.trim();
    el.dataset.scrambleFinal = final;
    const glyphs = [...final];
    const frames = 15;
    let frame = 0;
    el.dataset.scrambleBusy = "true";
    const step = () => {
      frame += 1;
      const locked = Math.floor((frame / frames) * glyphs.length);
      el.textContent = glyphs.map((ch, i) => (
        ch === " " || i < locked ? ch : scrambleGlyphs[(Math.random() * scrambleGlyphs.length) | 0]
      )).join("");
      if (frame < frames) requestAnimationFrame(step);
      else { el.textContent = final; el.dataset.scrambleBusy = "false"; }
    };
    step();
  };
  [...document.querySelectorAll("[data-scramble], .editorial-nav a, .section-kicker")]
    .filter((el) => el.children.length === 0 && el.textContent.trim())
    .forEach((el) => {
      el.dataset.scrambleFinal = el.textContent.trim();
      const trigger = () => { scrambleEl(el); if (sfxEnabled) blip(900, 0.02, "triangle", 0.012); };
      el.addEventListener("pointerenter", trigger);
      el.addEventListener("focus", trigger);
    });

  /* --- Command console: Ctrl/⌘+K drawer (also "/" to open). -------------- */
  const escapeCommandText = (value) => value.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m]);
  const collectCommands = () => {
    const list = [];
    const seen = new Set();
    document.querySelectorAll(".editorial-nav a[href], .mobile-menu a[href]").forEach((anchor) => {
      const href = anchor.getAttribute("href");
      const label = anchor.textContent.replace(/\s+/g, " ").trim();
      if (!href || !label || seen.has(href)) return;
      seen.add(href);
      list.push({ label: label.replace(/^0\d[\s/]+/, "").trim() || label, href, group: "GO" });
    });
    list.push({ label: "Toggle dark / light mode", run: () => document.querySelector("[data-theme-toggle]")?.click(), group: "RUN" });
    list.push({ label: "Cycle accent colour", run: () => document.querySelector("[data-accent-cycle]")?.click(), group: "RUN" });
    list.push({ label: "Cycle font pairing", run: () => document.querySelector("[data-font-cycle]")?.click(), group: "RUN" });
    list.push({ label: sfxEnabled ? "Disable interface sound" : "Enable interface sound", run: () => sfxToggle?.click(), group: "RUN" });
    return list;
  };
  const commandScore = (text, query) => {
    const haystack = text.toLowerCase();
    const needle = query.toLowerCase().trim();
    if (!needle) return 1;
    if (haystack.includes(needle)) return 3;
    let cursor = 0;
    for (const ch of needle) { cursor = haystack.indexOf(ch, cursor); if (cursor < 0) return 0; cursor += 1; }
    return 1;
  };
  let palette = null, paletteInput = null, paletteList = null;
  let paletteOpen = false, paletteRestore = null, paletteIndex = 0, paletteMatches = [], allCommands = [];
  const paintCommands = () => {
    if (!paletteList) return;
    if (!paletteMatches.length) {
      paletteList.innerHTML = '<li class="cmdk__empty">No matching command</li>';
      return;
    }
    paletteList.innerHTML = paletteMatches.map((cmd, i) => (
      `<li class="cmdk__item" role="option" data-index="${i}" aria-selected="${i === paletteIndex}">` +
      `<span class="cmdk__item-cmd" aria-hidden="true">\u203A</span>` +
      `<span class="cmdk__item-label">${escapeCommandText(cmd.label)}</span>` +
      `<span class="cmdk__item-group">${cmd.group}</span></li>`
    )).join("");
  };
  const filterCommands = () => {
    const query = paletteInput ? paletteInput.value : "";
    paletteMatches = allCommands
      .map((cmd) => ({ cmd, score: commandScore(`${cmd.label} ${cmd.group}`, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.cmd);
    paletteIndex = 0;
    paintCommands();
  };
  const moveCommand = (delta) => {
    if (!paletteMatches.length) return;
    paletteIndex = (paletteIndex + delta + paletteMatches.length) % paletteMatches.length;
    paintCommands();
    paletteList?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  };
  const runCommand = (cmd) => {
    if (!cmd) return;
    closePalette();
    if (cmd.href) window.location.href = cmd.href;
    else if (typeof cmd.run === "function") cmd.run();
  };
  const buildPalette = () => {
    if (palette) return;
    palette = document.createElement("div");
    palette.className = "cmdk";
    palette.innerHTML = (
      '<div class="cmdk__dialog" role="dialog" aria-modal="true" aria-label="Command console">' +
      '<div class="cmdk__field"><span class="cmdk__prompt" aria-hidden="true">&gt;</span>' +
      '<input class="cmdk__input" type="text" placeholder="type a command or page" aria-label="Search commands" aria-controls="cmdk-results" autocomplete="off" spellcheck="false">' +
      '<button type="button" class="cmdk__close" data-cmdk-close aria-label="Close command console">\u00D7</button></div>' +
      '<ul class="cmdk__results" id="cmdk-results" role="listbox" aria-label="Commands"></ul>' +
      '<div class="cmdk__hint"><b>↑↓</b> navigate <b>↵</b> select <b>esc</b> close</div></div>'
    );
    document.body.appendChild(palette);
    paletteInput = palette.querySelector(".cmdk__input");
    paletteList = palette.querySelector(".cmdk__results");
    palette.addEventListener("click", (event) => {
      if (event.target === palette || event.target.closest("[data-cmdk-close]")) closePalette();
    });
    paletteList.addEventListener("click", (event) => {
      const item = event.target.closest(".cmdk__item");
      if (item) runCommand(paletteMatches[Number(item.dataset.index)]);
    });
    paletteInput.addEventListener("input", filterCommands);
    paletteInput.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") { event.preventDefault(); moveCommand(1); }
      else if (event.key === "ArrowUp") { event.preventDefault(); moveCommand(-1); }
      else if (event.key === "Enter") { event.preventDefault(); runCommand(paletteMatches[paletteIndex]); }
      else if (event.key === "Escape") { event.preventDefault(); closePalette(); }
    });
  };
  function openPalette() {
    if (paletteOpen) return;
    buildPalette();
    paletteRestore = document.activeElement;
    allCommands = collectCommands();
    if (paletteInput) paletteInput.value = "";
    filterCommands();
    palette.setAttribute("data-open", "");
    body.classList.add("hud-locked");
    paletteOpen = true;
    requestAnimationFrame(() => paletteInput?.focus());
  }
  function closePalette() {
    if (!palette || !paletteOpen) return;
    palette.removeAttribute("data-open");
    body.classList.remove("hud-locked");
    paletteOpen = false;
    if (paletteRestore && typeof paletteRestore.focus === "function") paletteRestore.focus();
  }
  document.querySelector("[data-command-open]")?.addEventListener("click", () => (paletteOpen ? closePalette() : openPalette()));
  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const tag = document.activeElement?.tagName || "";
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);
    if ((event.ctrlKey || event.metaKey) && key === "k") { event.preventDefault(); if (paletteOpen) closePalette(); else openPalette(); }
    else if (key === "/" && !typing && !paletteOpen) { event.preventDefault(); openPalette(); }
  });
})();
