/**
 * 3D Icons System
 * Creates and manages 3D icons using Three.js for consistent visual elements across pages
 */

const ThreeDIcons = {
  // Store all icon instances
  icons: {},
  
  // Configuration
  config: {
    defaultSize: 50,
    defaultColor: 0x4a9bff,
    defaultHighlightColor: 0x00d4ff,
    rotationSpeed: 0.005,
    hoverScale: 1.2,
    transitionSpeed: 0.3
  },
  
  /**
   * Initialize 3D icons system
   */
  init() {
    // Find all icon containers
    const iconContainers = document.querySelectorAll('.three-d-icon');
    
    if (iconContainers.length === 0) return;
    
    // Create each icon
    iconContainers.forEach(container => {
      const iconType = container.dataset.icon || 'cube';
      const size = parseInt(container.dataset.size || this.config.defaultSize, 10);
      const color = container.dataset.color || this.config.defaultColor;
      
      this.createIcon(container, iconType, size, color);
    });
    
    // Start animation loop
    this.animate();
    
    // Add event listeners
    this.addEventListeners();
  },
  
  /**
   * Create a 3D icon in the specified container
   */
  createIcon(container, iconType, size, color) {
    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Create geometry based on icon type
    let geometry, material, mesh;
    
    switch (iconType) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.7, 16, 16);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.7, 1.5, 16);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
        break;
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(0.7);
        break;
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(0.8);
        break;
      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(0.7);
        break;
      case 'ring':
        geometry = new THREE.RingGeometry(0.3, 0.7, 16);
        break;
      case 'knot':
        geometry = new THREE.TorusKnotGeometry(0.4, 0.1, 64, 8);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }
    
    // Create material
    material = new THREE.MeshStandardMaterial({
      color: parseInt(color, 16),
      metalness: 0.5,
      roughness: 0.2,
      emissive: parseInt(color, 16),
      emissiveIntensity: 0.2
    });
    
    // Create mesh
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Position camera
    camera.position.z = 2.5;
    
    // Store icon data
    this.icons[container.id] = {
      scene,
      camera,
      renderer,
      mesh,
      container,
      isHovered: false,
      originalScale: { x: 1, y: 1, z: 1 },
      targetScale: { x: 1, y: 1, z: 1 },
      originalRotation: { x: 0, y: 0, z: 0 },
      targetRotation: { x: 0, y: 0, z: 0 }
    };
  },
  
  /**
   * Animation loop for all icons
   */
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Update each icon
    Object.values(this.icons).forEach(icon => {
      // Smooth scale transition
      icon.mesh.scale.x += (icon.targetScale.x - icon.mesh.scale.x) * this.config.transitionSpeed;
      icon.mesh.scale.y += (icon.targetScale.y - icon.mesh.scale.y) * this.config.transitionSpeed;
      icon.mesh.scale.z += (icon.targetScale.z - icon.mesh.scale.z) * this.config.transitionSpeed;
      
      // Smooth rotation transition
      icon.mesh.rotation.x += (icon.targetRotation.x - icon.mesh.rotation.x) * this.config.transitionSpeed;
      icon.mesh.rotation.y += (icon.targetRotation.y - icon.mesh.rotation.y) * this.config.transitionSpeed;
      
      // Continuous rotation
      icon.mesh.rotation.y += this.config.rotationSpeed;
      
      // Render
      icon.renderer.render(icon.scene, icon.camera);
    });
  },
  
  /**
   * Add event listeners for interaction
   */
  addEventListeners() {
    Object.values(this.icons).forEach(icon => {
      // Mouse enter
      icon.container.addEventListener('mouseenter', () => {
        icon.isHovered = true;
        icon.targetScale = { 
          x: this.config.hoverScale, 
          y: this.config.hoverScale, 
          z: this.config.hoverScale 
        };
        
        // Change material color on hover
        icon.mesh.material.emissiveIntensity = 0.5;
        icon.mesh.material.color.set(this.config.defaultHighlightColor);
      });
      
      // Mouse leave
      icon.container.addEventListener('mouseleave', () => {
        icon.isHovered = false;
        icon.targetScale = icon.originalScale;
        
        // Restore original color
        icon.mesh.material.emissiveIntensity = 0.2;
        icon.mesh.material.color.set(parseInt(icon.container.dataset.color || this.config.defaultColor, 16));
      });
      
      // Mouse move for parallax effect
      icon.container.addEventListener('mousemove', (e) => {
        if (!icon.isHovered) return;
        
        const rect = icon.container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        icon.targetRotation = {
          x: y * 0.5,
          y: x * 0.5,
          z: 0
        };
      });
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      Object.values(this.icons).forEach(icon => {
        const size = parseInt(icon.container.dataset.size || this.config.defaultSize, 10);
        icon.renderer.setSize(size, size);
      });
    });
  },
  
  /**
   * Create a specific icon type and return the container element
   */
  createIconElement(iconType, size, color) {
    // Create container
    const container = document.createElement('div');
    container.className = 'three-d-icon';
    container.id = 'icon-' + Math.random().toString(36).substr(2, 9);
    container.dataset.icon = iconType;
    container.dataset.size = size || this.config.defaultSize;
    container.dataset.color = color || this.config.defaultColor;
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;
    
    // Create the icon
    this.createIcon(
      container, 
      iconType, 
      size || this.config.defaultSize, 
      color || this.config.defaultColor
    );
    
    return container;
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if Three.js is available
  if (typeof THREE !== 'undefined') {
    ThreeDIcons.init();
  }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThreeDIcons;
}