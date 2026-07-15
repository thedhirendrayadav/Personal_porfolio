(() => {
  "use strict";

  const root = document.documentElement;
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

  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
  document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    localStorage.setItem("portfolio-theme", next);
  });

  const accents = ["aqua", "lime", "coral"];
  const accentToggle = document.querySelector("[data-accent-toggle]");
  const applyAccent = (accent) => {
    root.dataset.accent = accent;
    accentToggle?.setAttribute("aria-label", `Cycle site accent colour. Current: ${accent}.`);
  };
  const savedAccent = localStorage.getItem("portfolio-accent");
  applyAccent(accents.includes(savedAccent) ? savedAccent : "aqua");
  accentToggle?.addEventListener("click", () => {
    const current = root.dataset.accent || "aqua";
    const next = accents[(accents.indexOf(current) + 1) % accents.length];
    applyAccent(next);
    localStorage.setItem("portfolio-accent", next);
  });

  const progressBar = document.querySelector("[data-scroll-progress]");
  const progressValue = document.querySelector("[data-scroll-value]");
  let scrollFrame = 0;
  const updateScroll = () => {
    scrollFrame = 0;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / max));
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    if (progressValue) progressValue.textContent = `SCRL ${progress.toFixed(2)}`;
  };
  addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  }, { passive: true });
  updateScroll();

  const sectionLabel = document.querySelector("[data-active-section]");
  const sections = [...document.querySelectorAll("[data-section]")];
  if (sectionLabel && sections.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (active) sectionLabel.textContent = active.target.dataset.section;
    }, { rootMargin: "-25% 0px -55%", threshold: [0, .2, .5] });
    sections.forEach((section) => observer.observe(section));
  }

  const revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const clock = document.querySelector("[data-local-time]");
  const updateClock = () => {
    if (!clock) return;
    clock.textContent = `${new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kathmandu",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date())} NPT`;
  };
  updateClock();
  if (clock) setInterval(updateClock, 1000);

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
    if (sectionLabel && scrollY >= start && scrollY <= start + range) {
      sectionLabel.textContent = workDeck.dataset.section || "01 — WORK";
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
