/**
 * Optimized 3D Homepage Effects
 * High-performance particle system and smooth interactions
 */

(function () {
  'use strict';

  // ===================================
  // OPTIMIZED 3D SPACE BACKGROUND
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
    // Use a slightly darker fog for depth
    scene.fog = new THREE.FogExp2(0x0F0F23, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Optimized Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false, // Disable antialias for performance on high-res screens
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    });

    // Handle pixel ratio carefully
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // --- Optimized Particle System ---
    // Use a single BufferGeometry for all stars
    const starCount = 1500; // Reduced count for performance while maintaining look
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const colorPalette = [
      new THREE.Color(0x6366F1), // Blue
      new THREE.Color(0x14B8A6), // Teal
      new THREE.Color(0x8B5CF6), // Purple
      new THREE.Color(0xFFFFFF)  // White
    ];

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 150;
      const y = (Math.random() - 0.5) * 150;
      const z = (Math.random() - 0.5) * 100;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 1.5; // Varying sizes
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader material for better performance and look than PointsMaterial
    const starMaterial = new THREE.PointsMaterial({
      size: 1.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    const starSystem = new THREE.Points(starGeo, starMaterial);
    scene.add(starSystem);

    // --- Floating Shapes (InstancedMesh for performance) ---
    // Instead of many individual meshes, use InstancedMesh if possible, 
    // but for < 20 objects, simple meshes are fine if geometry is shared.
    const shapeGeo = new THREE.IcosahedronGeometry(0.5, 0);
    const shapeMat = new THREE.MeshBasicMaterial({
      color: 0x6366F1,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });

    const shapes = [];
    const shapeCount = 15;
    for (let i = 0; i < shapeCount; i++) {
      const mesh = new THREE.Mesh(shapeGeo, shapeMat);
      mesh.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.01,
        rotSpeedY: (Math.random() - 0.5) * 0.01,
        floatSpeed: (Math.random() * 0.002) + 0.001,
        floatOffset: Math.random() * Math.PI * 2
      };
      scene.add(mesh);
      shapes.push(mesh);
    }

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Throttled event listener
    let timeout;
    document.addEventListener('mousemove', (event) => {
      if (timeout) return;
      timeout = setTimeout(() => {
        targetX = (event.clientX / window.innerWidth) * 2 - 1;
        targetY = -(event.clientY / window.innerHeight) * 2 + 1;
        timeout = null;
      }, 16); // ~60fps cap
    });

    // Animation loop
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth mouse follow
      mouseX += (targetX - mouseX) * 2 * delta;
      mouseY += (targetY - mouseY) * 2 * delta;

      // Camera movement
      camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Rotate star system slowly
      starSystem.rotation.y += 0.05 * delta;
      starSystem.rotation.z += 0.01 * delta;

      // Animate shapes
      shapes.forEach(shape => {
        shape.rotation.x += shape.userData.rotSpeedX;
        shape.rotation.y += shape.userData.rotSpeedY;
        shape.position.y += Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.02;
      });

      renderer.render(scene, camera);
    }

    animate();

    // Handle resize efficiently
    let resizeTimeout;
    window.addEventListener('resize', () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 100);
    });
  }

  // ===================================
  // CAROUSEL & UI ENHANCEMENTS
  // ===================================

  function initCarousels() {
    // Convert static grids to carousels if needed, or enhance existing ones
    // For now, we'll add a simple auto-scroll or interactive feel to the tech stack
    const techGrid = document.querySelector('.tech-grid');
    if (techGrid) {
      // Add horizontal scroll interaction
      let isDown = false;
      let startX;
      let scrollLeft;

      techGrid.addEventListener('mousedown', (e) => {
        isDown = true;
        techGrid.classList.add('active');
        startX = e.pageX - techGrid.offsetLeft;
        scrollLeft = techGrid.scrollLeft;
      });
      techGrid.addEventListener('mouseleave', () => {
        isDown = false;
        techGrid.classList.remove('active');
      });
      techGrid.addEventListener('mouseup', () => {
        isDown = false;
        techGrid.classList.remove('active');
      });
      techGrid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - techGrid.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        techGrid.scrollLeft = scrollLeft - walk;
      });
    }
  }

  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-modern, .social-link-modern');
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ===================================
  // INITIALIZATION
  // ===================================

  function init() {
    console.log('🚀 Initializing optimized homepage...');
    init3DBackground();
    initCarousels();
    initProjectsCarousel(); // Add new carousel initialization
    initMagneticButtons();

    // Global scroll to section
    window.scrollToSection = (id) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
  }

  // ===================================
  // PROJECT CAROUSEL LOGIC
  // ===================================
  function initProjectsCarousel() {
    const track = document.querySelector('.projects-carousel');
    if (!track) return;

    const items = Array.from(track.querySelectorAll('.carousel-item'));
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    if (items.length === 0) return;

    // Clear existing dots if any
    if (dotsContainer) dotsContainer.innerHTML = '';

    // Create dots
    if (dotsContainer) {
      items.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => moveToSlide(index));
        dotsContainer.appendChild(dot);
      });
    }

    const dots = dotsContainer ? Array.from(dotsContainer.children) : [];
    let currentIndex = 0;
    
    // Calculate dimensions
    const updateDimensions = () => {
      const itemRect = items[0].getBoundingClientRect();
      // Use computed style for accurate gap
      const gap = parseFloat(window.getComputedStyle(track).gap) || 32;
      return { itemWidth: itemRect.width, gap };
    };

    // Move to slide
    const moveToSlide = (index) => {
      if (index < 0) index = items.length - 1;
      if (index >= items.length) index = 0;
      
      const { itemWidth, gap } = updateDimensions();
      const moveAmount = index * (itemWidth + gap);
      
      // Ensure we don't scroll past the end (though flex prevents empty space often, centered alignment logic is safer)
      track.style.transform = `translateX(-${moveAmount}px)`;
      
      if (dots.length > 0) {
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index]?.classList.add('active');
      }
      
      currentIndex = index;
    };

    // Event Listeners
    if (nextBtn) nextBtn.addEventListener('click', () => moveToSlide(currentIndex + 1));
    if (prevBtn) prevBtn.addEventListener('click', () => moveToSlide(currentIndex - 1));

    // Touch / Drag Support
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let startX = 0;

    track.addEventListener('mousedown', touchStart);
    track.addEventListener('touchstart', touchStart, { passive: true });

    track.addEventListener('mouseup', touchEnd);
    track.addEventListener('mouseleave', () => {
      if (isDragging) touchEnd();
    });
    track.addEventListener('touchend', touchEnd);

    track.addEventListener('mousemove', touchMove);
    track.addEventListener('touchmove', touchMove, { passive: true });

    function touchStart(event) {
      isDragging = true;
      startX = getPositionX(event);
      // Get current transform value
      const style = window.getComputedStyle(track);
      const matrix = new DOMMatrix(style.transform);
      prevTranslate = matrix.m41;
      
      track.style.cursor = 'grabbing';
      track.style.transition = 'none'; // Disable transition during drag
    }

    function touchEnd() {
      isDragging = false;
      track.style.cursor = 'grab';
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      
      const movedBy = currentTranslate - startX;
      
      // Determine direction and threshold
      const { itemWidth } = updateDimensions();
      
      // Snap to nearest slide
      if (Math.abs(movedBy) > 50) { // Threshold of 50px
          if (movedBy < 0) {
             currentIndex += 1;
          } else {
             currentIndex -= 1;
          }
      }
      
      moveToSlide(currentIndex);
    }

    function touchMove(event) {
      if (!isDragging) return;
      const currentPosition = getPositionX(event);
      const diff = currentPosition - startX;
      currentTranslate = diff;
      // Visual feedback during drag could be added here, but snapping is simpler
      // track.style.transform = `translateX(${prevTranslate + diff}px)`;
    }

    function getPositionX(event) {
      return event.type.includes('mouse') ? event.pageX : event.changedTouches[0].clientX;
    }
    
    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        moveToSlide(currentIndex);
      }, 100);
    });
    
    // Auto-play (Optional, slow rotation)
    let autoPlayInterval = setInterval(() => {
        if (!isDragging) moveToSlide(currentIndex + 1);
    }, 5000);
    
    track.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    track.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(() => {
             if (!isDragging) moveToSlide(currentIndex + 1);
        }, 5000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();