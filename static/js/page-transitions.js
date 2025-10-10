// ===================================
// SMOOTH PAGE TRANSITIONS
// ===================================

(function() {
  'use strict';
  
  // Create transition overlay
  const createTransitionOverlay = () => {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      z-index: 99999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.5s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Add loading spinner
    const spinner = document.createElement('div');
    spinner.className = 'transition-spinner';
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;
    
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    
    return overlay;
  };
  
  const overlay = createTransitionOverlay();
  
  // Add spinner animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  // Page enter animation
  const pageEnter = () => {
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    
    setTimeout(() => {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }, 500);
  };
  
  // Page exit animation
  const pageExit = (callback) => {
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';
    
    setTimeout(() => {
      if (callback) callback();
    }, 500);
  };
  
  // Intercept navigation clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    
    if (link && 
        link.href && 
        link.href.startsWith(window.location.origin) &&
        !link.hasAttribute('target') &&
        !link.hasAttribute('download') &&
        !link.href.includes('#')) {
      
      e.preventDefault();
      
      pageExit(() => {
        window.location.href = link.href;
      });
    }
  });
  
  // Run enter animation on page load
  window.addEventListener('load', pageEnter);
  
  // Handle back/forward navigation
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      pageEnter();
    }
  });
  
  console.log('🎬 Page transitions initialized!');
  
})();
