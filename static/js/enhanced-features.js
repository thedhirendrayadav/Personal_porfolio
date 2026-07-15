/**
 * Stable global UI features:
 * - Theme toggle (light/dark)
 * - Scroll progress bar
 * - Scroll-to-top button
 */
(function () {
  'use strict';

  const ICONS = {
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21 14.2A9 9 0 1 1 9.8 3a1 1 0 0 1 1.1 1.4A7 7 0 0 0 19.6 13a1 1 0 0 1 1.4 1.2Z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 17a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1ZM4.2 4.2a1 1 0 0 1 1.4 0L7 5.6A1 1 0 1 1 5.6 7L4.2 5.6a1 1 0 0 1 0-1.4Zm12.8 12.8a1 1 0 0 1 1.4 0l1.4 1.4a1 1 0 1 1-1.4 1.4L17 18.4a1 1 0 0 1 0-1.4ZM2 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm17 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1ZM5.6 17a1 1 0 0 1 1.4 0A1 1 0 0 1 7 18.4l-1.4 1.4a1 1 0 1 1-1.4-1.4L5.6 17ZM18.4 4.2a1 1 0 0 1 1.4 1.4L18.4 7A1 1 0 1 1 17 5.6l1.4-1.4Z"/></svg>',
    chevronUp: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="m12 8 6 6-1.4 1.4L12 10.8l-4.6 4.6L6 14l6-6Z"/></svg>'
  };

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
      return;
    }
    fn();
  }

  function getTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    const iconHost = document.querySelector('.theme-btn .theme-icon');
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (iconHost) {
      const isDark = theme === 'dark';
      iconHost.innerHTML = isDark ? ICONS.sun : ICONS.moon;
      iconHost.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function initThemeToggle() {
    const themeBtn = document.querySelector('.theme-btn');
    if (!themeBtn) return;

    setTheme(getTheme());

    themeBtn.addEventListener('click', function (event) {
      event.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', function (e) {
        if (!localStorage.getItem('theme')) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  function initScrollProgress() {
    let progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      document.body.appendChild(progressBar);
    }

    let ticking = false;
    const render = function () {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const width = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progressBar.style.width = Math.max(0, Math.min(100, width)) + '%';
      ticking = false;
    };

    const onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(render);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    render();
  }

  function initScrollToTop() {
    let scrollBtn = document.querySelector('.scroll-to-top');
    if (!scrollBtn) {
      scrollBtn = document.createElement('button');
      scrollBtn.className = 'scroll-to-top';
      scrollBtn.type = 'button';
      scrollBtn.setAttribute('aria-label', 'Scroll to top');
      scrollBtn.innerHTML = '<span class="scroll-top-icon">' + ICONS.chevronUp + '</span>';
      document.body.appendChild(scrollBtn);
    } else if (!scrollBtn.querySelector('.scroll-top-icon')) {
      scrollBtn.innerHTML = '<span class="scroll-top-icon">' + ICONS.chevronUp + '</span>';
    }

    const toggleVisibility = function () {
      if (window.scrollY > 320) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    scrollBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggleVisibility();
  }

  ready(function () {
    initThemeToggle();
    initScrollProgress();
    initScrollToTop();
  });
})();
