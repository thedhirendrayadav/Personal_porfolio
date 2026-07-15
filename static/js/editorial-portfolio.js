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
