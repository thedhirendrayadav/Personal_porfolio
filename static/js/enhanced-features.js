/**
 * Enhanced Features for Portfolio Website
 * Includes: Dark Mode Toggle, Scroll Progress, Custom Cursor, Scroll to Top
 */

(function () {
  'use strict';

  // ===================================
  // SCROLL PROGRESS BAR
  // ===================================

  function initScrollProgress() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    // Update progress on scroll
    window.addEventListener('scroll', () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }

  // ===================================
  // DARK MODE TOGGLE
  // ===================================

  function initDarkMode() {
    const themeToggle = document.querySelector('.theme-btn');
    if (!themeToggle) {
      console.warn('Theme toggle button not found');
      return;
    }

    // Check for saved theme preference or default to light theme
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    // Apply theme immediately
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    console.log('Theme initialized:', currentTheme);

    // Toggle theme on button click
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      console.log('Switching theme from', currentTheme, 'to', newTheme);

      // Apply new theme
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);

      // Add visual feedback
      themeToggle.style.transform = 'scale(0.9)';
      setTimeout(() => {
        themeToggle.style.transform = '';
      }, 150);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
        console.log('System theme changed to:', newTheme);
      }
    });
  }

  function updateThemeIcon(theme) {
    const themeBtn = document.querySelector('.theme-btn i');
    if (!themeBtn) {
      console.warn('Theme button icon not found');
      return;
    }

    // Update icon based on theme
    if (theme === 'dark') {
      themeBtn.className = 'fas fa-sun';
      themeBtn.setAttribute('title', 'Switch to light mode');
    } else {
      themeBtn.className = 'fas fa-moon';
      themeBtn.setAttribute('title', 'Switch to dark mode');
    }
  }

  // ===================================
  // CUSTOM CURSOR
  // ===================================

  function initCustomCursor() {
    // Skip on touch devices
    if ('ontouchstart' in window) return;

    // Create cursor elements
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';

    const cursorDot = document.createElement('div');
    cursorDot.className = 'custom-cursor-dot';

    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    // Track mouse position
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let dotX = 0, dotY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth cursor animation
    function animateCursor() {
      // Cursor follows with delay
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;

      // Dot follows immediately
      dotX += (mouseX - dotX) * 0.3;
      dotY += (mouseY - dotY) * 0.3;

      cursor.style.transform = `translate(${cursorX - 10}px, ${cursorY - 10}px)`;
      cursorDot.style.transform = `translate(${dotX - 3}px, ${dotY - 3}px)`;

      requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Add hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .btn, .card, input, textarea, select');

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
      });

      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
      });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      cursorDot.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      cursorDot.style.opacity = '1';
    });
  }

  // ===================================
  // SCROLL TO TOP BUTTON
  // ===================================

  function initScrollToTop() {
    // Create button
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    document.body.appendChild(scrollBtn);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    });

    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ===================================
  // 3D TILT EFFECT FOR CARDS
  // ===================================

  function init3DTilt() {
    const tiltCards = document.querySelectorAll('.tilt-card, .card');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.setProperty('--tilt-x', `${rotateX}deg`);
        card.style.setProperty('--tilt-y', `${rotateY}deg`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  // ===================================
  // PARALLAX SCROLL EFFECTS
  // ===================================

  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;

      parallaxElements.forEach(el => {
        const speed = el.dataset.parallax || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  // ===================================
  // MAGNETIC BUTTON EFFECT
  // ===================================

  function initMagneticButtons() {
    const magneticButtons = document.querySelectorAll('.btn-primary, .cta-primary');

    magneticButtons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        button.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ===================================
  // SMOOTH REVEAL ON SCROLL
  // ===================================

  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
      observer.observe(el);
    });
  }

  // ===================================
  // PERFORMANCE OPTIMIZATION
  // ===================================

  function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    // Defer non-critical CSS
    const deferredStyles = document.querySelectorAll('link[rel="preload"][as="style"]');
    deferredStyles.forEach(link => {
      link.rel = 'stylesheet';
    });
  }

  // ===================================
  // INITIALIZE ALL FEATURES
  // ===================================

  function init() {
    console.log('🚀 Initializing enhanced features...');

    initScrollProgress();
    initDarkMode();
    initCustomCursor();
    initScrollToTop();
    init3DTilt();
    initParallax();
    initMagneticButtons();
    initScrollReveal();
    optimizePerformance();

    console.log('✨ Enhanced features initialized!');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
  // ===================================
  // SPLINE BRANDING REMOVAL
  // ===================================
  
  function initSplineBrandingRemoval() {
    console.log('🎨 Initializing Spline branding removal...');
    
    const hideSplineBranding = () => {
      // Find all Spline viewers
      const splineViewers = document.querySelectorAll('spline-viewer');
      
      splineViewers.forEach(viewer => {
        // Hide elements in shadow DOM if accessible
        try {
          const shadowRoot = viewer.shadowRoot;
          if (shadowRoot) {
            const elementsToHide = shadowRoot.querySelectorAll('div, span, a, button, p');
            elementsToHide.forEach(el => {
              if (el.textContent && (
                el.textContent.toLowerCase().includes('built with spline') ||
                el.textContent.toLowerCase().includes('spline.design') ||
                el.textContent.toLowerCase().includes('made with spline')
              )) {
                el.style.display = 'none !important';
                el.style.opacity = '0 !important';
                el.style.visibility = 'hidden !important';
                el.remove();
              }
            });
          }
        } catch (e) {
          // Shadow DOM not accessible, continue with other methods
        }
        
        // Hide elements in the main document
        const allElements = viewer.querySelectorAll('*');
        allElements.forEach(el => {
          if (el.textContent && (
            el.textContent.toLowerCase().includes('built with spline') ||
            el.textContent.toLowerCase().includes('spline.design') ||
            el.textContent.toLowerCase().includes('made with spline')
          )) {
            el.style.display = 'none !important';
            el.style.opacity = '0 !important';
            el.style.visibility = 'hidden !important';
            el.remove();
          }
        });
        
        // Hide any bottom-positioned elements that might be branding
        const bottomElements = viewer.querySelectorAll('[style*="bottom"], [style*="position: absolute"], [style*="position: fixed"]');
        bottomElements.forEach(el => {
          if (el.offsetHeight < 100 && el.offsetWidth < 300) { // Likely branding size
            el.style.display = 'none !important';
          }
        });
      });
      
      // Also check for any elements outside the viewer that might contain branding
      const allPageElements = document.querySelectorAll('*:not(script):not(style)');
      allPageElements.forEach(el => {
        if (el.textContent && el.textContent.trim() && (
          el.textContent.toLowerCase().includes('built with spline') ||
          el.textContent.toLowerCase().includes('spline.design') ||
          el.textContent.toLowerCase().includes('made with spline')
        )) {
          // Only hide if it's not part of our content
          if (!el.closest('.hero-content, .profile-content, .section-content')) {
            el.style.display = 'none !important';
            el.style.opacity = '0 !important';
            el.style.visibility = 'hidden !important';
          }
        }
      });
    };
    
    // Run immediately
    hideSplineBranding();
    
    // Run after a short delay to catch dynamically loaded content
    setTimeout(hideSplineBranding, 500);
    setTimeout(hideSplineBranding, 1000);
    setTimeout(hideSplineBranding, 2000);
    
    // Set up a mutation observer to catch dynamically added elements
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldCheck = true;
        }
      });
      
      if (shouldCheck) {
        setTimeout(hideSplineBranding, 100);
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Stop observing after 1 minute to avoid performance issues
    setTimeout(() => {
      observer.disconnect();
    }, 60000);
    
    console.log('✨ Spline branding removal initialized!');
  }
  
  // Add to initialization
  function init() {
    console.log('🚀 Initializing enhanced features...');

    initScrollProgress();
    initDarkMode();
    initCustomCursor();
    initScrollToTop();
    init3DTilt();
    initParallax();
    initMagneticButtons();
    initScrollReveal();
    optimizePerformance();
    initSplineBrandingRemoval(); // Add this line

    console.log('✨ Enhanced features initialized!');
  }