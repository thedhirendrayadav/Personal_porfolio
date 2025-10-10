// ===================================
// GLOBAL MOUSE INTERACTIONS
// Enhanced mouse movement effects for all pages
// ===================================

(function() {
  'use strict';
  
  // ===================================
  // GLOBAL MOUSE TRACKING
  // ===================================
  
  let mouseX = 0;
  let mouseY = 0;
  let isMouseMoving = false;
  let mouseTimeout;
  
  // Enhanced smooth mouse tracking with improved performance
  let ticking = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseVelocityX = 0;
  let mouseVelocityY = 0;
  let smoothMouseX = 0;
  let smoothMouseY = 0;
  
  function updateMousePosition(e) {
    if (!ticking) {
      requestAnimationFrame(() => {
        // Calculate velocity for enhanced effects
        mouseVelocityX = e.clientX - lastMouseX;
        mouseVelocityY = e.clientY - lastMouseY;
        
        // Smooth interpolation for fluid movement - more gentle
        const smoothFactor = 0.08; // Reduced from 0.15 to 0.08
        smoothMouseX += (e.clientX - smoothMouseX) * smoothFactor;
        smoothMouseY += (e.clientY - smoothMouseY) * smoothFactor;
        
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMouseMoving = true;
        
        // Store last position for velocity calculation
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        
        // Clear existing timeout
        clearTimeout(mouseTimeout);
        
        // Set mouse as not moving after 150ms of inactivity
        mouseTimeout = setTimeout(() => {
          isMouseMoving = false;
          mouseVelocityX = 0;
          mouseVelocityY = 0;
        }, 150);
        
        // Update CSS custom properties for global use
        document.documentElement.style.setProperty('--mouse-x', mouseX + 'px');
        document.documentElement.style.setProperty('--mouse-y', mouseY + 'px');
        document.documentElement.style.setProperty('--smooth-mouse-x', smoothMouseX + 'px');
        document.documentElement.style.setProperty('--smooth-mouse-y', smoothMouseY + 'px');
        document.documentElement.style.setProperty('--mouse-x-percent', (mouseX / window.innerWidth * 100) + '%');
        document.documentElement.style.setProperty('--mouse-y-percent', (mouseY / window.innerHeight * 100) + '%');
        document.documentElement.style.setProperty('--mouse-velocity-x', mouseVelocityX + 'px');
        document.documentElement.style.setProperty('--mouse-velocity-y', mouseVelocityY + 'px');
        
        // Trigger enhanced custom mouse move event
        document.dispatchEvent(new CustomEvent('globalMouseMove', {
          detail: { 
            x: mouseX, 
            y: mouseY, 
            smoothX: smoothMouseX,
            smoothY: smoothMouseY,
            velocityX: mouseVelocityX,
            velocityY: mouseVelocityY,
            isMoving: isMouseMoving 
          }
        }));
        
        ticking = false;
      });
      ticking = true;
    }
  }
  
  // ===================================
  // ENHANCED CURSOR EFFECTS
  // ===================================
  
  function createEnhancedCursor() {
    // Create custom cursor elements with trail
    const cursor = document.createElement('div');
    cursor.className = 'enhanced-cursor';
    cursor.innerHTML = `
      <div class="cursor-dot"></div>
      <div class="cursor-ring"></div>
      <div class="cursor-trail"></div>
    `;
    
    document.body.appendChild(cursor);
    
    // Create mouse trail system - reduced
    const trailElements = [];
    const trailLength = 4; // Reduced from 8 to 4
    
    for (let i = 0; i < trailLength; i++) {
      const trailDot = document.createElement('div');
      trailDot.className = 'cursor-trail-dot';
      trailDot.style.cssText = `
        position: fixed;
        width: ${8 - i}px;
        height: ${8 - i}px;
        background: rgba(99, 102, 241, ${0.4 - i * 0.1}); // Reduced opacity
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        transition: all 0.1s ease;
        opacity: 0;
      `;
      document.body.appendChild(trailDot);
      trailElements.push({
        element: trailDot,
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0
      });
    }
    
    let cursorX = 0;
    let cursorY = 0;
    
    // Enhanced cursor position update with smooth interpolation
    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      
      // Update trail targets
      trailElements[0].targetX = cursorX;
      trailElements[0].targetY = cursorY;
      
      for (let i = 1; i < trailElements.length; i++) {
        trailElements[i].targetX = trailElements[i - 1].x;
        trailElements[i].targetY = trailElements[i - 1].y;
      }
    });
    
    // Animate trail with smooth following
    function animateTrail() {
      trailElements.forEach((trail, index) => {
        const speed = 0.2 - index * 0.02;
        trail.x += (trail.targetX - trail.x) * speed;
        trail.y += (trail.targetY - trail.y) * speed;
        
        trail.element.style.left = trail.x + 'px';
        trail.element.style.top = trail.y + 'px';
        trail.element.style.opacity = isMouseMoving ? 1 : 0;
      });
      
      requestAnimationFrame(animateTrail);
    }
    animateTrail();
    
    // Enhanced cursor interactions
    const interactiveElements = 'a, button, input, textarea, [data-cursor="pointer"], .btn, .social-link, .contact-icon-float, .skill-icon, .project-card-minimal, .category-card-minimal';
    
    document.addEventListener('mouseover', (e) => {
      if (e.target.matches(interactiveElements)) {
        cursor.classList.add('cursor-hover');
        e.target.classList.add('cursor-hovered');
        
        // Change trail color based on element type
        const elementType = e.target.classList.contains('btn') ? 'button' :
                           e.target.classList.contains('social-link') ? 'social' :
                           e.target.tagName.toLowerCase() === 'a' ? 'link' : 'default';
        
        cursor.setAttribute('data-hover-type', elementType);
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      if (e.target.matches(interactiveElements)) {
        cursor.classList.remove('cursor-hover');
        e.target.classList.remove('cursor-hovered');
        cursor.removeAttribute('data-hover-type');
      }
    });
    
    document.addEventListener('mousedown', () => {
      cursor.classList.add('cursor-click');
      // Create click ripple effect
      createCursorRipple(cursorX, cursorY);
    });
    
    document.addEventListener('mouseup', () => {
      cursor.classList.remove('cursor-click');
    });
    
    // Text selection cursor
    document.addEventListener('selectstart', () => {
      cursor.classList.add('cursor-text');
    });
    
    document.addEventListener('selectionchange', () => {
      if (window.getSelection().toString() === '') {
        cursor.classList.remove('cursor-text');
      }
    });
  }
  
  function createCursorRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'cursor-click-ripple';
    ripple.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: cursorRipple 0.6s ease-out;
      transform: translate(-50%, -50%);
    `;
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
  
  // ===================================
  // ENHANCED FLOATING ELEMENTS INTERACTIONS
  // ===================================
  
  function enhanceFloatingElements() {
    // DISABLED - Floating elements interaction completely disabled for now
    console.log('Floating elements interaction disabled for performance');
    return;
  }
  
  // ===================================
  // PARALLAX EFFECTS
  // ===================================
  
  function createParallaxEffects() {
    // DISABLED - Parallax effects completely disabled for now
    console.log('Parallax effects disabled for performance');
    return;
  }
  
  // ===================================
  // ENHANCED MAGNETIC EFFECTS
  // ===================================
  
  function createMagneticEffects() {
    // DISABLED - Magnetic effects completely disabled for now
    console.log('Magnetic effects disabled for performance');
    return;
  }
      
      element.addEventListener('mouseenter', () => {
        element.classList.add('magnetic-active');
        isActive = true;
      });
      
      element.addEventListener('mouseleave', () => {
        element.classList.remove('magnetic-active');
        isActive = false;
        
        // Smooth return to original position
        element.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        element.style.transform = '';
        
        setTimeout(() => {
          element.style.transition = '';
        }, 400);
      });
      
      element.addEventListener('mousemove', (e) => {
        if (isActive) {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const deltaX = e.clientX - centerX;
          const deltaY = e.clientY - centerY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          // Enhanced magnetic effect with distance-based strength
          const influence = Math.max(0, 1 - distance / magneticRadius);
          const adjustedStrength = magneticStrength * influence;
          
          const moveX = deltaX * adjustedStrength;
          const moveY = deltaY * adjustedStrength;
          
          // Add rotation based on movement direction
          const rotation = (deltaX * 0.05) * influence;
          
          // Enhanced scale effect
          const scale = 1 + (influence * 0.08);
          
          element.style.transition = 'none';
          element.style.transform = `translate(${moveX}px, ${moveY}px) scale(${scale}) rotate(${rotation}deg)`;
          
          // Add subtle shadow effect
          const shadowIntensity = influence * 20;
          element.style.boxShadow = `0 ${shadowIntensity}px ${shadowIntensity * 2}px rgba(99, 102, 241, ${influence * 0.3})`;
        }
      });
    });
  }
  
  // ===================================
  // RIPPLE EFFECTS
  // ===================================
  
  function createRippleEffects() {
    const rippleElements = document.querySelectorAll('[data-ripple], .btn, .social-link, .contact-icon-float, .skill-icon');
    
    rippleElements.forEach(element => {
      element.addEventListener('click', (e) => {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'global-ripple';
        
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          animation: globalRipple 0.6s ease-out;
          z-index: 1000;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }
  
  // ===================================
  // ENHANCED 3D TILT EFFECTS
  // ===================================
  
  function createTiltEffects() {
    // DISABLED - Tilt effects completely disabled for now
    console.log('Tilt effects disabled for performance');
    return;
  }
      
      element.addEventListener('mouseenter', () => {
        element.style.transformStyle = 'preserve-3d';
        element.style.transition = 'transform 0.1s ease-out';
        isHovering = true;
      });
      
      element.addEventListener('mouseleave', () => {
        isHovering = false;
        element.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        element.style.transform = '';
        
        setTimeout(() => {
          if (!isHovering) {
            element.style.transition = '';
          }
        }, 600);
      });
      
      element.addEventListener('mousemove', (e) => {
        if (isHovering) {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const deltaX = e.clientX - centerX;
          const deltaY = e.clientY - centerY;
          
          // Normalize to -1 to 1 range
          const normalizedX = deltaX / (rect.width / 2);
          const normalizedY = deltaY / (rect.height / 2);
          
          // Calculate rotation with enhanced smoothness
          const rotateX = normalizedY * -tiltStrength;
          const rotateY = normalizedX * tiltStrength;
          
          // Add subtle Z-axis rotation for more dynamic effect
          const rotateZ = (normalizedX * normalizedY) * 2;
          
          // Enhanced perspective and scale
          const perspective = 1000 + Math.abs(normalizedX * normalizedY) * 500;
          
          element.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale3d(${tiltScale}, ${tiltScale}, ${tiltScale})`;
          
          // Add dynamic lighting effect
          const lightIntensity = Math.abs(normalizedX) + Math.abs(normalizedY);
          const lightX = normalizedX * 50 + 50;
          const lightY = normalizedY * 50 + 50;
          
          element.style.background = element.style.background || '';
          if (element.classList.contains('project-card-minimal') || element.classList.contains('stat-card-enhanced')) {
            element.style.setProperty('--light-x', `${lightX}%`);
            element.style.setProperty('--light-y', `${lightY}%`);
            element.style.setProperty('--light-intensity', lightIntensity * 0.1);
          }
        }
      });
    });
  }
  
  // ===================================
  // ENHANCED GLOW EFFECTS
  // ===================================
  
  function createGlowEffects() {
    document.addEventListener('globalMouseMove', (e) => {
      const { x, y, velocityX, velocityY } = e.detail;
      
      // Update glow position for elements with data-glow
      const glowElements = document.querySelectorAll('[data-glow]');
      glowElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const relativeX = x - rect.left;
        const relativeY = y - rect.top;
        
        // Calculate distance from center for intensity
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const distance = Math.sqrt(Math.pow(relativeX - centerX, 2) + Math.pow(relativeY - centerY, 2));
        const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
        const intensity = Math.max(0, 1 - distance / maxDistance);
        
        element.style.setProperty('--glow-x', relativeX + 'px');
        element.style.setProperty('--glow-y', relativeY + 'px');
        element.style.setProperty('--glow-intensity', intensity);
        element.style.setProperty('--glow-velocity', Math.abs(velocityX) + Math.abs(velocityY));
      });
    });
  }
  
  // ===================================
  // MOUSE PARTICLE SYSTEM
  // ===================================
  
  function createMouseParticleSystem() {
    // DISABLED - Mouse particle system completely disabled for now
    console.log('Mouse particle system disabled for performance');
    return;
  }
    
    function createParticle(x, y, velocityX, velocityY) {
      const particle = document.createElement('div');
      particle.className = 'mouse-particle';
      particle.id = `particle-${particleId++}`;
      
      const size = Math.random() * 4 + 2;
      const life = Math.random() * 1000 + 500;
      const hue = Math.random() * 60 + 220; // Blue to purple range
      
      particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: hsl(${hue}, 70%, 60%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        opacity: 0.8;
        transform: translate(-50%, -50%);
        animation: particleFloat ${life}ms ease-out forwards;
        box-shadow: 0 0 ${size * 2}px hsl(${hue}, 70%, 60%);
      `;
      
      document.body.appendChild(particle);
      
      particles.push({
        element: particle,
        x: x,
        y: y,
        vx: velocityX * 0.1 + (Math.random() - 0.5) * 2,
        vy: velocityY * 0.1 + (Math.random() - 0.5) * 2,
        life: life,
        maxLife: life
      });
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
        const index = particles.findIndex(p => p.element === particle);
        if (index > -1) {
          particles.splice(index, 1);
        }
      }, life);
    }
    
    let lastParticleTime = 0;
    document.addEventListener('globalMouseMove', (e) => {
      const { x, y, velocityX, velocityY, isMoving } = e.detail;
      const now = Date.now();
      
      // Create particles based on mouse speed and movement - much less frequent
      const speed = Math.abs(velocityX) + Math.abs(velocityY);
      if (isMoving && speed > 15 && now - lastParticleTime > 200 && particles.length < maxParticles) { // Increased speed threshold and time delay
        createParticle(x, y, velocityX, velocityY);
        lastParticleTime = now;
      }
    });
    
    // Animate existing particles
    function animateParticles() {
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98; // Friction
        particle.vy *= 0.98;
        particle.life -= 16; // Assuming 60fps
        
        const opacity = particle.life / particle.maxLife;
        particle.element.style.left = particle.x + 'px';
        particle.element.style.top = particle.y + 'px';
        particle.element.style.opacity = opacity * 0.8;
      });
      
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }
  
  // ===================================
  // GENTLE LOGO INTERACTION
  // ===================================
  
  function createGentleLogoInteraction() {
    const logoContainer = document.querySelector('.logo-3d-container');
    const logoCube = document.querySelector('.logo-3d-cube');
    
    if (logoContainer && logoCube) {
      document.addEventListener('globalMouseMove', (e) => {
        const { smoothX, smoothY } = e.detail;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Very gentle movement - much slower than other elements
        const moveX = (smoothX - centerX) * 0.02; // Very small multiplier
        const moveY = (smoothY - centerY) * 0.02;
        
        // Apply gentle transform
        logoCube.style.transform = `translate(${moveX}px, ${moveY}px) rotateY(${moveX * 0.1}deg) rotateX(${-moveY * 0.1}deg)`;
      });
    }
  }
  
  // ===================================
  // GENTLE LOGO INTERACTION
  // ===================================
  
  function createGentleLogoInteraction() {
    const logoContainer = document.querySelector('.logo-3d-container');
    const logoCube = document.querySelector('.logo-3d-cube');
    
    if (logoContainer && logoCube) {
      // Disable any existing transforms first
      logoCube.style.transform = '';
      
      document.addEventListener('globalMouseMove', (e) => {
        const { smoothX, smoothY } = e.detail;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Very gentle movement - extremely small multiplier
        const moveX = (smoothX - centerX) * 0.008; // Reduced from 0.02 to 0.008
        const moveY = (smoothY - centerY) * 0.008;
        
        // Apply very gentle transform with minimal rotation
        logoCube.style.transform = `translate(${moveX}px, ${moveY}px) rotateY(${moveX * 0.05}deg) rotateX(${-moveY * 0.05}deg)`;
      });
    }
  }
  
  // ===================================
  // INITIALIZATION
  // ===================================
  
  function init() {
    // Add global mouse tracking - MINIMAL VERSION
    document.addEventListener('mousemove', updateMousePosition);
    
    // MOST EFFECTS DISABLED FOR PERFORMANCE
    // createEnhancedCursor(); // DISABLED
    // enhanceFloatingElements(); // DISABLED
    // createParallaxEffects(); // DISABLED
    // createMagneticEffects(); // DISABLED
    // createRippleEffects(); // DISABLED
    // createTiltEffects(); // DISABLED
    // createGlowEffects(); // DISABLED
    // createMouseParticleSystem(); // DISABLED
    // createGentleLogoInteraction(); // DISABLED
    
    // Only keep essential functions
    enhanceFloatingElements(); // Already disabled inside function
    createMagneticEffects(); // Already disabled inside function
    createTiltEffects(); // Already disabled inside function
    createParallaxEffects(); // Already disabled inside function
    createMouseParticleSystem(); // Already disabled inside function
    
    // Add minimal styles
    addGlobalStyles();
    
    console.log('🎯 Global mouse interactions initialized (MINIMAL MODE)!');
  }
  
  function addGlobalStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced Cursor */
      .enhanced-cursor {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      .cursor-dot {
        width: 8px;
        height: 8px;
        background: #6366f1;
        border-radius: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
        transition: all 0.15s ease;
        box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
      }
      
      .cursor-ring {
        width: 32px;
        height: 32px;
        border: 2px solid rgba(99, 102, 241, 0.5);
        border-radius: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        animation: cursorPulse 2s ease-in-out infinite;
      }
      
      @keyframes cursorPulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
      }
      
      .enhanced-cursor.cursor-hover .cursor-ring {
        width: 56px;
        height: 56px;
        border-color: #f59e0b;
        border-width: 3px;
        animation: cursorHoverPulse 1s ease-in-out infinite;
      }
      
      @keyframes cursorHoverPulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.2); }
      }
      
      .enhanced-cursor.cursor-hover .cursor-dot {
        width: 12px;
        height: 12px;
        background: #f59e0b;
        box-shadow: 0 0 15px rgba(245, 158, 11, 0.7);
      }
      
      .enhanced-cursor.cursor-click .cursor-dot {
        transform: translate(-50%, -50%) scale(2);
        background: #ef4444;
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
      }
      
      .enhanced-cursor.cursor-click .cursor-ring {
        transform: translate(-50%, -50%) scale(0.8);
        border-color: #ef4444;
      }
      
      .enhanced-cursor.cursor-text .cursor-ring {
        border-radius: 4px;
        width: 2px;
        height: 24px;
        border: none;
        background: #6366f1;
      }
      
      /* Hover type variations */
      .enhanced-cursor[data-hover-type="button"] .cursor-ring {
        border-color: #10b981;
      }
      
      .enhanced-cursor[data-hover-type="social"] .cursor-ring {
        border-color: #8b5cf6;
      }
      
      .enhanced-cursor[data-hover-type="link"] .cursor-ring {
        border-color: #06b6d4;
      }
      
      /* Global Ripple Animation */
      @keyframes globalRipple {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
      
      @keyframes cursorRipple {
        to {
          width: 100px;
          height: 100px;
          opacity: 0;
        }
      }
      
      /* Magnetic Effects */
      .magnetic-active {
        transition: transform 0.2s ease !important;
      }
      
      /* Cursor Hovered Elements */
      .cursor-hovered {
        transform: scale(1.05) !important;
        transition: transform 0.2s ease !important;
      }
      
      /* Enhanced Glow Effects */
      [data-glow] {
        position: relative;
        overflow: hidden;
      }
      
      [data-glow]::before {
        content: '';
        position: absolute;
        top: var(--glow-y, 50%);
        left: var(--glow-x, 50%);
        width: calc(200px + var(--glow-velocity, 0) * 2px);
        height: calc(200px + var(--glow-velocity, 0) * 2px);
        background: radial-gradient(circle, 
          rgba(99, 102, 241, calc(var(--glow-intensity, 0) * 0.2)) 0%, 
          rgba(99, 102, 241, calc(var(--glow-intensity, 0) * 0.1)) 30%,
          transparent 70%);
        transform: translate(-50%, -50%);
        pointer-events: none;
        opacity: 0;
        transition: all 0.2s ease;
        filter: blur(calc(var(--glow-velocity, 0) * 0.1px));
      }
      
      [data-glow]:hover::before {
        opacity: 1;
      }
      
      /* Enhanced glow for specific elements */
      .btn[data-glow]::before {
        background: radial-gradient(circle, 
          rgba(16, 185, 129, calc(var(--glow-intensity, 0) * 0.3)) 0%, 
          transparent 70%);
      }
      
      .social-link[data-glow]::before {
        background: radial-gradient(circle, 
          rgba(139, 92, 246, calc(var(--glow-intensity, 0) * 0.3)) 0%, 
          transparent 70%);
      }
      
      /* Parallax Elements */
      [data-parallax] {
        transition: transform 0.1s ease-out;
      }
      
      /* Hide default cursor on interactive elements */
      body.enhanced-cursor-active {
        cursor: none;
      }
      
      body.enhanced-cursor-active * {
        cursor: none !important;
      }
      
      /* Enhanced lighting effects for tilt elements */
      .project-card-minimal, .stat-card-enhanced {
        position: relative;
        overflow: hidden;
      }
      
      .project-card-minimal::before, .stat-card-enhanced::before {
        content: '';
        position: absolute;
        top: var(--light-y, 50%);
        left: var(--light-x, 50%);
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(99, 102, 241, var(--light-intensity, 0)) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        pointer-events: none;
        transition: all 0.1s ease;
        z-index: 1;
      }
      
      .project-card-minimal > *, .stat-card-enhanced > * {
        position: relative;
        z-index: 2;
      }
      
      /* Smooth transitions for all interactive elements */
      .btn, .social-link, .contact-icon-float, .skill-icon, 
      .resume-card-enhanced, .contact-display-screen, .form-container-enhanced {
        transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease !important;
      }
      
      /* Mouse particle animations */
      @keyframes particleFloat {
        0% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.8;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.2);
          opacity: 0.6;
        }
        100% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
        }
      }
      
      .mouse-particle {
        will-change: transform, opacity;
      }
      
      /* Performance optimizations */
      .floating-orb, .particle, .floating-sphere, .message-line, .line {
        will-change: transform, opacity;
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .enhanced-cursor,
        .cursor-dot,
        .cursor-ring,
        [data-parallax],
        .magnetic-active {
          transition: none !important;
          animation: none !important;
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Enable enhanced cursor
  document.body.classList.add('enhanced-cursor-active');
  
})();