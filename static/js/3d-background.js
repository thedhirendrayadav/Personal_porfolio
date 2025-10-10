// ===================================
// 3D PARTICLE BACKGROUND FOR ENTIRE WEBSITE
// ===================================

(function() {
  'use strict';
  
  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded. 3D background disabled.');
    return;
  }
  
  // Configuration
  const config = {
    particleCount: 1000,
    particleSize: 2,
    particleColor: 0x667eea,
    connectionDistance: 150,
    mouseInfluence: 100,
    rotationSpeed: 0.0005,
    enableConnections: true,
    enableMouseInteraction: true
  };
  
  // Create canvas container
  const createCanvasContainer = () => {
    const container = document.createElement('div');
    container.id = '3d-background-canvas';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
      opacity: 0.6;
    `;
    document.body.insertBefore(container, document.body.firstChild);
    return container;
  };
  
  // Initialize scene
  let scene, camera, renderer, particles, particleSystem;
  let mouseX = 0, mouseY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;
  
  const init = () => {
    const container = createCanvasContainer();
    
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0008);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      3000
    );
    camera.position.z = 1000;
    
    // Particles
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    
    for (let i = 0; i < config.particleCount; i++) {
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000 - 1000;
      const z = Math.random() * 2000 - 1000;
      
      positions.push(x, y, z);
      
      velocities.push(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    
    // Material
    const material = new THREE.PointsMaterial({
      color: config.particleColor,
      size: config.particleSize,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    
    particles = geometry.attributes.position.array;
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Event listeners
    if (config.enableMouseInteraction) {
      document.addEventListener('mousemove', onMouseMove, false);
    }
    window.addEventListener('resize', onWindowResize, false);
    
    // Start animation
    animate();
  };
  
  const onMouseMove = (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.5;
    mouseY = (event.clientY - windowHalfY) * 0.5;
  };
  
  const onWindowResize = () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  
  const animate = () => {
    requestAnimationFrame(animate);
    render();
  };
  
  const render = () => {
    // Update particle positions
    const positions = particleSystem.geometry.attributes.position.array;
    const velocities = particleSystem.geometry.attributes.velocity.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      // Apply velocity
      positions[i] += velocities[i];
      positions[i + 1] += velocities[i + 1];
      positions[i + 2] += velocities[i + 2];
      
      // Boundary check
      if (positions[i] > 1000 || positions[i] < -1000) velocities[i] *= -1;
      if (positions[i + 1] > 1000 || positions[i + 1] < -1000) velocities[i + 1] *= -1;
      if (positions[i + 2] > 1000 || positions[i + 2] < -1000) velocities[i + 2] *= -1;
    }
    
    particleSystem.geometry.attributes.position.needsUpdate = true;
    
    // Rotate particle system
    particleSystem.rotation.y += config.rotationSpeed;
    
    // Mouse interaction
    if (config.enableMouseInteraction) {
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
    }
    
    renderer.render(scene, camera);
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  console.log('✨ 3D Background initialized!');
  
})();
