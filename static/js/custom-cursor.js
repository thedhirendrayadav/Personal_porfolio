// ===================================
// CUSTOM 3D CURSOR EFFECT
// ===================================

(function() {
  'use strict';
  
  // Check if device supports hover (not touch device)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (isTouchDevice) {
    console.log('Touch device detected. Custom cursor disabled.');
    return;
  }
  
  // Create cursor elements
  const createCursor = () => {
    // Main cursor
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border: 2px solid #667eea;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: all 0.1s ease;
      transform: translate(-50%, -50%);
      mix-blend-mode: difference;
    `;
    
    // Cursor follower
    const cursorFollower = document.createElement('div');
    cursorFollower.className = 'custom-cursor-follower';
    cursorFollower.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      background: rgba(102, 126, 234, 0.2);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transition: all 0.3s ease;
      transform: translate(-50%, -50%);
    `;
    
    document.body.appendChild(cursor);
    document.body.appendChild(cursorFollower);
    
    return { cursor, cursorFollower };
  };
  
  const { cursor, cursorFollower } = createCursor();
  
  // Track mouse position
  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });
  
  // Smooth follower animation
  const animateFollower = () => {
    const distX = mouseX - followerX;
    const distY = mouseY - followerY;
    
    followerX += distX * 0.1;
    followerY += distY * 0.1;
    
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top = followerY + 'px';
    
    requestAnimationFrame(animateFollower);
  };
  
  animateFollower();
  
  // Hover effects on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, input, textarea, select, [role="button"]');
  
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      cursor.style.width = '40px';
      cursor.style.height = '40px';
      cursor.style.borderColor = '#764ba2';
      cursor.style.backgroundColor = 'rgba(118, 75, 162, 0.1)';
      cursorFollower.style.width = '60px';
      cursorFollower.style.height = '60px';
      cursorFollower.style.backgroundColor = 'rgba(118, 75, 162, 0.3)';
    });
    
    element.addEventListener('mouseleave', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      cursor.style.borderColor = '#667eea';
      cursor.style.backgroundColor = 'transparent';
      cursorFollower.style.width = '40px';
      cursorFollower.style.height = '40px';
      cursorFollower.style.backgroundColor = 'rgba(102, 126, 234, 0.2)';
    });
  });
  
  // Click effect
  document.addEventListener('mousedown', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    cursorFollower.style.transform = 'translate(-50%, -50%) scale(0.9)';
  });
  
  document.addEventListener('mouseup', () => {
    cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
  });
  
  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorFollower.style.opacity = '0';
  });
  
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorFollower.style.opacity = '1';
  });
  
  // Hide default cursor
  const style = document.createElement('style');
  style.textContent = `
    * {
      cursor: none !important;
    }
    a, button, input, textarea, select, [role="button"] {
      cursor: none !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log('🖱️ Custom cursor initialized!');
  
})();
