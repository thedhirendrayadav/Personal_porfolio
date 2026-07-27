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
    },
    {
      id: "space",
      label: "SPACE",
      display: '"Space Grotesk", Arial, sans-serif',
      mono: '"IBM Plex Mono", Consolas, monospace',
    },
    {
      id: "archivo",
      label: "ARCHIVO",
      display: '"Archivo", Arial, sans-serif',
      mono: '"Roboto Mono", Consolas, monospace',
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

  const applyFont = (candidate) => {
    const preset = fontPresets.find(({ id }) => id === candidate) || fontPresets[0];
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
})();
