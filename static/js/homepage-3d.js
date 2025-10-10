/**
 * Modern 3D Homepage Effects
 * Enhanced shuttle-inspired animations and interactions
 */

(function() {
  'use strict';
  
  // ===================================
  // ENHANCED 3D SPACE BACKGROUND
  // ===================================
  
  function init3DBackground() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded. 3D background disabled.');
      return;
    }
    
    const canvas = document.getElementById('space-scene');
    if (!canvas) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Particle system
    const particleCount = 2000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorPalette = [
      new THREE.Color(0x6366F1), // Primary blue
      new THREE.Color(0x14B8A6), // Teal
      new THREE.Color(0x8B5CF6), // Purple
      new THREE.Color(0xF59E0B)   // Amber
    ];
    
    for (let i = 0; i < particleCount; i++) {
      // Positions
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      // Colors
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Sizes
      sizes[i] = Math.random() * 3 + 1;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Particle material
    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
    
    // Floating geometric shapes
    const geometries = [
      new THREE.TetrahedronGeometry(0.5),
      new THREE.OctahedronGeometry(0.3),
      new THREE.IcosahedronGeometry(0.4)
    ];
    
    const shapeMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366F1,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    });
    
    const shapes = [];
    for (let i = 0; i < 20; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const shape = new THREE.Mesh(geometry, shapeMaterial);
      
      shape.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      );
      
      shape.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      shapes.push(shape);
      scene.add(shape);
    }
    
    camera.position.z = 30;
    
    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Rotate particle system
      particleSystem.rotation.x += 0.0005;
      particleSystem.rotation.y += 0.001;
      
      // Animate shapes
      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.01 + index * 0.001;
        shape.rotation.y += 0.005 + index * 0.0005;
        
        // Floating motion
        shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
      });
      
      // Mouse interaction
      camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  // ===================================
  // INTERACTIVE 3D LOGO
  // ===================================
  
  function init3DLogo() {
    const logoContainer = document.querySelector('.logo-3d-container');
    if (!logoContainer) return;
    
    // Disabled aggressive logo interaction - using gentle interaction from global-mouse-interactions.js instead
    console.log('3D Logo interaction disabled - using gentle interaction instead');
  }
  
  // ===================================
  // MAGNETIC BUTTON EFFECTS
  // ===================================
  
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-modern');
    
    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = Math.max(rect.width, rect.height) / 2;
        
        if (distance < maxDistance) {
          const strength = (maxDistance - distance) / maxDistance;
          button.style.transform = `translate(${x * strength * 0.3}px, ${y * strength * 0.3}px) scale(1.05)`;
        }
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = '';
      });
    });
  }
  
  // ===================================
  // ENHANCED SOCIAL LINKS
  // ===================================
  
  function initSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link-modern');
    
    socialLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
          z-index: 0;
        `;
        
        link.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
    
    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to {
          width: 100px;
          height: 100px;
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // ===================================
  // SCROLL-TRIGGERED ANIMATIONS
  // ===================================
  
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.stat-item, .social-link-modern');
    animatedElements.forEach(el => observer.observe(el));
  }
  
  // ===================================
  // PARALLAX EFFECTS
  // ===================================
  
  function initParallaxEffects() {
    const shuttleElements = document.querySelectorAll('.shuttle-ring, .orbital-path');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      shuttleElements.forEach((element, index) => {
        const speed = (index + 1) * 0.1;
        element.style.transform = `translateY(${rate * speed}px)`;
      });
    });
  }
  
  // ===================================
  // PERFORMANCE OPTIMIZATION
  // ===================================
  
  function optimizePerformance() {
    // Reduce animations on low-end devices
    const isLowEndDevice = navigator.hardwareConcurrency < 4 || 
                          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isLowEndDevice) {
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
      
      // Disable heavy 3D effects
      const heavyElements = document.querySelectorAll('.logo-3d-cube, .shuttle-ring');
      heavyElements.forEach(el => {
        el.style.animation = 'none';
      });
    }
    
    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', () => {
      const animatedElements = document.querySelectorAll('[style*="animation"]');
      animatedElements.forEach(el => {
        el.style.animationPlayState = document.hidden ? 'paused' : 'running';
      });
    });
  }
  
  // ===================================
  // UTILITY FUNCTIONS
  // ===================================
  
  function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  
  // Make scrollToSection globally available
  window.scrollToSection = scrollToSection;
  
  // ===================================
  // INITIALIZATION
  // ===================================
  
  function init() {
    console.log('🚀 Initializing modern homepage...');
    
    init3DBackground();
    init3DLogo();
    initMagneticButtons();
    initSocialLinks();
    initScrollAnimations();
    initParallaxEffects();
    optimizePerformance();
    
    console.log('✨ Modern homepage initialized!');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();