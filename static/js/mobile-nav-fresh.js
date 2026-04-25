/**
 * FRESH MOBILE NAVIGATION - CLEAN START
 * Simple, working mobile menu with no conflicts
 */

(function() {
  'use strict';

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    console.log('Initializing fresh mobile navigation...');

    // Get elements
    const btn = document.getElementById('mobileNavToggleBtn');
    const menu = document.querySelector('.mobile-nav');
    const backdrop = document.querySelector('.mobile-nav-backdrop');
    const links = document.querySelectorAll('.mobile-nav-link');

    // Check if elements exist
    if (!btn) {
      console.error('Hamburger button not found!');
      return;
    }
    if (!menu) {
      console.error('Mobile menu not found!');
      return;
    }
    if (!backdrop) {
      console.error('Backdrop not found!');
      return;
    }

    console.log('All elements found, setting up event listeners...');

    // Open menu
    function open() {
      console.log('Opening menu...');
      menu.classList.add('active');
      backdrop.classList.add('active');
      btn.classList.add('active');
      document.body.classList.add('mobile-nav-open');
      btn.setAttribute('aria-expanded', 'true');
    }

    // Close menu
    function close() {
      console.log('Closing menu...');
      menu.classList.remove('active');
      backdrop.classList.remove('active');
      btn.classList.remove('active');
      document.body.classList.remove('mobile-nav-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    // Toggle menu
    function toggle() {
      if (menu.classList.contains('active')) {
        close();
      } else {
        open();
      }
    }

    // Button click
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Button clicked!');
      toggle();
    });

    // Backdrop click
    backdrop.addEventListener('click', function() {
      console.log('Backdrop clicked!');
      close();
    });

    // Link clicks
    links.forEach(function(link) {
      link.addEventListener('click', function() {
        console.log('Link clicked!');
        close();
      });
    });

    // ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && menu.classList.contains('active')) {
        console.log('ESC pressed!');
        close();
      }
    });

    // Window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (window.innerWidth > 768 && menu.classList.contains('active')) {
          console.log('Resized to desktop, closing menu...');
          close();
        }
      }, 250);
    });

    console.log('✅ Fresh mobile navigation initialized successfully!');
  }
})();
